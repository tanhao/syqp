const logger=require('../common/log.js').getLogger('app.js');
const db=require('../common/db.js');
const config=require('../config.js');

//初始化数据库链接池
db.init(config.mongodb(),function(err,isConnected){
    if(isConnected){
        //启动游戏服务器节点与大厅服务器内部HTTP通信服务
        let nodeService=require('./node_service.js');
        nodeService.start(config.game_server());

        let serviceSocket=require('./socket_service.js');
        serviceSocket.start(config.game_server());

        /*
        db.getRoomAndModifyIpPort(159809,'127.0.0.1',777,function(err,room){
            if(err){
                logger.info(err);
                return;
            }
            logger.info(room)
        })
        

        var room={"id":531962,"ip":"127.0.0.1","port":8888,
                "config":{"people":4,"score":1000,"fee":1,"gift":100,"liudipai":false,"jipaiqi":false},
                "seats":[{"userId":null,"name":null,"headImgUrl":null,"score":0,"ready":false,"online":false,"index":0},
                         {"userId":null,"name":null,"headImgUrl":null,"score":0,"ready":false,"online":false,"index":1},
                         {"userId":null,"name":null,"headImgUrl":null,"score":0,"ready":false,"online":false,"index":2},
                         {"userId":null,"name":null,"headImgUrl":null,"score":0,"ready":false,"online":false,"index":3}],
                "creator":11,"createdTime":1521566213
        };
        db.createRoom(room,function(err,data){
            console.log(err);
            logger.info("FUCK:"+err)
            logger.info(data);
        })
        db.updateRoomRound(1768110,3,function(err,data){
            console.log(err,data);
        });
        
        db.updateRoomSeatInfo(852078,6,88,'tanhao','www.baidu.com',0,function(err,data){
            console.log(err,data);
        });
        
        let data={
            roomId:1111,
            round:1,
            baseInfo:{peng:2,diffeng:3},
            results:[1,2,3,45],
            actions:[1,'a',1,'b'],
            createdTime: Math.ceil(Date.now()/1000),
        }
        db.createGame(data,function(err,data){
            console.log(err,data);
        });
        */

    
    }
});
