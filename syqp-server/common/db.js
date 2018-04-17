const logger=require('../common/log.js').getLogger('db.js');
const mongoose=require('mongoose');
var {User,Room}=require('./db_model.js');


module.exports.init=function(config,callback){
    let mongodb_url=`mongodb://${config.USER}:${config.PASSWORD}@${config.HOST}:${config.PORT}/${config.DATABASE}`;
    mongoose.connect(mongodb_url);

    mongoose.connection.on('connected',function(){
        logger.info('Mongoose connection open to ' + mongodb_url);
        callback(null,true)
    });
    
    mongoose.connection.on('error',function(err){
        logger.error('Mongoose connection error ' + err);
        callback(err,false)
    });
    
    mongoose.connection.on('disconnected',function(){
        logger.error('Mongoose connection disconnected');
        callback(null,false)
    });
};

//判断用户是否存在
module.exports.isUserExist=function(account,callback){
	User.isExist(account,callback);
}
//根据账号取用户
module.exports.findUserByAccount=function(account,callback){
    User.findOne({account,account},{_id:0,__v:0},callback);
}
//根据userId取用户
module.exports.findUserById=function(userId,callback){
    User.findOne({id:userId},{_id:0,__v:0},callback);
}
//创建用户
module.exports.createUser=function(obj,callback){
    let user=new User(obj);
    user.save(function(err,res){
        if(err) return callback(err,null);
        callback(null,obj)
    });
}
//更新用户
module.exports.updateUser=function(obj,callback){
	if(obj == null|| obj.account == null){
        return callback(new Error('invalid parameters'),null);
    }
    let where = {account:obj.account};
    let update = Object.assign({},obj);
    delete update.account;
    
    User.update(where,obj,function(err,res){
        if(err) return callback(err,null);
        callback(null,obj)
    });
}

//根据账号取房间号，没在房间返回null
module.exports.getRoomIdOfUser=function(userId,callback){
    User.findOne({id:userId},{__v:0},function(err,user){
        callback(err,user && user.roomId);
    });
}
//根据用户ID取账号余额
module.exports.getBalanceOfUser=function(userId,callback){
    User.findOne({id:userId},{__v:0},function(err,user){
        callback(err,user && user.balance || 0);
    });
}
//判断房间是否存在
module.exports.isRoomExist=function(roomId,callback){
	Room.isExist(roomId,callback);
}
//更新用户房间ID
module.exports.updateUsersRoomId=function(userIds,roomId,callback){
    let logic=[];
    userIds.forEach((val,i) => {
        logic[i]={id:val};
    });
    let where = {$or: logic};
    let update = {roomId:roomId};

    User.updateMany(where,update,function(err,res){
        callback(err,err?false:true)
    });
}
//创建房间
module.exports.createRoom=function(obj,callback){
    let room=new Room(obj);
    room.save(callback);
}

//删除房间
module.exports.deleteRoom=function(roomId,callback){
    Room.deleteOne({id:roomId},function(err,res){
        //res={ ok: 1, n: 1 }
        callback(err,err?false:true)
    })
}


//根据房间号取房间地址
module.exports.getRoomAddress=function(roomId,callback){
	Room.findOne({id:roomId},{id:1,ip:1,port:1,_id:0},callback);
}

//根据房间号取房间INFO
module.exports.getRoom=function(roomId,callback){
    //Room.findOne({id:id}).populate('ownerId').exec(callback);
    Room.findOne({id:roomId},{_id:0,__v:0},callback);
}


//根据房间号取房间并且更新房间IP与端口
module.exports.getRoomAndModifyIpPort=function(roomId,ip,port,callback){
    Room.findAndModify({id:roomId},[],{$set:{ip:ip,port:port}},{new:true,fields:{_id:0,__v:0}},function(err,res){
        callback(err,res.value);
    });
}
