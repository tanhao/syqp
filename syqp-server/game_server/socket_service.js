const logger=require('../common/log.js').getLogger('socket_service.js');
const crypto=require('../common/crypto.js');
const db=require('../common/db.js');
const tokenManager=require('./token_manager.js');
const roomManager=require('./room_manager.js');
const userManager=require('./user_manager.js');


var io=null;

module.exports.start=function(config){
     io = require('socket.io')();
     io.set('authorization', function (handshake, accept) {
        let {roomId,token,time,sign}=handshake._query;
        //logger.info(roomId,token,time,sign);
        roomId=roomId&&parseInt(roomId);
        time=time&&parseInt(time);
        //logger.info(token,roomId,sign,time);
        //检查参数合法性
        if(token == null || roomId == null || sign == null || time == null){
            accept('invalid parameters', false);
            return;
        }
        //检查参数是否被篡改
        var socketSign = crypto.md5(roomId + token + time + config.HALL_PRIVATE_KEY);
		if(socketSign != sign){
            accept('sign failed', false);
			return;
        }
        //检查token是否有效
		if(tokenManager.isTokenValid(token)==false){
            accept('token invalid.', false);
			return;
        }
        //检查房间合法性
        let userId=tokenManager.getUserID(token);
        roomId=roomManager.getUserRoomId(userId);
        if(userId == null || roomId == null){
            accept('enter room failed.', false);
			return;
        }
        accept(null, true);
     });
     io.on('connection',function(socket){
        let {token} = socket.handshake.query;
        let userId = tokenManager.getUserID(token);
        let roomId = roomManager.getUserRoomId(userId);
        let ip = socket.handshake.address.replace('::ffff:','');
        //logger.info('connection=>',token,userId,roomId);
        let isExist=userManager.isExist(userId); 
        userManager.bind(userId,socket);
        //设置用户IP
        roomManager.setUserIp(userId,ip);
        //返回房间信息
        let room = roomManager.getRoom(roomId);

        for(let i=0;i<room.seats.length;i++){
            if(room.seats[i].userId!=null){
                logger.info(userManager.isOnline(room.seats[i].userId));
                room.seats[i].online=userManager.isOnline(room.seats[i].userId);
            }
        }

        let initData={
            roomId:room.id,
            config:room.config,
            round:room.round,
            seats:room.seats,
            creator:room.creator
        }
        socket.userId=userId;
        socket.manager=room.manager;
        socket.emit('init_room',initData);
        socket.manager.syncPush(userId);
        //玩家上线，强制设置为TRUE
        //socket.manager.setReady(userId);

        if(isExist){
            //通知其它客户端
            userManager.broacastInRoom('online_push',{userId:userId},userId,false);
        }else{
            //通知其它客户端
            let newUserData=room.seats.find(seat=>seat.userId==userId);
            userManager.broacastInRoom('join_push',newUserData,userId,false);
        }
        //离开房间
        socket.on('leave',function(data){
            var userId = socket.userId;
            if(!userId) return;
            var roomId=roomManager.getUserRoomId(userId);
            if(!roomId) return;
            //如果游戏已经开始，则不可以
			if(socket.manager.isBegin(roomId)) return;
            //如果是房主，则只能走解散房间
            if(roomManager.isCreator(roomId,userId)) return;
            //通知其它玩家，有人退出了房间
          
            userManager.broacastInRoom('leave_push',{userId:userId},userId,false);
            roomManager.leaveRoom(userId);
            userManager.deleteUser(userId);
         
            socket.emit('leave_result');
            socket.disconnect();
        });
        //解散房间,只有房主在游戏没开始前才能解散房间
        socket.on('dissolve',function(data){
            var userId=socket.userId;
            if(!userId) return;
            var roomId=roomManager.getUserRoomId(userId);
            if(!roomId) return;
            //如果游戏已经开始，则不可以
            if(socket.manager.isBegin(roomId)) return;
            //只有房主才能解散房间
            if(!roomManager.isCreator(roomId,userId)) return;
            userManager.broacastInRoom('dissolve_push',{},userId,true);
            userManager.kickAllInRoom(roomId);
            roomManager.destroyRoom(roomId);
            socket.disconnect();
        });
        //准备
        socket.on('ready',function(data){
            var userId=socket.userId;
            logger.info("ready:"+userId)
            if(!userId) return;
            socket.manager.setReady(userId);
            //logger.info("ready done.");
            userManager.broacastInRoom('ready_push',{userId:userId,ready:true},userId,false);
            socket.emit('ready_result');
        });
        //快速聊天
		socket.on('quick_chat',function(data){
            var userId=socket.userId;
            if(!userId) return;
            userManager.broacastInRoom("quick_chat_push",{userId:userId,idx:data},userId,true)
        });
        //表情
		socket.on('emoji',function(data){
            var userId=socket.userId;
            if(!userId) return;
            userManager.broacastInRoom("emoji_push",{userId:userId,idx:data},userId,true)
        });
         //语音表情
		socket.on('voice',function(data){
            var userId=socket.userId;
            if(!userId) return;
            userManager.broacastInRoom("voice",{userId:userId,idx,data},userId,true)
        });
        //断开链接
		socket.on('disconnect',function(data){
            logger.info(socket.userId+" disconnect !!!");
            let userId=socket.userId;
            if(!userId) return;
            let roomId=roomManager.getUserRoomId(userId);
            if(!roomId) return;
            userManager.broacastInRoom('offline_push',{userId:userId},userId,false);
            userManager.deleteUser(userId);
            socket.userId = null;
        });
        //ping
        socket.on('th-ping',function(data){
            let userId = socket.userId;
			if(!userId){
				return;
            }
            socket.emit('th-pong');
        });
        //出牌
		socket.on('chupai',function(data){
            let userId=socket.userId;
            if(!userId) return;
            let pai = -1;
			if(typeof(data) == "number"){
				pai = data;
			}else if(typeof(data) == "string"){
				pai = parseInt(data);
			}else{
				logger.info("chupai:invalid param");
				return;
			}
			socket.manager.chupai(socket.userId,pai);
        });
        //吃
		socket.on('chi',function(data){
            let userId=socket.userId;
            if(!userId) return;
            let pais = data.split(',');
			if(!pais||pais.length!=3){
				logger.info("chi:invalid param");
				return;
            }
            pais.forEach((pai,idx) => {
                pais[idx]=parseInt(pai);
            });
            socket.manager.chi(socket.userId,pais);
        });
        //碰
		socket.on('peng',function(data){
            let userId=socket.userId;
            if(!userId) return;
            socket.manager.peng(socket.userId);
        });
        //杠
		socket.on('gang',function(data){
            let userId=socket.userId;
            if(!userId) return;
            let pai = -1;
			if(typeof(data) == "number"){
				pai = data;
			}else if(typeof(data) == "string"){
				pai = parseInt(data);
			}else{
				logger.info("gang:invalid param");
				return;
            }
            socket.manager.gang(socket.userId,pai);
        });
        //胡
		socket.on('hu',function(data){
            let userId=socket.userId;
            if(!userId) return;
            socket.manager.hu(socket.userId);
        });
        //过
		socket.on('guo',function(data){
            let userId=socket.userId;
            if(!userId) return;
            socket.manager.guo(socket.userId);
        });
        
        
     });
     io.listen(config.CLIENT_PORT);
     logger.info('Game socket service is listening on ' + config.SERVER_IP + ':' + config.CLIENT_PORT);
}