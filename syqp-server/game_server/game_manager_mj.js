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
    }else if(id >= 18 && id <= 26){
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
    //万 (0 ~ 8)
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
    let isBaibang1=false;
    let isBaibang2=false;
    let isBaibang3=false;
    let isBaibang4=false;
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
        isBaibang1=true;
    }else if(game.caishen==targetPai-1&&count2!=null){
        count2=count;
        isBaibang2=true;
    }else if(game.caishen==targetPai+1&&count3!=null){
        count3=count;
        isBaibang3=true;
    }else if(game.caishen==targetPai+2&&count4!=null){
        count4=count;
        isBaibang4=true;
    }
    if(count1 != null && count1 >=1 && count2 != null && count2 >= 1){
        seatData.canChi=true;
        seatData.chiPai.push([isBaibang1?33:count1,isBaibang2?33:count2,-1]);
    }
    if(count2 != null && count2 >= 1 && count3 != null && count3 >=1){
        seatData.canChi=true;
        seatData.chiPai.push([isBaibang2?33:count2,-1,isBaibang3?33:count3]);
    }
    if(count3 != null && count3 >= 1 && count4 != null && count4 >=1){
        seatData.canChi=true;
        seatData.chiPai.push([-1,isBaibang3?33:count3,isBaibang4?33:count4]);
    }
}
//检查是否可以胡
function checkCanHu(game,seatData,targetPai){
    let cards=new Array(34).fill(0);
    for(let i=0;i<seatData.holds.length;i++){
        let ci=seatData.holds[i];
        cards[ci]=cards[ci]+1;
    }
    if (mjlib.Hulib.get_hu_info(cards, targetPai, game.caishen) ){
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
function sendOperations(game,seatData,chupai) {
    if(hasOperations(seatData)){
        if(chupai == null){
            chupai= {mjid:seatData.holds[seatData.holds.length - 1],idx:seatData.index};
        }
        var data = {
            pai:chupai,
            hu:seatData.canHu,
            chi:seatData.canChi,
            peng:seatData.canPeng,
            gang:seatData.canGang,
            gangPai:seatData.gangPai,
            chiPai:seatData.chiPai
        };
        //如果可以有操作，则进行操作
        userManager.sendMsg(seatData.userId,'action_push',data);
    }else{
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
        game.qiangGangContext=null;
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
//转到下一个玩家出牌
function moveToNextUser(game,nextSeatIndex){
    if(nextSeatIndex == null){
        game.turn ++;
        game.turn %= game.seats.length;
    }else{
        game.turn = nextSeatIndex;
    }
}
//玩家摸牌
function doUserMoPai(game){
    game.chupai = null;
    var turnSeat = game.seats[game.turn];
    var pai = mopai(game,game.turn);
    //牌摸完了，结束
    if(pai == -1){
        //todo
        //doGameOver(game,turnSeat.userId);
        logger.info("not has pai ,finish..............");
        return;
    }else{
        let mjsy=game.mjs.length-game.mjci-20;
        //通知还剩多少张牌
        userManager.sendMsg(s.userId,'mjsy_push',mjsy);
    }
    recordGameAction(game,game.turn,ACTION_MOPAI,pai);
    //通知前端新摸的牌
    userManager.sendMsg(turnSeat.userId,'mopai_push',pai);
    //检查是否可以暗杠，补杠或者胡
    checkCanAnGang(game,turnSeat);
    checkCanBuGang(game,turnSeat,pai);
    //检查看是否可以和
    checkCanHu(game,turnSeat,34);
    //广播通知玩家出牌方
    turnSeat.canChupai = true;
    userManager.broacastInRoom('chupai_push',turnSeat.userId,turnSeat.userId,true);
    //通知玩家做对应操作
    sendOperations(game,turnSeat,game.chupai);
}
//检测是不否有人可以抢杠胡
function checkCanQiangGang(game,turnSeat,seatData,gangType,numOfCnt,pai){
    var hasActions = false;
    for(var i = 0; i < game.seats.length; i++){
        //只能按顺序抢所以从开杆人的下家开始
        let nextIndex=seatData.index+i+1;
        nextIndex %=game.seats.length;
        //杠牌者不检查
        if(seatData.index == nextIndex){
            continue;
        }
        var tmpSeatData = game.seats[i];
        checkCanHu(game,tmpSeatData,pai);
        if(tmpSeatData.canHu){
            sendOperations(game,tmpSeatData,{mjid:pai,idx:turnSeat.index});
            hasActions = true;
            //不能一炮多响所以，找到第一位抢杠的人时就要break
            //break;
        }
    }
    if(hasActions){
        game.qiangGangContext = {
            turnSeat:turnSeat,
            seatData:seatData,
            gangType:gangType,
            numOfCnt:numOfCnt,
            pai:pai,
            isValid:true,
        }
    }else{
        game.qiangGangContext = null;
    }
    return game.qiangGangContext != null;

}
//开杠逻辑
function doGang(game,turnSeat,seatData,gangType,numOfCnt,pai){
    var seatIndex = seatData.index;
    var gameTurn = turnSeat.index;
    if(gangType == "bugang"){
        var idx=-1;
        for(var i=0;i<seatData.pengs.length;i++){
            if(seatData.pengs[i].mjid==pai){
                idx=i;
                break;
            }
        }
        if(idx >= 0){
            seatData.pengs.splice(idx,1);
        }
    }
     //扣掉手上的牌
    //从此人牌中扣除
    for(var i = 0; i < numOfCnt; i++){
        var index = seatData.holds.indexOf(pai);
        if(index == -1){
            logger.info(seatData.holds);
            logger.info("can't find mj.");
            return;
        }
        seatData.holds.splice(index,1);
        seatData.mjmap[pai] --;
    }
    recordGameAction(game,seatData.index,ACTION_GANG,pai);

    //记录下玩家的杠牌
    var gangInfo={mjid:pai,idx:gameTurn};
    if(gangType == "angang"){
        seatData.angangs.push(gangInfo);
    }else if(gangType == "diangang"){
        seatData.diangangs.push(gangInfo);
    }else if(gangType == "bugang"){
        seatData.bugangs.push(gangInfo);
    }

    //通知其他玩家，有人杠了牌
    userManager.broacastInRoom('gang_notify_push',{userId:seatData.userId,info:gangInfo,gangType:gangType},seatData.userId,true);

    //开杠有一个牌不要
    game.mjci++;
    //变成自己的轮子
    moveToNextUser(game,seatIndex);
    //再次摸牌
    doUserMoPai(game);   
}
//开房间时验证balance
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
        bank:0,           //庄是那个座位
        turn:0,           //轮到那个座位出牌
        caishen:null,     //财神
        chupai:null,      //出的牌 {mjid:1,idx:0}
        state:"idle",     //idle,playing,finish
        mjs:[],           //剩余麻将
        mjci:0,           //麻将当前Index,(摸到第几个麻将了)
        actions:[],       //游戏操作，用来回放
        qiangGangContext:null,   //{  turnSeat:turnSeat, seatData:seatData, gangType:gangType,numOfCnt:numOfCnt, pai:pai,  isValid:true,  }
    }
    room.round++;
    //第一局随机一个庄
    game.bank=Math.floor(Math.random()*game.seats.length);
    //当前前出牌设置为庄家
    game.turn = game.bank;

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
        data.chiPai=[];        //[[1,-1,2],[1,2,-1]]
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
    //turnSeat.holds[turnSeat.holds.length-1]
    checkCanHu(game,turnSeat,34);
    //通知前端可以做的操作
    sendOperations(game,turnSeat,game.chupai);
}
//吃
module.exports.chi=function(userId,pais){
    let seatData = SEAT_DATE_MAP[userId];
    if(seatData == null){
        logger.info("can't find user game data.");
        return;
    }
    var seatIndex = seatData.index;
    let game = seatData.game;
    //如果是他出的牌，则忽略
    if(game.turn == seatData.index){
        logger.info("it's your turn.");
        return;
    }
    //如果没有吃的机会，则不能再吃
    if(seatData.canChi == false){
        logger.info("seatData.chi == false");
        return;
    }
    //如果有人要碰，先等待 从i+2开始是因为自己能碰不用管，否则有死循环
    var i = game.turn;
    while(true){
        var i = (i + 2) % game.seats.length;
        if(i == game.turn){
            break;
        }else{
            var tmpSeatData = game.seats[i];
            if(tmpSeatData.canPeng && i != seatData.index){
                return;    
            }
        }
    }
    clearAllOptions(game);

    let pai = game.chupai.mjid;
    //进行吃牌处理
    //扣掉手上的牌
    //从此人牌中扣除
    let tmpChipai=[];
    for(var i = 0; i < pais.length; ++i){
        //用来占位的，要吃的牌的位置
        if(pais[i]==-1){
            tmpChipai[i]=pai;
            continue;
        }else{
            tmpChipai[i]=pais[i];
        }
        var index = seatData.holds.indexOf(pais[i]);
        if(index == -1){
            logger.info("can't find mj.");
            return;
        }
        seatData.holds.splice(index,1);
        seatData.countMap[pais[i]] --;
    }
    seatData.chis.push([{mjids:tmpChipai,idx:game.turn}]); //[{mjids:[],idx:1}]
    game.chupai = null;

    recordGameAction(game,seatData.seatIndex,ACTION_CHI,pai);
    //广播通知其它玩家
    userManager.broacastInRoom('chi_notify_push',{userId:seatData.userId,info:{mjids:tmpChipai,idx:game.turn},pai:pai},seatData.userId,true);

    //吃的玩家打牌
    moveToNextUser(game,seatData.index);

    //广播通知玩家出牌方
    seatData.canChupai = true;
    userManager.broacastInRoom('chupai_push',seatData.userId,seatData.userId,true);
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
    let pai = game.chupai.mjid;
    let count = seatData.mjmap[pai];
    if(count == null || count < 2){
        logger.info("pai:" + pai + ",count:" + c);
        logger.info(seatData.holds);
        logger.info("lack of mj.==>> "+pai);
        return;
    }
    //进行碰牌处理 扣掉手上的牌 从此人牌中扣除
    for(let i = 0; i < 2; i++){
        let index = seatData.holds.indexOf(pai);
        if(index == -1){
            logger.info("can't find mj.==>> "+pai);
            return;
        }
        seatData.holds.splice(index,1);
        seatData.mjmap[pai] --;
    }
    seatData.pengs.push({mjid:pai,idx:game.turn});
    game.chupai = null;
    recordGameAction(game,seatData.seatIndex,ACTION_PENG,pai);
    //广播通知其它玩家
    userManager.broacastInRoom('peng_notify_push',{userId:seatData.userId,info:{mjid:pai,idx:game.turn}},seatData.userId,true);

    //碰的玩家打牌
    moveToNextUser(game,seatData.index);

    //广播通知玩家出牌方
    seatData.canChupai = true;
    userManager.broacastInRoom('chupai_push',seatData.userId,seatData.userId,true);
}
//杠
module.exports.gang=function(userId,pai){
    let seatData = SEAT_DATE_MAP[userId];
    if(seatData == null){
        logger.info("can't find user game data.");
        return;
    }
    var seatIndex = seatData.index;
    let game = seatData.game;
    //如果没有杠的机会，则不能再杠
    if(seatData.canGang == false) {
        logger.info("seatData.gang == false");
        return;
    }

    if(seatData.gangPai.indexOf(pai) == -1){
        logger.info("the given pai can't be ganged.");
        return;   
    }

    var numOfCnt = seatData.mjmap[pai];
    var gangType="";
    //弯杠 去掉碰牌
    if(numOfCnt == 1){
        gangType = "bugang"
    }else if(numOfCnt == 3){
        gangType = "diangang"
    }else if(numOfCnt == 4){
        gangType = "angang";
    }else{
        logger.info("invalid pai count.");
        return;
    }

    game.chupai = null;
    clearAllOptions(game);
    seatData.canChupai = false;

    userManager.broacastInRoom('gang_notify_push',seatIndex,seatData.userId,true);
    //如果是点杠或者补杠，则需要检查是否可以抢杠
    var turnSeat = game.seats[game.turn];
    if(count == 1||count==3){
        var canQiangGang = checkCanQiangGang(game,turnSeat,seatData,gangType,numOfCnt,pai);
        if(canQiangGang){
            return;
        }
    }
    doGang(game,turnSeat,seatData,gangType,numOfCnt,pai);
    
}
//胡
module.exports.hu=function(userId){
    let seatData = SEAT_DATE_MAP[userId];
    if(seatData == null){
        logger.info("can't find user game data.");
        return;
    }
    var seatIndex = seatData.index;
    let game = seatData.game;
    //如果他不能和牌，那和个啥啊
    if(seatData.canHu == false){
        logger.info("invalid request.");
        return;
    }
    //标记为和牌
    seatData.isHu=true;
    var hupai = game.chupai;
    var isZimo = false;

    var turnSeat = game.seats[game.turn];


    if(game.qiangGangContext != null){
        //抢杠胡
    }else if(game.chupai==null){
        //自摸
    }

}
//过
module.exports.guo=function(userId){
    let seatData = SEAT_DATE_MAP[userId];
    if(seatData == null){
        logger.info("can't find user game data.");
        return;
    }
    var seatIndex = seatData.index;
    let game = seatData.game;
    //如果玩家没有对应的操作，则也认为是非法消息
    if((seatData.canGang || seatData.canPeng || seatData.canHu || seatData.canChi) == false){
        logger.info("no need guo.");
        return;
    }
    //如果是玩家自己的轮子，不是接牌，则不需要额外操作
    var doNothing = game.chupai == null && game.turn == seatIndex;

    userManager.sendMsg(seatData.userId,"guo_result");
    //那个玩家过，就清空玩家所有的可做的操作
    clearAllOptions(game,seatData);

    if(doNothing){
        return;
    }

    //如果还有人可以操作，则等待
    for(var i = 0; i < game.seats.length; ++i){
        var tmpSeatData = game.seats[i];
        if(hasOperations(tmpSeatData)){
            return;
        }
    }

    //如果是已打出的牌，则需要通知。，全部过了把出的牌放到出牌玩家的folds里
    if(game.chupai != null){
        let tmpSeatData=game.seats[game.turn];
        userManager.broacastInRoom('guo_notify_push',{userId:tmpSeatData.userId,pai:game.chupai.mjid},seatData.userId,true);
        tmpSeatData.folds.push(game.chupai.mjid);
        game.chupai = null;
    }
    //如果qiangGangContext，当有人开杆，且有人可以抢杠时qiangGangContext才分!=null
    var qgc = game.qiangGangContext;
    //清除所有的操作
    clearAllOptions(game);

    if(qgc != null && qgc.isValid){
        //有人抢杠却不胡，让开杆的玩家继续开杠
        doGang(game,qgc.turnSeat,qgc.seatData,qgc.gangType,qgc.numOfCnt,qgc.pai);        
    }else{
        //下家摸牌
        moveToNextUser(game);
        doUserMoPai(game);   
    }
    


}
//出牌
module.exports.chupai=function(userId,pai){
    pai = Number.parseInt(pai);
    let seatData = SEAT_DATE_MAP[userId];
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
        let tmpSeatData=game.seats[i];
        //玩家自己不检查
        if(game.turn == i){
            continue;
        }
        checkCanPeng(game,tmpSeatData,pai);
        checkCanDainGang(game,tmpSeatData,pai);
        //判断下手是否可以吃
        let nextIndex=game.turn+1;
        nextIndex %=game.seats.length;
        if(i==nextIndex){
            checkCanChi(game,tmpSeatData,pai);
        }
        if(hasOperations(tmpSeatData)){
            sendOperations(game,tmpSeatData,game.chupai);
            hasActions = true;    
        }
    }

    //如果没有人有操作，则向下一家发牌，并通知他出牌
    if(!hasActions){
        setTimeout(function(){
            userManager.broacastInRoom("guo_notify_push",{userId:seatData.userId,pai:gam.chupai},seatData.userId,true);
            seatData.folds.push(game.chupai);
            game.chupai = null;
            moveToNextUser(game);
            doUserMoPai(game);
        },500);
    }
}