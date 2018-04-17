const logger=require('../common/log.js').getLogger('node_service.js');
const crypto=require('../common/crypto.js');
const http=require('../common/http.js');
const db=require('../common/db.js');
const qs = require('querystring');
const express=require('express');
const roomManager=require('./room_manager.js');
const tokenManager=require('./token_manager.js');

var app=express();
var config=null;
var serverInfo=null;

var lastTickTime = 0;
//向大厅服定时心跳
function heartbeat(){
    if(lastTickTime + config.HTTP_TICK_TIME < Date.now()){
        lastTickTime = Date.now();
        serverInfo.load=roomManager.getTotalRooms();
        let search=qs.stringify(serverInfo);
        let url=`http://${config.HALL_IP}:${config.HALL_NODE_PORT}/register_node?${search}`;
        http.get(url,function(err,data){
            if(err){
                lastTickTime=0;
                logger.error(err.message);
                return;
            }
            //logger.info('heartbeat:'+JSON.stringify(data));
        });
        let mem = process.memoryUsage();
		let format = function(bytes) {  
              return (bytes/1024/1024).toFixed(2)+'MB';  
        }; 
		//logger.info('Process: heapTotal '+format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));

    }
}

module.exports.start=function(cfg){
    config=cfg;
    serverInfo={
        id:config.SERVER_IP,
        clientIp:config.CLIENT_IP,
        clientPort:config.CLIENT_PORT,
        nodePort:config.SERVER_NODE_PORT,
        load:roomManager.getTotalRooms()
    };
    setInterval(heartbeat,1000);
    app.listen(config.SERVER_NODE_PORT,config.SERVER_IP);
    logger.info('Game node service is listening on ' + config.SERVER_IP + ':' + config.SERVER_NODE_PORT);
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

//创建房间,与大厅通信
app.get('/create_room',function(req,res){
    let {userId, sign, balance, config:roomConfig} = req.query;
    if(userId == null || sign == null || roomConfig == null || balance ==null){
		http.send(res,-2,"invalid parameters");
		return;
    }
    let nodeSign = crypto.md5(userId + roomConfig + balance  + config.HALL_PRIVATE_KEY); 
    if(nodeSign!=sign){
        http.send(res,-2,'sign failed');
        return;
    }
    let roomJson=JSON.parse(roomConfig);
    roomManager.createRoom(userId,roomJson,balance,config.CLIENT_IP,config.CLIENT_PORT,function(err,roomId){
         if(err) return http.send(res,-2,err.message);
         http.send(res,0,'ok',{roomId:roomId});
    });
});

//加入房间,与大厅通信
app.get('/join_room',function(req,res){
    let {userId, name, headImgUrl,sex, roomId, sign} = req.query;
    roomId = roomId&&parseInt(roomId);
    if(userId == null || sign == null || roomId ==null){
		http.send(res,-2,"invalid parameters");
		return;
    }
    let nodeSign = crypto.md5(userId + name + headImgUrl + sex + roomId  + config.HALL_PRIVATE_KEY); 
    if(nodeSign!=sign){
        http.send(res,-2,'sign failed');
        return;
    }
    roomManager.joinRoom(userId,name,headImgUrl,sex,roomId,config.CLIENT_IP,config.CLIENT_PORT,function(err,room){
        if(err)return http.send(res,-2,err.message);
        let token=tokenManager.createToken(userId,5000);
        http.send(res,0,'ok',{token:token});
    });
    
   
});
//判断房间是否还在运行,与大厅通信
app.get('/is_room_runing',function(req,res){
    let {roomId, sign} = req.query;
    roomId = roomId&&parseInt(roomId);
	if(roomId == null || sign == null){
		http.send(res,-2,"invalid parameters");
		return;
	}
	var nodeSign = crypto.md5(roomId + config.HALL_PRIVATE_KEY);
	if(nodeSign != sign){
		http.send(res,-2,"sign failed");
		return;
    }
    let room=roomManager.getRoom(roomId);
	http.send(res,0,"ok",{runing:room?true:false});
});
