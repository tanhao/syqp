 
 module.exports.mysql=function(){
	return {
		HOST: 'localhost',
		USER: 'root',
		PASSWORD: 'power2450c',
		DATABASE: 'nodejs',
		PORT: 3306
	};
}

module.exports.mongodb=function(){
	return {
		//HOST: '192.168.88.60',
		HOST: '192.168.88.60',
		USER: 'nodejs',
		PASSWORD: 'nodejs000',
		DATABASE: 'nodejs',
		PORT: 27017
	};
}

//账号服务器配置
module.exports.account_server=function(){
	return {
		ACCOUNT_IP: '192.168.88.60',
		//与大厅服务器协商好的通信加密KEY
		ACCOUNT_PRIVATE_KEY: '^~!#_)*#$)%+&*#$%()@',
		//暴露给客户端的接口
		CLIENT_PORT: 9001,
		HALL_IP: '192.168.88.60',          
		HALL_CLIENT_PORT: 9002,
		APP_INFO:{
			AppID: 'wxb9a70de41759b91b',
			AppSecret: '95033cd0219d3d2c7bb04310f8b4b45f'
		},
		REGISTER_BONUS:100,
		VERSION:'20180306',
		APP_WEB:'http://fir.im/9r48',
	};
}

//大厅服务器配置
module.exports.hall_server=function(){
	return {
		HALL_IP: '192.168.88.60',
		//暴露给客户端的接口
		CLIENT_PORT: 9002,
		//暴露给游戏服务器的请求端口,用来与游戏服务器内部通信
		HALL_NODE_PORT: 8001,
		//与游戏服务器协商好的通信加密KEY
		HALL_PRIVATE_KEY:'~!@#$(*&^%$&',
		//与账号服务器协商好的通信加密KEY
		ACCOUNT_PRIVATE_KEY: '^~!#_)*#$)%+&*#$%()@',
	};
}

//游戏服务器配置
module.exports.game_server=function(){
	return {
		SERVER_ID: '001',
		
		//TICK的间隔时间，用于向大厅服汇报情况
		HTTP_TICK_TIME:5000,
		//大厅服务器暴露给游戏服务器的请求IP，用来接收服务器汇报情况
		HALL_IP: '192.168.88.60',
		//大厅服务器暴露给游戏服务器的请求端口，用来接收服务器汇报情况
		HALL_NODE_PORT: 8001,
		//游戏服务器IP
		SERVER_IP: '192.168.88.60',
		//暴露给大厅服务器的请求的端口,用来与大厅服务器内部通信
		SERVER_NODE_PORT: 8002,
		//与大厅服务器协商好的通信加密KEY
		HALL_PRIVATE_KEY:'~!@#$(*&^%$&',

		//暴露给客户端的socket连接IP与端口
		CLIENT_IP: '192.168.88.60',
		CLIENT_PORT: 8888,

	};
}