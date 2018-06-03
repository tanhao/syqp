const logger=require('../common/log.js').getLogger('db_model.js');
const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var UserSchema=new Schema({
    id: { type:Number, min:100000, max:999999, required:true, unique:true },
    account: {type:String,required:true,unique:true},
    name: {type:String,required:true},
    sex: {type:Number},
    headImgUrl: {type:String},
    gems: {type:Number,min:0,default:0},
    coins: {type:Number,min:0,default:0},
    roomId: {type:Number},
    history: { type:Array }
},{
    j: 1, w: 1, wtimeout: 10000
});

UserSchema.statics.isExist=function(account,callback){
    this.collection.findOne({account:account},function(err,res){
        callback(err,res?true:false);
    });
}

var RoomSchema=new Schema({
    id: { type:Number, min:1000, max:9999, required:true, unique:true},  //,sparse:true
    ip: { type:String, required:true },
    port: { type:Number, required:true },
    config:{ type:Object, required:true },
    seats: { type:Array },
    /*
    seats:[
        {userId : Number,name : String, headImgUrl: String,sex: Number}
    ],
    */
    round: { type:Number, required:true ,default:0},   //现在第几局
    banker: { type:Number,required:true },   //下把庄的seatIndex，当为空时随机庄
    //creator:{ type:Schema.Types.ObjectId, required:true,ref:'User'},
    creator:{ type:Number, required:true },   //房主ID
    createdTime:{ type:Number,required:true}
},{
    j: 1,w: 1, wtimeout: 10000,
    //timestamps: { createdAt: 'createdTime',updatedAt: 'updatedTime' } 
});

RoomSchema.statics.isExist=function(roomId,callback){
    this.collection.findOne({id:roomId},function(err,res){
        callback(err,res?true:false);
    });
}


RoomSchema.statics.findAndModify=function(query, sort, doc, options, callback){
    this.collection.findAndModify(query, sort, doc, options, callback);
}

//游戏记录
var GameSchema=new Schema({
    roomId: { type:Number, required:true },   //房间ID
    round:{ type:Object, required:true },     //第几局
    baseInfo:{ type:Object, required:true },  //每一局开始前的基本信息
    results: { type:Array },    //输赢集合
    actions: { type:Array },    //操作记录
    createdTime:{ type:Number,required:true}
},{
    j: 1,w: 1, wtimeout: 10000,
});

//计数器
var CounterSchema=new Schema({
    sequenceValue: { type:Number, min:100000, max:999999, required:true, unique:true },
    sequenceName: {type:String,required:true,unique:true}
},{
    j: 1, w: 1, wtimeout: 10000
});

CounterSchema.statics.getNextSequenceValue=function(sequenceName,callback){
    this.collection.findAndModify({sequenceName: sequenceName},[],{$inc:{sequenceValue:1}},{new:true,fields:{_id:0,__v:0}},callback);
}

CounterSchema.statics.isExist=function(sequenceName,callback){
    this.collection.findOne({sequenceName:sequenceName},function(err,res){
        callback(err,res?true:false);
    });
}

var User=mongoose.model('User',UserSchema);
var Room=mongoose.model('Room',RoomSchema);
var Game=mongoose.model('Game',GameSchema);
var Counter=mongoose.model('Counter',CounterSchema);

module.exports={
    User,
    Room,
    Game,
    Counter,
}