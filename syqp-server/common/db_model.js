const logger=require('../common/log.js').getLogger('db_model.js');
const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var UserSchema=new Schema({
    id: { type:Number, min:100000, max:999999, required:true, unique:true },
    account: {type:String,required:true,unique:true},
    name: {type:String,required:true},
    sex: {type:Number},
    headImgUrl: {type:String},
    balance: {type:Number,min:0,default:0},
    roomId: {type:Number}
},{
    j: 1, w: 1, wtimeout: 10000
});

UserSchema.statics.isExist=function(account,callback){
    this.collection.findOne({account:account},function(err,res){
        callback(err,res?true:false);
    });
}

var RoomSchema=new Schema({
    id: { type:Number, min:100000, max:999999, required:true, unique:true},  //,sparse:true
    ip: { type:String, required:true },
    port: { type:Number, required:true },
    config:{ type:Object, required:true },
    seats: { type:Array },
    round: { type:Number, required:true ,default:0},   
    //creator:{ type:Schema.Types.ObjectId, required:true,ref:'User'},
    creator:{ type:Number, required:true },
    createdTime:{ type:Number,required:true}
    /*
    ownerId: {type:ObjectID},
    blind:{type:Number,default:0},
    entryFee:{type:Number,defalut:0},
    openFee:{type:Number,defalut:0},
    rounds:{type:Number,defalut:4},
    minUsers:{type:Number,defalut:2},
    maxUsers:{type:Number,defalut:4},
    */
},{
    j: 1,
    w: 1, 
    wtimeout: 10000,
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


var User=mongoose.model('User',UserSchema);
var Room=mongoose.model('Room',RoomSchema);


module.exports={
    User,
    Room
}