const logger=require('../common/log.js').getLogger('room_manager.js');
const crypto=require('../common/crypto.js');
const mongoose=require('mongoose');
const db=require('../common/db.js');
const manager = require("./game_manager_dtz.js");

var rooms = {};
//存放用户在那个房间那个座位
var locations = {};

function generateRoomId(){
	let roomId = "";
	for(let i = 0; i < 6; ++i){
        let tmp=Math.floor(Math.random()*10);
        if(i==0&&tmp==0){
            --i;
            continue;
        };
		roomId +=tmp;
	}
	return parseInt(roomId);
}

module.exports.createRoom=function(creator,config,balance,ip,port,callback){
    let success=manager.checkConfig(config);
    if(!success) return  callback(new Error('config invalid parameters'),null);

    if((config.fee==1&&balance<40)||(config.fee==2&&balance<10)){
        return callback(new Error("钻石不足，创建房间失败!"),null);
    }
    
    //验证房间配置
    let fnCreate=function(){
        let roomId=generateRoomId();
        if(rooms[roomId]) return fnCreate();
        db.isRoomExist(roomId,function(err,isExist){
            if(err||isExist) return fnCreate();
            let room={
                id:roomId,
                ip:ip,
                port: port,
                config:config,
                seats: manager.initSeats(),
                //creator:mongoose.Types.ObjectId(creator),
                creator:creator,
                createdTime: Math.ceil(Date.now()/1000)
            };
            db.createRoom(room,function(err,data){
                if(err) return callback(err,null);
                rooms[roomId]=data;
                rooms[roomId].manager=manager;
                callback(null,roomId);
            })
        });
    }
    fnCreate();
}

module.exports.joinRoom = function(userId,name,headImgUrl,sex,roomId,ip,port,callback){
    let fnTakeSeat=function(room){
        if(module.exports.getUserRoomId(userId) == roomId){
			return true;
        }
        let idleSeats=[];
        for(let i=0;i<room.seats.length;i++){
            if(room.seats[i].userId==null){
                idleSeats.push(room.seats[i].index);
            }
        }
        
        if(idleSeats.length==0){
            return false;
        }
        let index=Math.floor(Math.random()*idleSeats.length);
        let seatIndex=idleSeats[index];
        let seat=room.seats[seatIndex];
        //seat.userId=mongoose.Types.ObjectId(userId);
        seat.userId=userId;
        seat.name=name;
        seat.headImgUrl=headImgUrl;
        seat.sex=sex;
        seat.score=0;
        locations[userId]={
            roomId:roomId,
            seatIndex:seatIndex
        }
        return true;        
    }
    let room = rooms[roomId];
    if(room){
        //如果房间存在，选一个座位
        if(!fnTakeSeat(room)) return  callback(new Error('room is full'),null);
        callback(null,room);
    }else{
        db.getRoomAndModifyIpPort(roomId,ip,port,function(err,room){
            if(err) return callback(err,null);
            if(!room) return callback(new Error('room no exist'),null);
            //根据DB的数据还原room
            //console.log("根据DB的数据还原room",manager);
            rooms[roomId]=room;
            rooms[roomId].manager=manager;
            if(!fnTakeSeat(room)) return  callback(new Error('room is full'),null);
            callback(null,room);
        })
    }
}

module.exports.getRoom = function(roomId){
	return rooms[roomId];
};

module.exports.getUserRoomId= function(userId){
    let location = locations[userId];
    return location && location.roomId;
};

module.exports.getUserSeatIndex = function(userId){
    let location = locations[userId];
    return location && location.seatIndex;
};

module.exports.setUserIp = function(userId,ip){
    let roomId=module.exports.getUserRoomId(userId);
    if(roomId == null) return;
    let room=module.exports.getRoom(roomId);
    if(room == null) return;
    let seatIndex=module.exports.getUserSeatIndex(userId);
    if(seatIndex == null) return;
    room.seats[seatIndex].ip=ip;
};

module.exports.setUserOnline = function(userId,isOnline){
    let roomId=module.exports.getUserRoomId(userId);
    if(roomId == null) return;
    let room=module.exports.getRoom(roomId);
    if(room == null) return;
    let seatIndex=module.exports.getUserSeatIndex(userId);
    if(seatIndex == null) return;
    room.seats[seatIndex].online=isOnline;
};

module.exports.setReady = function(userId,isReady){
    let roomId=module.exports.getUserRoomId(userId);
    if(roomId == null) return;
    let room=module.exports.getRoom(roomId);
    if(room == null) return;
    let seatIndex=module.exports.getUserSeatIndex(userId);
    if(seatIndex == null) return;
    room.seats[seatIndex].ready=isReady;
};


module.exports.getTotalRooms = function(){
	return Object.keys(rooms).length+2;
}

module.exports.isCreator = function(roomId,userId){
    var room = rooms[roomId];
    if(!room) return false;
	return room.creator == userId;
};

module.exports.destroyRoom = function(roomId){
    var room=rooms[roomId];
    if(!room) return;
    var userIds=[];
    for(var i=0;i<room.seats.length;i++){
        var userId=room.seats[i].userId;
        if(userId){
            userIds.push(userId);
            delete locations[userId];
        }
    }
    db.updateUsersRoomId(userIds,null,function(err,res){});
    delete rooms[roomId];
    db.deleteRoom(roomId,function(err,res){});
};

module.exports.leaveRoom = function(userId){
   
    var location=locations[userId];
    if(!location) return;
    var roomId=location.roomId;
    var seatIndex=location.seatIndex;
    var room=rooms[roomId];
    delete locations[userId];
    if(room==null||seatIndex==null) return;
    var seat=room.seats[seatIndex];
    seat.userId=null;
    seat.name=null;
    seat.headImgUrl=null;
    seat.sex=null;
    seat.score=null;
    seat.ready=false;
    seat.online=false;
    seat.ip=null;

    var peoples=0;
    room.seats.forEach(seat => {
        peoples+=seat.userId?1:0;
    });
    db.updateUsersRoomId([userId],null,function(err,res){
         logger.info(userId+" leave room "+roomId)
    })

    if(peoples==0){
        module.exports.destroyRoom (roomId);
    }
}

