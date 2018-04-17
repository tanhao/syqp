/*
用来处理游戏服务器节点发来的请求，游戏服务器与大厅内部通宵
*/
const logger=require('../common/log.js').getLogger('hall_service.js');
const crypto=require('../common/crypto.js');
const http=require('../common/http.js');
const db=require('../common/db.js');
const qs = require('querystring');
const express=require('express');
const waterfall = require("async/waterfall");

var app=express();
var config=null;
//服务器节点map
const serverMap={};

module.exports.start = function(cfg){
    config = cfg;
    app.listen(config.HALL_NODE_PORT,config.HALL_IP);
    logger.info('Hall node service is listening on ' + config.HALL_IP + ':' + config.HALL_NODE_PORT);
}

//设置跨域访问
app.all('*',function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE');
    res.header('X-Powered-By', '3.2.1')
    res.header('Content-Type', "application/json;charset=utf-8");
    next();
});

//注册服务器节点
app.get('/register_node',function(req,res){
    let ip=http.getClientIp(req);
    let {load, clientIp, clientPort, nodePort } = req.query;
    clientPort=clientPort&&parseInt(clientPort);
    let id = clientIp+':'+clientPort;
    if(serverMap[id]){
        var server=serverMap[id];
        if( server.ip != ip || server.clientPort != clientPort || server.nodePort != nodePort ){
			logger.info('duplicate game server id: ' + id + ', ip: ' + ip + '(' + nodePort + ')');
			http.send(res,1,"duplicate game server id: " + id);
			return;
		}
        server.load = load;
        server.updatedTime=Date.now()
        http.send(res,0,'ok');
		return;
    }
    serverMap[id] = {
		ip:ip,
		id:id,
		clientIp:clientIp,
		clientPort:clientPort,
		nodePort:nodePort,
        load:load,
        updatedTime:Date.now()
    };
    http.send(res,0,'ok');
    //logger.info('game server registered.\n\tid:' + id + '\n\tip:' + ip + '\n\tnode port:' + nodePort + '\n\tsocket clientPort:' + clientPort);
    logger.info(`==>>Game server registered.{ id: ${id}, ip: ${ip}, nodePort:${nodePort}, socketClientPort:${clientPort} }<<==`);
});

//创建房间时选负载最低的服务器
function chooseServer(){
    let server=null;
    for(let s in serverMap){
        let logic=serverMap[s];
        //更新时间少与30秒当做服务器断线
        if(logic.updatedTime+30*1000>Date.now()){
            if(server == null){
                server = logic;
            }else{
                if(server.load>logic.load){
                    server=logic;
                }
            }
        }
        
    }
    return server;
}
module.exports.createRoom=function(userId,roomConfig,callback){
    let server = chooseServer();
    if(!server) return  callback(new Error('No server can be used'),null);
    waterfall([
        (callback)=>{
            //取用户余额
            db.getBalanceOfUser(userId,function(err,balance){
                if(err) return callback(err,null);
                let data={
                    userId:userId,
                    balance:balance,
                    config:roomConfig,
                    sign:crypto.md5(userId + roomConfig + balance  + config.HALL_PRIVATE_KEY)
                }
                callback(null,data);
            });
        },
        (data,callback)=>{
            //向游戏服务器请求创建房间
            let search=qs.stringify(data)
            let url=`http://${server.ip}:${server.nodePort}/create_room?${search}`;
            http.get(url,callback);
        }
    ],function(err,data){
        callback(err,data);
    });

}

module.exports.joinRoom=function(userId,name,headImgUrl,sex,roomId,callback){
    let sign = crypto.md5(userId + name + headImgUrl +sex+ roomId  + config.HALL_PRIVATE_KEY);
    let data={
        userId:userId,
        name:name,
        headImgUrl:headImgUrl,
        sex:sex,
        roomId:roomId,
        sign:sign
    };
    waterfall([
        (callback)=>{
            //取房间地址
            db.getRoomAddress(roomId,function(err,room){
                if(err) return callback(err,null);
                if(!room) return callback(new Error('room no exist.'),null);
                callback(null,room);
            });
        },
        (room,callback)=>{
            //取服务器
            //根据房间IP与端口找到服务器地址
            let id=room.ip + ':' + room.port;
            let server=serverMap[id];
            function chooseNewServer(){
                let server = chooseServer();
                if(!server) return  callback(new Error('no server can be used'),null);
                callback(null,server);
            }
            if(server){
                //如果服务器还在，验证房间是否还在运行
                let sign = crypto.md5(room.roomId + config.HALL_PRIVATE_KEY);
                let search=qs.stringify({roomId:room.roomId,sign:sign});
                let url=`http://${server.ip}:${server.nodePort}/is_room_runing?${search}`;
                http.get(url,function(err,data){
                    if(!err&&!data.errcode&&data.running) return callback(null,server);
                    chooseNewServer();
                });
            }else{
                //没找到服务器，重新取一个服务器
                chooseNewServer();
            }
        },
        (server,callback)=>{
            //向游戏服务器请求加入房间
            let search=qs.stringify(data);
            let url=`http://${server.ip}:${server.nodePort}/join_room?${search}`;
            http.get(url,function(err,data){
                if(err) return callback(err,null);
                if(data.errcode) return callback(new Error(data.errmsg),null);
                let now=Date.now();
                let ret={
                    roomId:roomId,
                    ip:server.clientIp,
                    port:server.clientPort,
                    token:data.token,
                    time:now,
                    sign:crypto.md5(roomId + data.token + now + config.HALL_PRIVATE_KEY)
                }
                callback(null,ret);
            });
        },
        (data,callback)=>{
            //更新用户状态
            db.updateUsersRoomId([userId],roomId,function(err,i){
                if(err) return callback(err,null);
                callback(null,data);
            });
        }
    ],function(err,data){
        callback(err,data);
    });
}