const logger=require('../common/log.js').getLogger('token_manager.js');
const crypto=require('../common/crypto.js');

var users={};
var tokens={};

module.exports.createToken=function(userId,lifeTime){
    let token=users[userId];
    if(token) this.delToken(token);
    let time=Date.now();
    token=crypto.md5(userId+'.ow(*1&%52^&1Q$_8)Q$6*&(!"'+time);
    tokens[token]={
        userId:userId,
        time:time,
        lifeTime:lifeTime
    };
    users[userId]=token;
    return token;
}

module.exports.getToken = function(userId){
	return users[userId];
};

module.exports.getUserID = function(token){
	return tokens[token].userId;
};

module.exports.isTokenValid = function(token){
	var info = tokens[token];
	if(info == null){
		return false;
	}
	if(info.time + info.lifetime < Date.now()){
		return false;
	}
	return true;
};

module.exports.delToken=function(token){
    let info=tokens[token];
    if(info){
        delete tokens[token];
        delete users[info.userId];
    }
}