const logger=require('../common/log.js').getLogger('game_dtz.js');
const roomManager=require('./room_manager.js');
const userManager=require('./user_manager.js');
const mjlib = require( '../mjlib/mjlib.js' ).initTable();

var games = {};
var SEAT_DATE_MAP={};   //KEY=userId

var ACTION_CHUPAI = 1;
var ACTION_MOPAI = 2;
var ACTION_PENG = 3;
var ACTION_GANG = 4;
var ACTION_HU = 5;
var ACTION_ZIMO = 6;
var ACTION_CHI= 7;


//取麻将类型
function getMjType(id){
    if(id >= 0 && id <= 8){
        return 0;//万
    }else if(id >= 9 && id <= 17){
        return 1;//条
    }else if(id >= 18 && id <= 16){
        return 2;//筒子
    }else if(id >= 27 && id <= 33){
        return 3;//风
    }
}
//洗牌
function shuffle(game) {
    let mjs = game.mjs;
    
     //万 (1 ~ 9表示万)
    let index = 0;
    for(let i = 0; i <= 8; ++i){
        for(let c = 0; c < 4; ++c){
            mjs[index] = i;
            index++;
        }
    }
    //条 (11 ~ 19)
    for(let i = 9; i <= 17; ++i){
        for(let c = 0; c < 4; ++c){
            mjs[index] = i;
            index++;
        }
    }
    //筒 (21 ~ 29 表示筒子)
    for(let i = 18; i <= 26; ++i){
        for(let c = 0; c < 4; ++c){
            mjs[index] = i;
            index++;
        }
    }
    //风 (31 ~ 37表示 东南酉北中发白)
    for(let i = 27; i <= 33; ++i){
        for(let c = 0; c < 4; ++c){
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
    //如果没有牌了，则不能再杠
    if( game.mjci >= game.mjs.length-20-2){
        return;
    }
    for(let key in seatData.mjmap){
        let pai = parseInt(key);
        let count=seatData.mjmap[key];
        if(count != null &&count==4){
            seatData.canGang=true;
            seatData.gangPai.push(pai);
        }
    }
}
//检查是否可以点杠
function checkCanDainGang(game,seatData,targetPai){
    //如果没有牌了，则不能再杠
    if( game.mjci >= game.mjs.length-20-2){
        return;
    }
    let count = seatData.mjmap[targetPai];
    if(count != null && count >= 3){
        seatData.canGang = true;
        seatData.gangPai.push(targetPai);
    }
}
//检查是否可以补杠
function checkCanBuGang(game,seatData,targetPai){
    //如果没有牌了，则不能再杠
    if( game.mjci >= game.mjs.length-20-2){
        return;
    }
    //从碰过的牌中选
    for(let i = 0; i < seatData.pengs.length; ++i){
        let peng = seatData.pengs[i];
        let pai=peng.pai;
        if(seatData.mjmap[pai] == 1){
            seatData.canGang = true;
            seatData.gangPai.push(pai);
        }
    }
}
//检查是否可以碰
function checkCanPeng(game,seatData,targetPai){
    var count = seatData.mjmap[targetPai];
    if(count != null && count >= 2){
        seatData.canPeng = true;
    }
}
//检查是否可以吃
function checkCanChi(game,seatData,targetPai){
    if(targetPai>=27){
        return;
    }
    let count1=null;
    let count2=null;
    let count3=null;
    let count4=null;
    if(targetPai==0||targetPai==9||targetPai==18){
         count3=seatData.mjmap(targetPai+1);
         count4=seatData.mjmap(targetPai+2);
    }else if(targetPai==8||targetPai==17||targetPai==26){
         count1=seatData.mjmap(targetPai-2);
         count2=seatData.mjmap(targetPai-1);
    }else if(targetPai==1||targetPai==10||targetPai==19){
         count2=seatData.mjmap(targetPai-1);
         count3=seatData.mjmap(targetPai+1);
         count4=seatData.mjmap(targetPai+2);
    }else if(targetPai==7||targetPai==16||targetPai==25){
         count1=seatData.mjmap(targetPai-2);
         count2=seatData.mjmap(targetPai-1);
         count3=seatData.mjmap(targetPai+1);
    }else if((2<=targetPai<=6)||(11<=targetPai<=15)||(20<=targetPai<=24)){
         count1=seatData.mjmap(targetPai-2);
         count2=seatData.mjmap(targetPai-1);
         count3=seatData.mjmap(targetPai+1);
         count4=seatData.mjmap(targetPai+2);
    }
    //取白板。因为白扳可以代替财神那个字
    let count =seatData.mjmap[33] || 0;
    if(game.caishen==targetPai-2&&count1!=null){
        count1=count;
    }else if(game.caishen==targetPai-1&&count2!=null){
        count2=count;
    }else if(game.caishen==targetPai+1&&count3!=null){
        count3=count;
    }else if(game.caishen==targetPai+2&&count4!=null){
        count4=count;
    }
    if(count1 != null && count1 >=1 && count2 != null && count2 >= 1){
        seatData.canChi=true;
        seatData.chiPai.push([count1,count2]);
    }
    if(count2 != null && count2 >= 1 && count3 != null && count3 >=1){
        seatData.canChi=true;
        seatData.chiPai.push([count2,count3]);
    }
    if(count3 != null && count3 >= 1 && count4 != null && count4 >=1){
        seatData.canChi=true;
        seatData.chiPai.push([count3,count4]);
    }
}
//检查是否可以胡
function checkCanHu(game,seatData,targetPai){
    let cards=new Array(34).fill(0);
    for(let i=0;i<seatData.holds.length;i++){
        let ci=seatData.holds[i];
        cards[ci]=cards[ci]+1;
    }
    if (mjlib.Hulib.get_hu_info(cards, 34, game.caishen) ){
        seatData.canHu=true;
    }
}
//检查有没有可能做的操作
function hasOperations(seatData){
    if(seatData.canGang || seatData.canPeng || seatData.canChi || seatData.canHu){
        return true;
    }
    return false;
}
//发送可以做的操作
function sendOperations(game,seatData,pai) {
    if(hasOperations(seatData)){
        if(pai == -1){
            pai = seatData.holds[seatData.holds.length - 1];
        }
        var data = {
            pai:pai,
            hu:seatData.canHu,
            chi:seatData.canChi,
            peng:seatData.canPeng,
            gang:seatData.canGang,
            gangPai:seatData.gangPai,
            chiPai:seatData.chiPai
        };
        //如果可以有操作，则进行操作
        userManager.sendMsg(seatData.userId,'action_push',data);
        data.si = seatData.seatIndex;
    }
    else{
        userManager.sendMsg(seatData.userId,'action_push');
    }
}
//清空game里所有玩家可以做的操作,吃，碰，杠，胡
function clearAllOptions(game,seatData){
    var fnClear = function(sd){
        sd.canPeng = false;
        sd.canGang = false;
        sd.gangPai = [];
        sd.canHu = false;
        sd.canChi = false;
        sd.chiPai = [];
    }
    if(seatData){
        fnClear(seatData);
    }else{
        for(var i = 0; i < game.seats.length; ++i){
            fnClear(game.seats[i]);
        }
    }
}
//记录所有的游戏操作
function recordGameAction(game,seatIndex,action,pai){
    game.actions.push(seatIndex);
    game.actions.push(action);
    if(pai != null){
        game.actions.push(pai);
    }
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
//全部准备游戏开始
module.exports.isBegin=function(roomId){
    let game=games[roomId];
    if(game) return true;
    let room=roomManager.getRoom(roomId);
    if(room) return room.round>0;
    return false;
}
//准备
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
//全部准备游戏开始
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
        chupai:null,     //出的牌 {mjid:1,idx:0}
        state:"idle",    //idle,playing,finish
        mjs:[],          //剩余麻将
        mjci:0,          //麻将当前Index,(摸到第几个麻将了)
        actions:[]       //游戏操作，用来回放
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
        data.angangs = [];    //[{mjid:0,idx:1}]
        //点杠的牌
        data.diangangs = [];  //[{mjid:0,idx:1}]
        //补杠的牌
        data.bugangs = [];    //[{mjid:0,idx:1}]
        //碰了的牌
        data.pengs = [];      //[{mjid:0,idx:1}]
        //吃了的牌
        data.chis = [];       //[{mjids:[],idx:1}]

        //是否可以杠
        data.canGang = false;
        //如果可以杠，要杠的牌
        data.gangPai=[];       //[1,2]
        //是否可以碰
        data.canPeng = false;

        //是否可以吃
        data.canChi = false;
        //如果可以吃，要吃的牌
        data.chiPai=[];        //[[1,2],[1,2]]
        //是否可以胡
        data.canHu = false;
        //是否胡了
        data.isHu = false;
        //是否是自摸
        data.isZimo = false;
        //是否可以出牌,用来防止多次出牌
        data.canChupai = false;

        data.actions = [];  

        //玩家手上的牌的数目，用于快速判定碰杠吃
        data.mjmap = {};

        SEAT_DATE_MAP[data.userId]=data;

    }
    games[roomId]=game;
    //洗牌
    shuffle(game);
    //发牌
    deal(game);
    //财神取最后一个
    game.caishen=game.mjs[gmae.mjs.length-1];


    game.state="begin";

    //剩余麻将
    let mjsy=game.mjs.length-game.mjci-20;

    for(let i=0;i<game.seats.length;i++){
        let seat = game.seats[i];
        //通知玩家手牌
        userManager.sendMsg(seat.userId,'holds_push',seat.holds);
        //通知还剩多少张牌
        userMgr.sendMsg(s.userId,'mjsy_push',mjsy);
        //通知当前是第几局
        userMgr.sendMsg(s.userId,'round_push',room.round);
        //通知游戏开始
        userManager.sendMsg(seat.userId,'begin_push',game.turn);
    }

    var turnSeat = game.seats[game.turn];
    //通知玩家出牌方
    turnSeat.canChupai = true;
    userManager.broacastInRoom('chupai_push',turnSeat.userId,turnSeat.userId,true);
    //检查否可以暗杠或者胡
    checkCanAnGang(game,turnSeat);
    checkCanHu(game,turnSeat,turnSeat.holds[turnSeat.holds.length-1]);
    //通知前端可以做的操作
    sendOperations(game,turnSeat,game.chuPai);


}
//吃
module.exports.chi=function(userId,pais){
}
//碰
module.exports.peng=function(userId){
    let seatData = SEAT_DATE_MAP[userId];
    if(seatData == null){
        logger.info("can't find user game data.");
        return;
    }
    let game = seatData.game;
    //如果是他出的牌，则忽略
    if(game.turn == seatData.index){
        logger.info("it's your turn.");
        return;
    }
    //如果没有碰的机会，则不能再碰
    if(seatData.canPeng == false){
        logger.info("seatData.peng == false");
        return;
    }
    clearAllOptions(game);
    //验证手上的牌的数目
    var pai = game.chupai;
    var count = seatData.mjmap[pai];
    if(count == null || count < 2){
        logger.info("pai:" + pai + ",count:" + c);
        logger.info(seatData.holds);
        logger.info("lack of mj.==>> "+pai);
        return;
    }
    //进行碰牌处理 扣掉手上的牌 从此人牌中扣除
    for(var i = 0; i < 2; i++){
        var index = seatData.holds.indexOf(pai);
        if(index == -1){
            logger.info("can't find mj.==>> "+pai);
            return;
        }
        seatData.holds.splice(index,1);
        seatData.mjmap[pai] --;
    }
    seatData.pengs.push({mjid:pai,si:1});
    game.chupai = null;
}
//杠
module.exports.gang=function(userId,pai){
}
//胡
module.exports.hu=function(userId){
}
//过
module.exports.guo=function(userId){
}
//出牌
module.exports.chupai=function(userId,pai){
    pai = Number.parseInt(pai);
    if(seatData == null){
        logger.info("can't find user game data.");
        return;
    }
    let game = seatData.game;
    let seatIndex = seatData.index;
    //如果不该他出，则忽略
    if(game.turn != seatIndex){
        logger.info("not your turn.");
        return;
    }
    if(seatData.canChupai == false){
        logger.info('already chipaied,no need chupai again.');
        return;
    }
    if(hasOperations(seatData)){
        logger.info('plz guo before you chupai.');
        return;
    }
    let count = seatData.mjmap[pai];
    //验证手上的牌的数目
    if(count < 1){
        logger.info("pai:" + pai + ",count:" + c);
        logger.info(seatData.holds);
        logger.info("lack of mj.==>> "+pai);
        return;
    }
    //从此人牌中扣除
    let index = seatData.holds.indexOf(pai);
    if(index == -1){
        logger.info("holds:" + seatData.holds);
        logger.info("can't find mj.==>> " + pai);
        return;
    }
    seatData.canChupai = false;
    seatData.holds.splice(index,1);
    seatData.mjmap[pai] --;
    game.chupai = {mjid:pai,idx:seatData.index};
    //记录游戏操作用来回放
    recordGameAction(game,seatData.seatIndex,ACTION_CHUPAI,pai);

    userMgr.broacastInRoom('chupai_notify_push',{userId:seatData.userId,pai:pai},seatData.userId,true);
    //检查是否有人要碰 要杠 要吃
    let hasActions = false;
    for(let i = 0; i < game.seats.length; ++i){
        //玩家自己不检查
        if(game.turn == i){
            continue;
        }
        checkCanPeng(game,seat[i],pai);
        checkCanDainGang(game,seat[i],pai);
        //判断下手是否可以吃
        let nextIndex=game.turn+1;
        nextIndex %=4;
        if(i==nextIndex){
            checkCanChi(game,seat[i],pai);
        }
        

    }

    //如果没有人有操作，则向下一家发牌，并通知他出牌
    if(!hasActions){
    }
}