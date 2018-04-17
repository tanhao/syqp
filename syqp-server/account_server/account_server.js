/*
用来处理账号注册，登录等请求
*/
const logger=require('../common/log.js').getLogger('account_service.js');
const crypto=require('../common/crypto.js');
const http=require('../common/http.js');
const db=require('../common/db.js');
const qs = require('querystring');
const express=require('express');
const waterfall = require("async/waterfall");

var app=express();
var config=null;
module.exports.start=function(cfg){
    config=cfg;
    app.listen(config.CLIENT_PORT);
    logger.info('Account service is listening on ' + config.ACCOUNT_IP + ':' + config.CLIENT_PORT);
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

/*
//注册
app.get('/register',function(req,res){
    let account=req.query.account;
    logger.info('account:' + account);
    db.is_user_exist(account,function(isExist){
        logger.info(account + ' isExist:' + isExist);
    })
    res.send("{abc:abc}");
});
*/

//服务器信息
app.get('/server_info',function(req,res){
	var ret = {
		version:config.VERSION,
        appweb:config.APP_WEB
	}
	http.send(res,0,'ok',ret);
});

//测试用登陆
app.get('/lingshi_auth',function(req,res){
    let account=req.query.account;
    let ip=http.getClientIp(req);
    let sign = crypto.md5(account + ip + config.ACCOUNT_PRIVATE_KEY);
    let ret={
        account:account,
        sign:sign,
        hallAddr:config.HALL_IP + ':' + config.HALL_CLIENT_PORT
    }
    http.send(res,0,'ok',ret);
});

//微信
app.get('/wechat_auth',function(req,res){
    function getAccessToken(callback){
        let code=req.query.code;
        let search = {
            appid:config.APP_INFO.AppID,
            secret:config.APP_INFO.AppSecret,
            code:code,
            grant_type:"authorization_code"
        };
        let url='https://api.weixin.qq.com/sns/oauth2/access_token?'+qs.stringify(search);
        http.get(url,function(err,data){
            if(err) return callback(err);
            if(data.errcode) return callback(new Error(data.errmsg));
            callback(null,data.access_token,data.openid);
        })
    }   
    function getUserInfo(access_token,openid,callback){
        let  search = {
            access_token:access_token,
            openid:openid
        };
        let  url='https://api.weixin.qq.com/sns/userinfo?'+qs.stringify(search);
        http.get(url,function(err,data){
            if(err) return callback(err);
            if(data.errcode) return callback(new Error(data.errmsg));
            callback(null,data);
        })
    }
    
    function createOrUpdateUser(obj,callback){
        var user={
            account: obj.openid,
            name: obj.nickname,
            sex: obj.sex,
            headImgUrl:obj.headimgurl,
        }
        db.isUserExist(user.account,function(err,isExist){
             if(err) return callback(err,null);
             if(isExist){
                db.updateUser(user,function(err,user){
                    callback(err,user);
               });
             }else{
                user.balance=config.REGISTER_BONUS;
                db.createUser(user,function(err,user){
                     callback(err,user);
                });
             }
        })
    }

    waterfall([
        getAccessToken,
        getUserInfo,
        createOrUpdateUser,
    ], function (err, result) {
        if(err){
            logger.error(err.message);
            http.send(res,-1,err.message);
            return;
        }
        let sign = crypto.md5(result.account + http.getClientIp(req) + config.ACCOUNT_PRIVATE_KEY);
        let ret={
            account:result.account,
            sign:sign,
            hallAddr:config.HALL_IP + ':' + config.HALL_CLIENT_PORT
        }
        http.send(res,0,'ok',ret);

    });
});