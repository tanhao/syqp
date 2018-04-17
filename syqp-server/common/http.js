const logger=require('../common/log.js').getLogger('http');
const http=require('http');
const https=require('https');
const { URL } =require('url');

module.exports.send = function(res,errcode,errmsg,data){
    let ret={
        errcode:errcode,
        errmsg: errmsg,
    };
    if(data){
        ret=Object.assign(ret,JSON.parse(JSON.stringify(data)));
    }
	var jsonstr = JSON.stringify(ret);
	res.send(jsonstr);
};

module.exports.getClientIp = function(req){
    var ip;  
    var forwardedIpsStr = req.header('x-forwarded-for');   
    if (forwardedIpsStr) {  
        var forwardedIps = forwardedIpsStr.split(',');  
        ip = forwardedIps[0];  
    }  
    if (!ip) {  
        ip = req.connection.remoteAddress;  
    }  
    return ip.replace('::ffff:',''); 
};

module.exports.get=function(url,callback){
    let myURL=new URL(url);
    if(myURL.protocol!=='https:' && myURL.protocol!=='http:'){
        return callback(new Error(`Protocol ${myURL.protocol} not supported`),null);
    }
    let protocol=myURL.protocol==='https:'?https:http;
    let req=protocol.get(url,function(res){
        res.setEncoding('utf8');  
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
		res.on('end',()=>{
            try {
                let json = JSON.parse(rawData);
                callback(null,json);
            } catch (e) {
                logger.error(e);
                callback(new Error(e.message),null);
            }
		});
    });
    req.end();
	req.on('error',function(err){
		callback(err,null);
	});
}

module.exports.post=function(){
	
}