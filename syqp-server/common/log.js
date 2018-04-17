//cnpm install -g log4js
const log4js = require('log4js');
log4js.configure({
  	appenders: {
	  	dateFile: {
	  		type: 'console',			 	 //console,file,dateFile
	  		filename:'logs/',
	  		pattern: 'yyyy-MM-dd.log',       //表示一个文件的时间命名格式，只有配合datefile才起作用
			alwaysIncludePattern: true,      //表示日志是否包含命名格式，只有配合datefile才起作用
  		}
  	},
  	categories: {
  		default: {
  			appenders: ['dateFile'],
  			level: 'debug'
  		}
  	}
});

module.exports={
	getLogger:function(fileName){
		return log4js.getLogger(fileName);
	}
}