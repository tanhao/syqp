const logger=require('../common/log.js').getLogger('game_dtz.js');
const roomManager=require('./room_manager.js');
const userManager=require('./user_manager.js');


var games = {};
var users={};
//取麻将类型
function getMjType(id){
    if(id >= 0 && id < 9){
        //筒
        return 0;
    }
    else if(id >= 9 && id < 18){
        //条
        return 1;
    }
    else if(id >= 18 && id < 27){
        //万
        return 2;
    }else if(id >= 27 && id < 34){
        //风
        return 3;
    }
}
//洗牌
function shuffle(game) {
    var mjs = game.mjs;
    //筒 (0 ~ 8 表示筒子)
    var index = 0;
    for(var i = 0; i < 9; ++i){
        for(var c = 0; c < 4; ++c){
            mjs[index] = i;
            index++;
        }
    }
    //条 (9 ~ 17表示条子)
    for(var i = 9; i < 18; ++i){
        for(var c = 0; c < 4; ++c){
            mjs[index] = i;
            index++;
        }
    }
    //万 (18 ~ 26表示万)
    for(var i = 18; i < 27; ++i){
        for(var c = 0; c < 4; ++c){
            mjs[index] = i;
            index++;
        }
    }
    //风 (27 ~ 33表示 东南酉北中发白)
    for(var i = 27; i < 34; ++i){
        for(var c = 0; c < 4; ++c){
            mjs[index] = i;
            index++;
        }
    }
    //打乱顺序
    mjs.sort(function(){ return 0.5 - Math.random() });
}
//摸牌
function mopai(game,seatIndex){
    //剩余20个不能摸牌
    if(game.mjci==game.mjs.length-20){
        return -1;
    }
    let data = game.seats[seatIndex];
    let holds = data.holds;
    let pai =game.mjs[game.mjci];
    holds.push(pai);
    let count=data.mjmap[pai];
    if(count==null){ count=0; }
    data.mjmap[pai]=count+1;
    game.mjci++;
    return pai;
}
//发牌
function deal(game){
    game.mjci=0;
    //每人13张  庄家多一张
    let seatIndex = game.bank;
    let numOfSeats=game.seats.length;
    let count =numOfSeats*13;
    for(let i = 0; i < count; ++i){
        let mjs = game.seats[seatIndex].holds;
        mopai(game,seatIndex);
        seatIndex ++;
        seatIndex %= numOfSeats;
    }
    //庄家多摸最后一张
    mopai(game,game.bank);
    
}
//检查是否可以暗杠
function checkCanAnGang(game,seatData){

}
//检查是否可以点杠
function checkCanDainGang(){

}
//检查是否可以明杠
function checkCanMingGang(){

}
//检查是否可以碰
function checkCanPeng(){
    
}
//检查是否可以吃
function checkCanChi(){
    
}
//检查是否可以胡
function checkCanHu(){
    
}
///开房间时验证balance
module.exports.checkBalance=function(config,balance){
    if((config.payment=='FZ'&&((config.round==8&&balance<8)||(config.round==12&&balance<12)||(config.round==16&&balance<16)))||(config.payment=='FZ'&&((config.round==8&&balance<2)||(config.round==12&&balance<3)||(config.round==16&&balance<4)))){
        return false;
    }
    return true;
}
//开房间时验证配置
module.exports.checkConfig=function(config){
   
    if(config.people == null
    || config.round == null
    || config.payment == null
    || config.difen == null
    || config.zuozhuang == null 
    || config.fengding == null
    || config.ctdsq == null ){
        return false;
    }
    config.people=parseInt(config.people);
    config.difen=parseInt(config.difen);
    config.fengding=parseInt(config.fengding);
    if(config.people != 4 && config.people != 3 && config.people != 2){
        return false;
    }

    if(config.round != 8 && config.round != 12 && config.round != 16){
        return false;
    }
    if(config.payment != 'FZ' && config.payment != 'AA'){
        return false;
    }
    if(config.difen != 1 && config.difen != 2 && config.difen != 5){
        return false;
    }
    if(config.zuozhuang != 'QZ' && config.zuozhuang != 'LZ'){
        return false;
    }
    if(config.fengding != 32 && config.fengding != 64 && config.fengding != 128){
        return false;
    }
    return true;
}
//生成座位初始化信息
module.exports.initSeats=function(config){
    let seats=[]; 
    for(let i=0;i<config.people;i++){
        seats.push({
            userId:null,
            name:null,
            headImgUrl:null,
            sex:null,
            score:null,
            ready:false,
            online:false,
            index:i,
            ip:null
        })
    }
    return seats;
}
module.exports.isBegin=function(roomId){
    let game=games[roomId];
    if(game) return true;
    let room=roomManager.getRoom(roomId);
    if(room) return room.round>0;
    return false;
}
module.exports.setReady=function(userId){
    let roomId=roomManager.getUserRoomId(userId);
    if(roomId==null) return;
    let room=roomManager.getRoom(roomId);
    if(room==null) return;
    roomManager.setReady(userId,true);
    let game=games[roomId];
    if(game==null){
        for(let i = 0; i < room.seats.length; i++){
            let seat = room.seats[i];
            if(seat.ready == false || userManager.isOnline(userId)==false){
                return;
            }
        }
        //人到齐了，并且都准备好了，则开始新的一局
        module.exports.begin(roomId);
    }else{

    }
}
module.exports.begin=function(roomId){
    let room=roomManager.getRoom(roomId);
    if(room==null) return;
    let game={
        room:room,
        config:room.config,
        seats:[],
        bank:0,          //庄是那个座位
        turn:0,          //轮到那个座位出牌
        caishen:null,    //财神
        chupai:null,     //出的牌
        state:"idle",    //idle,playing,finish
        mjs:[],          //剩余麻将
        mjci:0,           //麻将当前Index,(摸到第几个麻将了)
    }
    room.round++;
    //第一局随机一个庄
    game.bank=Math.floor(Math.random()*game.seats.length);
    //当前前出牌设置为庄家
    game.turn = room.config.round=room.round;

    for(let i=0;i<room.seats.length;i++){
        let data=game.seats[i]={};
        data.game=game;
        data.index=i;
        data.userId=room.seats[i].userId;
        //持有的牌
        data.holds = [];
        //打出的牌
        data.folds = [];
        //暗杠的牌
        data.angangs = [];
        //明杠的牌
        data.minggangs = [];
        //碰了的牌
        data.pengs = [];
        //吃了的牌
        data.chis = [];
        //暗杠的牌
        data.chis = [];

        //是否可以杠
        data.canGang = false;
        //是否可以碰
        data.canPeng = false;
        //是否可以胡
        data.canHu = false;
        //是否可以出牌
        data.canChuPai = false;

        data.actions = [];

        //玩家手上的牌的数目，用于快速判定碰杠吃
        data.mjmap = {};

        users[data.userId]=data;

    }
    games[roomId]=game;
    //洗牌
    shuffle(game);
    //发牌
    deal(game);

    game.state="playing";

    //剩余麻将
    let numOfMj=game.mjs.length-game.mjci;
    //剩余局数
    let numOfRound=room.config.round-room.round;

    let initData={
        mj:numOfMj,
        round:numOfRound,
        bank:game.bank,
    }

    for(let i=0;i<game.seats.length;i++){
        let seat = game.seats[i];
        //通知玩家手牌
        userManager.sendMsg(seat.userId,'holds_push',seat.holds);
        //通知游戏开始
        userManager.sendMsg(seat.userId,'begin_push',initData);
    }

    


}