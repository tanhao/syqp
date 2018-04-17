const logger=require('../common/log.js').getLogger('app.js');
const db=require('../common/db.js');
const config=require('../config.js');

const mongoose=require('mongoose');
//初始化数据库链接池
db.init(config.mongodb(),function(err,isConnected){
	if(isConnected){
		//启动大厅节点通讯服务，用来与游戏服务器内部通信
        let hallService=require('./hall_service.js');
        hallService.start(config.hall_server());
        //启动大厅房间服务
        let clientService=require('./client_service.js');
        clientService.start(config.hall_server());

        /*
        let ownerId=mongoose.Types.ObjectId('5a6ef5aaaacefc3ab8445e33');
        let room={
            roomId:888888,
            ip:'127.0.0.1',
            port:8888,
            config:{name:'test'},
            ownerId:ownerId,
            createdTime:new Date().getTime()
        }
        db.createRoom(room,function(err,room){
            logger.info(err+'='+room);
        })
        db.getRoom(888888,function(err,isSucceed){
            logger.info(isSucceed);
        });
   
		db.updateUsersRoomId(['5a6ef5aaaacefc3ab8445e33','5a6f1ba853b4c4176cca19c3'],888888,function(err,isSucceed){
			logger.info(isSucceed);
        });

        db.findUserByAccount('wx_bWzlAgKUqN6R8wQHpzP6Q',function(err,user){
            logger.info(user);
        })
        db.getRoomIdOfUser('5a6f1ba853b4c4176cca19c3',function(err,roomId){
            logger.info(roomId==null);
            logger.info(roomId);
           
        })
        let user={
            account:'wx_bWzlAgKUqN6R8wQHpzP6Q',
            name:'tanhao'
        }
        */
        
	}
});

