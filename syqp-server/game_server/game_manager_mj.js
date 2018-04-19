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

//开房间时验证配置
module.exports.checkConfig=function(config){
    if(config.peoples == null
    || config.round == null
    || config.fee == null
    || config.difeng == null
    || config.zuozhuang == null 
    || config.beishu == null
    || config.ctdsq == null ){
        return false;
    }
    if(config.peoples != 4 && config.peoples != 3 && config.peoples != 2){
        return false;
    }

    if(config.round != 8 && config.round != 12 && config.round != 16){
        return false;
    }
    if(config.fee != 1 && config.fee != 2){
        return false;
    }
    if(config.difeng != 1 && config.difeng != 2 && config.difeng != 5){
        return false;
    }
    if(config.zuozhuang != 1 && config.zuozhuang != 2){
        return false;
    }
    if(config.beishu != 32 && config.beishu != 64 && config.beishu != 128){
        return false;
    }
    return true;
}
//生成座位初始化信息
module.exports.initSeats=function(config){
    let seats=[];
    for(let i=0;i<4;i++){
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
        state:"idle",    //idle,start,finish
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

    //剩余麻将
    let numOfMj=game.mjs.length-game.mjci;
    //剩余局数
    let numOfRound=room.config.round=room.round;

    for(let i=0;i<game.seats.length;i++){
        let seat = game.seats[i];
        //通知玩家手牌
        userManager.sendMsg(seat.userId,'holds_push',seat.holds);
        //通知还剩多少张牌
        userMgr.sendMsg(s.userId,'mj_count_push',numOfMj);
        //通知还剩多少局
        userMgr.sendMsg(s.userId,'round_push',numOfRound);
        //通知游戏开始
        userManager.sendMsg(seat.userId,'begin_push',game.trun);
    }


}