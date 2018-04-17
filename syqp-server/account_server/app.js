const logger=require('../common/log.js').getLogger('app.js');
const db=require('../common/db.js');
const config=require('../config.js');

//初始化数据库链接池
db.init(config.mongodb(),function(err,isConnected){
	if(isConnected){
		//启动账号服务
		let accountService=require('./account_server.js');
		accountService.start(config.account_server());

		/*
        db.getRoomId(function(err,roomId){
            logger.info('room:'+roomId);
        })
		
		db.isUserExist('wx_asdfasdlf',function(err,isExist){
			logger.info('isExist:'+isExist);
		});
		*/
		/*
		var user={
			account:'wx_oy4oyvy09TL3NWxfjIZDfol2VyWo',
			name:'tanhao',
			sex:1,
			headImgUrl:'http://thirdwx.qlogo.cn/mmopen/vi_32/TUMtkaIMdbGOh6x0YiaeD7V7p1FV2RIh488cgQM4mkDXUTp7fEXAvbiaLnOZPq02D1bcmcmdreJSBRPu9Ouc87Uw/132',
		}
		db.updateUser(user,function(err,isSucceed){
			if(err){
				logger.info(err); 
				return ;
			}
			logger.info('isSucceed:'+isSucceed);
		});
		*/

		/*		
		var user={
			id:100000,
			account:'oy4oyv4IBaxtkPjSq9ee4w42QazA',
			name:'zhiyuan',
			sex:1,
			balance:800,
			headImgUrl:'http://thirdwx.qlogo.cn/mmopen/vi_32/yRMlybhILtPMrSOz5Bo7zkF94HEaJqYE6hZvaPpGAqlJnJO0sjSJ2lJqhZiaFcSrLNaicfYzDbbtPySaQCxJxCUg/132'
		};

		var user2={
			id:100001,
			account:'oy4oyvy09TL3NWxfjIZDfol2VyWo',
			name:'tanhao',
			sex:1,
			balance:700,
			headImgUrl:'http://thirdwx.qlogo.cn/mmopen/vi_32/TUMtkaIMdbGOh6x0YiaeD7V7p1FV2RIh488cgQM4mkDXUTp7fEXAvbiaLnOZPq02D1bcmcmdreJSBRPu9Ouc87Uw/132',
		};

		db.createUser(user2,function(err,isSucceed){
			if(err){
				logger.info(err); 
				return ;
			}
			logger.info('isSucceed:'+isSucceed);
		})
		*/
		
	}
});






