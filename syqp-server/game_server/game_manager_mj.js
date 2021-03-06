const logger=require('../common/log.js').getLogger('game_manager_mj.js');
const roomManager=require('./room_manager.js');
const userManager=require('./user_manager.js');
const mjlib = require( '../mjlib/mjlib.js' ).initTable();
const db=require('../common/db.js');

var games = {};
var SEAT_DATE_MAP={};   //KEY=userId
var dissolvingList = []; //正在解散中的房间ID集合

var ACTION_CHUPAI   = 1;
var ACTION_MOPAI    = 2;
var ACTION_CHI      = 3;
var ACTION_PENG     = 4;
var ACTION_GANG     = 5;
var ACTION_HU       = 6;
var ACTION_ZIMO     = 7;



var ZG_QF_13YAO=1;
var ZG_13YAO=2;
var FZG_QF_13YAO=3;
var FZG_13YAO=4;
var QI_DUI=5;
var PENG_PENG_HU=6;
var PING_HU=7;
var SAN_CAI_SHEN=8;

var HU_QIANG_GANG=1;
var HU_GANG_HUA=2;
var HU_ZIMO=3;

const BAI_BANG_INDEX=33



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

    if(config.round != 8  && config.round != 16){
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
//开房间时验证gems
module.exports.checkCreateGems=function(config,gems){
    var fee=getFee(config);
    return gems>=fee;
}
//加入房间时验证gems
module.exports.checkJoinGems=function(config,gems){
    if(config.payment == 'FZ'){
        return true;
    }else{
        let fee= config.round==8 ? 1 : 2;
        return gems>=fee;
    }
}
//获取要扣的房费
function getFee(config){
    if(config.payment == 'FZ'){
        let mtp=config.round==8 ? 1 : 2;
        return config.people*mtp; 
    }else{
        return config.round==8 ? 1 : 2;
    }
}
//获取要扣的房费
function getNeedFeeUserIds(room){
    if(room.config.payment != 'FZ'){
        return [room.creator]; 
    }else{
        let userIds=[];
        for(let i=0;i<room.seats.length;i++){
            userIds[i]=room.seats[i].userId;
        }
        return userIds;
    }
}
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
    //风 (31 ~ 33表示 东南酉北中发白)
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
    if(data.vipPai!=null&&data.vipPai!=game.mjs[game.mjci]){
        let mjs=game.mjs.slice(game.mjci,game.mjs.length-1);
       // let paiIndex=mjs.findIndex((val,idx)=>val==data.vipPai)+game.mjci;
        let  paiIndex=-1;
        for(let j=game.mjci+1;j<game.mjs.length-1;j++){
            if(data.vipPai==game.mjs[j]){
                paiIndex=j;
                break;
            }
        }
        if(paiIndex>=0){
            let logic=game.mjs[paiIndex];
            game.mjs[paiIndex]=game.mjs[game.mjci];
            game.mjs[game.mjci]=logic;
        }
        data.vipPai=null;
    }
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
    let seatIndex = game.banker;
    let numOfSeats=game.seats.length;
    let count =numOfSeats*13;
    for(let i = 0; i < count; ++i){
        let mjs = game.seats[seatIndex].holds;
        mopai(game,seatIndex);
        seatIndex ++;
        seatIndex %= numOfSeats;
    }
    //庄家多摸最后一张
    mopai(game,game.banker);
    
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
        let pai=peng.mjid;
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
        seatData.pengPai=targetPai;
    }
}
//检查是否可以吃
function checkCanChi(game,seatData,chiPai){
    if(chiPai>=27&&chiPai!=33||(chiPai==33&&game.caishen>=27)){
        return;
    }
    var targetPai=chiPai;
    if(chiPai==33&&game.caishen<27){
        targetPai=game.caishen;
    }
    //先把鬼拿出来 
    let caishen=seatData.mjmap[game.caishen] || 0;
    //拿出白板数
    let baibang=seatData.mjmap[BAI_BANG_INDEX] || 0;
    //白板代替鬼的位置
    seatData.mjmap[game.caishen]=baibang;
    seatData.mjmap[BAI_BANG_INDEX]=0;
    
    let count1=0;
    let count2=0;
    let count3=0;
    let count4=0;
    let isBaibang1=false;
    let isBaibang2=false;
    let isBaibang3=false;
    let isBaibang4=false;
    if(targetPai==0||targetPai==9||targetPai==18){
         count3=seatData.mjmap[targetPai+1]||0;
         count4=seatData.mjmap[targetPai+2]||0;
    }else if(targetPai==8||targetPai==17||targetPai==26){
         count1=seatData.mjmap[targetPai-2]||0;
         count2=seatData.mjmap[targetPai-1]||0;
    }else if(targetPai==1||targetPai==10||targetPai==19){
         count2=seatData.mjmap[targetPai-1]||0;
         count3=seatData.mjmap[targetPai+1]||0;
         count4=seatData.mjmap[targetPai+2]||0;
    }else if(targetPai==7||targetPai==16||targetPai==25){
         count1=seatData.mjmap[targetPai-2]||0;
         count2=seatData.mjmap[targetPai-1]||0;
         count3=seatData.mjmap[targetPai+1]||0;
    }else if((2<=targetPai<=6)||(11<=targetPai<=15)||(20<=targetPai<=24)){
         count1=seatData.mjmap[targetPai-2]||0;
         count2=seatData.mjmap[targetPai-1]||0;
         count3=seatData.mjmap[targetPai+1]||0;
         count4=seatData.mjmap[targetPai+2]||0;
    }

    //还原白板与鬼
    seatData.mjmap[game.caishen]=caishen;
    seatData.mjmap[BAI_BANG_INDEX]=baibang;

    if(game.caishen==targetPai-2&&count1>0){
        isBaibang1=true;
    }else if(game.caishen==targetPai-1&&count2>0){
        isBaibang2=true;
    }else if(game.caishen==targetPai+1&&count3>0){
        isBaibang3=true;
    }else if(game.caishen==targetPai+2&&count4>0){
        isBaibang4=true;
    }
    if( count1 >0 &&  count2 >0){
        seatData.canChi=true;
        seatData.chiPai.push([isBaibang1?33:targetPai-2,isBaibang2?33:targetPai-1,-1]);
    }
    if( count2 >0 && count3 >0){
        seatData.canChi=true;
        seatData.chiPai.push([isBaibang2?33:targetPai-1,-1,isBaibang3?33:targetPai+1]);
    }
    if( count3 >0 && count4 >0){
        seatData.canChi=true;
        seatData.chiPai.push([-1,isBaibang3?33:targetPai+1,isBaibang4?33:targetPai+2]);
    }
}
//检查是否可以胡
function checkCanHu(game,seatData,targetPai){
    let cards=new Array(34).fill(0);
    for(let i=0;i<seatData.holds.length;i++){
        let ci=seatData.holds[i];
        cards[ci]=cards[ci]+1;
    }
    let hupai=null;
    let tmpCards = cards.concat();
    if (targetPai!=null && targetPai != 34 ){
        hupai=targetPai;
        tmpCards[ targetPai ] += 1;
    }else{
        hupai=seatData.holds[seatData.holds.length-1];
    }
    let gui_num =  tmpCards[game.caishen]; 
    tmpCards[game.caishen]=0;

    //3财神直接可以胡
    if(gui_num>=3){
        seatData.canHu=true;
        seatData.huPai=hupai;
        return true;
    }

    let count=0;
    tmpCards.forEach(card =>{count += card;});
    if(count+gui_num==14){
        //7対
        if(mjlib.Hulib.check_7dui(tmpCards,gui_num)){
            seatData.canHu=true;
            seatData.huPai=hupai;
            return true;
        }
        //13幺
        if(mjlib.Hulib.check_13yao(tmpCards,gui_num)){
            seatData.canHu=true;
            seatData.huPai=hupai;
            return true;
        }
    }

    if (mjlib.Hulib.get_hu_info(cards, targetPai, game.caishen) ){
        seatData.canHu=true;
        seatData.huPai=hupai;
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
            chiPai:seatData.chiPai,
            pengPai:seatData.pengPai,
            huPai:seatData.huPai
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
        sd.huInfo.numOfGang=0;
        sd.huInfo.numOfPiaocai=0;
        sd.lastFangGangSeatIndex=null;
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
    turnSeat.lastFangGangSeatIndex=null;
    var pai = mopai(game,game.turn);
    //牌摸完了，结束
    if(pai == -1){
        doGameOver(game,turnSeat.userId);
        logger.info("not has pai ,finish..............");
        return;
    }else{
        let mjsy=game.mjs.length-game.mjci-20;
        //通知还剩多少张牌
        userManager.broacastInRoom('mjsy_push',mjsy,turnSeat.userId,true);
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
    let hasActions = false;
    for(let i = 0; i < game.seats.length; i++){
        //只能按顺序抢所以从开杆人的下家开始
        let nextIndex=seatData.index+i+1;
        nextIndex %=game.seats.length;
        //杠牌者不检查
        if(seatData.index == nextIndex){
            continue;
        }
        let tmpSeatData = game.seats[nextIndex];
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
//计算输赢
function calculateResult(game,room){
    if(game.hupaiSeatIndex==null){
        //臭了
        let bankerSeat=game.seats[game.banker];
        let loseScore=game.config.difen*2;
        let totalLoseScore=0;
        for(let i=0;i<game.seats.length;i++){
            if(game.seatData.index!=bankerSeat.index){
                let winScore=game.config.difen*2;
                game.seats[i].score += loseScore;
                totalLoseScore -= loseScore;
            }
        }
        bankerSeat.score = totalLoseScore;
    }else{
        let hupaiSeatData=game.seats[game.hupaiSeatIndex];
        let fan = hupaiSeatData.huInfo.fan;
        logger.info("胡牌:",fan)
        if(hupaiSeatData.huInfo.isDangDiao){
            fan +=1;
            logger.info("单吊+1番");
        }
        if(hupaiSeatData.huInfo.isSanCaiShen){
            fan +=1;
            logger.info("三财神+1番");
        }
        if(hupaiSeatData.huInfo.isCaiShenTou){
            fan +=1;
            logger.info("财神头+1番");
        }
        if(hupaiSeatData.huInfo.isZiYiSe){
            fan +=3;
            logger.info("字一色+3番");
        }else if(hupaiSeatData.huInfo.isQingYiSe){
            fan +=2;
            logger.info("清一色+2番");
        }else if(hupaiSeatData.huInfo.isHunYiSe){
            fan +=1;
            logger.info("混一色+1番");
        }
        //有没有杠上花
        fan += hupaiSeatData.huInfo.numOfGang;
         //有没有飘财
        fan += hupaiSeatData.huInfo.numOfPiaocai;
        //如果是庄还要再*2
        if(game.banker==hupaiSeatData.index){
            fan +=1;
            logger.info("庄家胡+1番");
        }
        let totalWinScore=0;
        let isQiangGangHu=hupaiSeatData.huInfo.action==HU_QIANG_GANG;
        let difen=game.config.difen;
        for(let i = 0; i < game.seats.length;i++){
            let loseSeatData = game.seats[i];
            if(loseSeatData.index==hupaiSeatData.index){
                continue;
            }
            let loseFan=fan;
            if(hupaiSeatData.baoSeatIndex==loseSeatData.index){
                logger.info("包了别人+1番");
                //如果包了别人要番倍
                loseFan +=1;
            }else if(hupaiSeatData.unbaoSeatIndexMap[loseSeatData.index]){
                logger.info("反包+2番");
                //我被人包了要番两倍
                loseFan +=2;
            }
            if(game.banker==loseSeatData.index){
                loseFan +=1;
                logger.info("庄家+1番");
            }
            //判断是不否超过开房时设置的番数限制
            let loseScore=Math.pow(2,loseFan)*difen;
            if(loseScore>game.config.fengding){
                loseScore=game.config.fengding;
            }
            loseSeatData.score =(isQiangGangHu?0:loseScore)*-1;
            totalWinScore += loseScore;
        }
        if(isQiangGangHu){
            game.seats[hupaiSeatData.huInfo.target].score =totalWinScore*-1;
        }
        hupaiSeatData.score = totalWinScore;
        
   
    }
}
function isSameTypeHolds(game,type,arr){
    for(let i = 0; i < arr.length; ++i){
        //手上的财神不用判断
        let pai=arr[i];
        if(game.caishen==pai){
            continue;
        }
        if(BAI_BANG_INDEX==pai){
            pai=game.caishen;
        }
        let t = getMjType(pai);
        if(type != -1 && type != t){
            return false;
        }
        type = t;
    }
    return true; 
}
function isSameTypePengGang(game,type,arr){
    for(let i = 0; i < arr.length; ++i){
        //判断是不是白板。
        var pai=arr[i].mjid;
        if(BAI_BANG_INDEX==pai){
            pai=game.caishen;
        }
        let t = getMjType(pai);
        if(type != -1 && type != t){
            return false;
        }
        type = t;
    }
    return true; 
}
function isSameTypeChi(game,type,arr){
    for(let i = 0; i < arr.length; ++i){
        //判断吃牌时，有可能有白板，只要取不是白板的其他随便一个就行了。
        var pai=arr[i].mjids[0];
        if(BAI_BANG_INDEX==pai){
            pai=game.caishen;
        }
        let t = getMjType(pai);
        if(type != -1 && type != t){
            return false;
        }
        type = t;
    }
    return true; 
}
//是否是清一色
function isQingYiSe(game,seatData){
    let type = getMjType(seatData.holds[0]);

    //检查手上的牌
    if(isSameTypeHolds(game,type,seatData.holds) == false){
        return false;
    }

    //检查杠下的牌
    if(isSameTypePengGang(game,type,seatData.angangs) == false){
        return false;
    }
    if(isSameTypePengGang(game,type,seatData.diangangs) == false){
        return false;
    }
    if(isSameTypePengGang(game,type,seatData.bugangs) == false){
        return false;
    }
    //检查碰牌
    if(isSameTypePengGang(game,type,seatData.pengs) == false){
        return false;
    }
    //检查吃
    if(isSameTypeChi(game,type,seatData.chis) == false){
        return false;
    }
}
//是否是混一色
function isHunYiSe(game,seatData){
    let types=[0,0,0,0];
    //检查手上的牌
    for(let i = 0; i < seatData.holds.length; ++i){
        let type = getMjType(seatData.holds[i]);
        types[type]=1;
    }
    if(types[0]+types[1]+types[2]>1){
        return false;
    }
    //检查杠下的牌
    function parsePengGang(game,types,arr){
        for(let i = 0; i < arr.length; ++i){
            //判断是不是白板。
            var pai=arr[i].mjid;
            if(BAI_BANG_INDEX==pai){
                pai=game.caishen;
            }
            let type = getMjType(pai);
            types[type]=1;
        }
    }
    parsePengGang(game,types,seatData.angangs);
    parsePengGang(game,types,seatData.diangangs);
    parsePengGang(game,types,seatData.bugangs);
    if(types[0]+types[1]+types[2]>1){
        return false;
    }

    //检查碰下的牌
    parsePengGang(game,types,seatData.pengs);
    if(types[0]+types[1]+types[2]>1){
        return false;
    }

    //检查吃
    for(let i = 0; i < seatData.chis.length; ++i){
        //判断吃牌时，有可能有白板，只要取不是白板的其他随便一个就行了。
        var pai=seatData.chis[i].mjids[0];
        if(BAI_BANG_INDEX==pai){
            pai=game.caishen;
        }
        let type = getMjType(pai);
        types[type]=1;
    }
    if(types[0]+types[1]+types[2]>1||types[3]==0){
        return false;
    }
    return true;
}
//是否是字一色
function isZiYiSe(game,seatData){
    if(isQingYiSe(game,seatData)==false){
        return false;
    }
    let type = getMjType(seatData.holds[0]);
    if(type!=3){
        return false;
    }
    return true;
}
//检测是否清一色，混一色，字一色
function checkQingHunZiYiSe(game,seatData){
    logger.info("checkQingHunZiYiSe chis",JSON.stringify(seatData.chis));
    logger.info("checkQingHunZiYiSe pengs",JSON.stringify(seatData.pengs));
    logger.info("checkQingHunZiYiSe angangs",JSON.stringify(seatData.angangs));
    logger.info("checkQingHunZiYiSe bugangs",JSON.stringify(seatData.bugangs));
    logger.info("checkQingHunZiYiSe diangangs",JSON.stringify(seatData.diangangs));
    if(isZiYiSe(game,seatData)){
        seatData.huInfo.isZiYiSe=true;
        seatData.huInfo.isHunYiSe=false;
        seatData.isQingYiSe=false;
    }else if(isQingYiSe(game,seatData)){
        seatData.huInfo.isZiYiSe=false;
        seatData.huInfo.isHunYiSe=false;
        seatData.huInfo.isQingYiSe=true;
    }else if(isHunYiSe(game,seatData)){
        seatData.huInfo.isZiYiSe=false;
        seatData.huInfo.isHunYiSe=true;
        seatData.huInfo.isQingYiSe=false;
    }else{
        seatData.huInfo.isZiYiSe=false;
        seatData.huInfo.isHunYiSe=false;
        seatData.huInfo.isQingYiSe=false;
    }
}
//检测是否三财神
function checkSanCaiShen(game,seatData){
    seatData.huInfo.isSanCaiShen=seatData.mjmap[game.caishen]==3;
}
//检测是否财神头
function checkCaiShenTou(game,seatData,pai,type){
    //如果都没有财神，就不要判断了
    if(!seatData.mjmap[game.caishen] || seatData.mjmap[game.caishen]==0){
        seatData.isCaiShenTou=false;
        return;
    }
    let tmpHolds = seatData.holds.concat();
    if(pai==null){
        //自摸，把最后一个牌去掉
        tmpHolds.pop();
    }
    
    let cards=new Array(34).fill(0);
    for(let i=0;i<tmpHolds.length;i++){
        let ci=tmpHolds[i];
        cards[ci]=cards[ci]+1;
    }
    //再去掉一个财神，如果剩下的能组能坎或者连子就为财神头
    cards[game.caishen]=cards[game.caishen]-1;
    //把剩下的鬼拿出来
    let gui_num=cards[game.caishen];
    cards[game.caishen]=0;

    if(type==1){
        //碰碰胡
        let need=0;
        for( let i = 0; i < 34; i++ ){
            if ( cards[ i ] % 3 != 0 ){
                need += 3-(cards[ i ] % 3);
            }
        }
        if(gui_num==need){
            seatData.huInfo.isCaiShenTou=true;
        }
    }else if(type==2){
        //七对
        let need = 0;
        for( let i = 0; i < 34; i++ ){
            if ( cards[ i ] % 2 != 0 ){
                need += 1;
            }
        }
        if(gui_num==need){
            seatData.huInfo.isCaiShenTou=true;
        }
    }else if(type==3){
        //平胡
        cards[game.caishen]=gui_num;
        if(mjlib.Hulib2.is3N(cards, 34,game.caishen)){
            seatData.huInfo.isCaiShenTou=true;
        }
    }
}
//检测牌型
function checkPaiXing(game,seatData,pai){
    //如果pai为空，自摸胡的牌为holds 最后一个，如果不为空那就是抢杠胡，
    //返回当前数组的副本
    let tmpHolds = seatData.holds.concat();
    if(pai!=null){
        tmpHolds.push(pai)
    }
    let cards=new Array(34).fill(0);
    for(let i=0;i<tmpHolds.length;i++){
        let ci=tmpHolds[i];
        cards[ci]=cards[ci]+1;
    }
    let tmpCards=cards.concat();
    //鬼的个数
    let gui_num = cards[game.caishen];
    cards[game.caishen]=0
     //13幺判断与7对子
    if(tmpHolds.length==14){
        //13幺判断
        if(mjlib.Hulib.check_13yao(cards,gui_num)){
            //万
            let wangs=cards.slice(0,9);
            //条
            let tiao=cards.slice(9,18)
            //筒
            let tong=cards.slice(18,27);
            let huase=[wangs,tiao,tong];
            //是否是正规13幺
            let isZhenggui=true;
            for(let i=0;i<3;i++){
                let yao13Cards=huase[i];
                let offset=yao13Cards.findIndex(val=>val>0);
                for(let j=offset+1;j<yao13Cards.length;j++){
                    if(cards[j]>0){
                        if((j-offset)%3!=0){
                            isZhenggui=false;
                            break;
                        }
                        offset=j;
                    }
                }
            }
             //是否是7风13幺
            let isQifeng=false;
            //风
            let fengCount=0;
            let fengs=cards.slice(27,34);
            for(let i=0;i<fengs.length;i++){
                if(fengs[0]>0){
                    fengCount+=1;
                }
            }
            if(fengCount+gui_num>=7){
                isQifeng=true;
            }

            if(isZhenggui){
                if(isQifeng){
                    seatData.huInfo.paixing=ZG_QF_13YAO;
                    seatData.huInfo.fan=4
                }else{
                    seatData.huInfo.paixing=ZG_13YAO;
                    seatData.huInfo.fan=3
                }
            }else{
                if(isQifeng){
                    seatData.huInfo.paixing=FZG_QF_13YAO;
                    seatData.huInfo.fan=3
                }else{
                    seatData.huInfo.paixing=FZG_13YAO;
                    seatData.huInfo.fan=2
                }
            }

            //判断是不是三财神
            checkSanCaiShen(game,seatData);
            //13幺没有财神头
            return;
        }else if(mjlib.Hulib.check_7dui(cards,gui_num)){
            seatData.huInfo.paixing=QI_DUI;
            seatData.huInfo.fan=2

            checkQingHunZiYiSe(game,seatData);
            //判断是不是三财神
            checkSanCaiShen(game,seatData);
            //判断是不是财神头
            checkCaiShenTou(game,seatData,pai,2);
            return;
        }
    }
    //判断对对胡 ，不能有吃的牌
    if(seatData.chis.length==0){
        //对对胡叫牌有两种情况
        //1、N坎 + 1张单牌
        //2、N-1坎 + 两对牌 
        let need=0;
        for( let i = 0; i < 34; i++ ){
            if ( cards[ i ] % 3 != 0 ){
                need += 3-(cards[ i ] % 3);
            }
        }
        if(need-1<=gui_num){
            seatData.huInfo.paixing=PENG_PENG_HU;
            seatData.huInfo.fan=2
            checkQingHunZiYiSe(game,seatData);
            //判断是不是三财神
            checkSanCaiShen(game,seatData);
            //判断是不是财神头
            checkCaiShenTou(game,seatData,pai,1);
            return;
        }
    }
    //平胡
    if (mjlib.Hulib.get_hu_info(tmpCards, 34, game.caishen) ){
        seatData.huInfo.paixing=PING_HU;
        seatData.huInfo.fan=1
        checkQingHunZiYiSe(game,seatData);
        //判断是不是三财神
        checkSanCaiShen(game,seatData);
        //判断是不是财神头
        checkCaiShenTou(game,seatData,pai,3);
        return;  
    }
    //三财神自摸
    seatData.huInfo.paixing=SAN_CAI_SHEN;
    seatData.huInfo.fan=1
    checkQingHunZiYiSe(game,seatData,pai);

    seatData.numAnGang=seatData.angangs.length;
    seatData.numMingGang=seatData.diangangs.length+seatData.bugangs.length;
}
//一局结束
function doGameOver(game,userId,forceEnd){
    let roomId = roomManager.getUserRoomId(userId);
    if(roomId == null){ return;}
    let room = roomManager.getRoom(roomId);
    if(room == null){return;}
    let fnNoticeResult=function(isEnd){
        var endInfo = null;
        if(isEnd){
            endInfo=[];
            for(let i=0;i<room.seats.length;i++){
                var roomSeat = room.seats[i];
                endInfo.push({
                    numZiMo:roomSeat.numZiMo,
                    numJiePao:roomSeat.numJiePao,
                    numDianPao:roomSeat.numDianPao,
                    numAnGang:roomSeat.numAnGang,
                    numMingGang:roomSeat.numMingGang,
                });
            }
        }
        userManager.broacastInRoom('game_over_push',{results:results,endInfo:endInfo},userId,true);
        //如果局数已够，则进行整体结算，并关闭房间
        if(isEnd){
            setTimeout(function(){
                if(room.round > 1){
                    storeHistory(room);    
                }
                userManager.kickAllInRoom(roomId);
                roomManager.destroyRoom(roomId);
                //db.archive_games(roomInfo.uuid);            
            },2000);
        }
    }

    let results = [];
    if(game != null){
        //如果不是解散房间就计算番
        if(!forceEnd){
            calculateResult(game,room);    
        }
        
        for(let i=0;i<room.seats.length;i++){
            let seat = room.seats[i];
            let seatData=game.seats[i];
            seat.ready=false;
            seat.score += seatData.score;
            seat.numZiMo += seatData.numZiMo;
            seat.numJiePao += seatData.numJiePao;
            seat.numDianPao += seatData.numDianPao;
            seat.numAnGang += seatData.numAnGang;
            seat.numMingGang += seatData.numMingGang;
            
            let userRT={
                userId:seat.userId,
                pengs:seatData.pengs,
                angangs:seatData.angangs,
                diangangs:seatData.diangangs,
                bugangs:seatData.bugangs,
                chis:seatData.chis,
                holds:seatData.holds, 
                score:seatData.score,
                totalScore:seat.score,
                isHu:seatData.isHu,
                huInfo:seatData.huInfo,
            }

            results.push(userRT);
            game.results[i]=seatData.score;
            delete SEAT_DATE_MAP[seatData.userId];
        }

        logger.info(JSON.stringify(results));
        delete games[roomId];
        var oldBanker = room.banker;
        //下把谁当庄
        if(game.config.zuozhuang=='QZ'){
            room.banker=game.hupaiSeatIndex!=null?game.hupaiSeatIndex:game.banker;
        }else{
            room.banker=(game.banker+1)%room.seats.length;
        }
        if(oldBanker!=room.banker){
            db.updateRoomBanker(roomId,room.banker,function(err,success){
                logger.info("房间："+roomId+" 更新banker:"+room.banker+" 是否成功:"+success);
            });
        }
       
    }

    if(forceEnd || game == null){
        fnNoticeResult(true);   
    }else{
        //保存游戏
        storeGame(game,function(err,res){
            logger.info("保存游戏记录是否成功:"+(err==null?true:false));

            //保存游戏局数
            db.updateRoomRound(roomId,room.round,function(err,success){
                logger.info("房间："+roomId+" 更新Round:"+room.round+" 是否成功:"+success);
            })
            //如果是第一次，则扣除房卡
            if(room.round==1){
                let fee=getFee(room.config)*-1;
                db.incUserGems(getNeedFeeUserIds(room),fee,function(err,success){
                    logger.info("房间："+roomId+" 扣除 ["+getNeedFeeUserIds(room).join(",")+"] : 费用："+fee+" 是否成功:"+success);
                });
            }
            var isEnd = (room.round >= room.config.round);
            fnNoticeResult(isEnd);
        });
        
    }

}
//记录每一局开始前的基本信息
function constructGameBaseInfo(game){
    let baseInfo={
        banker:game.banker,
        round:game.room.round,
        mahjongs:game.mjs,  //发完牌后剩余麻将
        seats:[]
    }
    for(let i=0;i<game.seats.length;i++){
        baseInfo.seats[i]=game.seats[i].holds;   //记录发完牌后的手上麻将
    }
    game.baseInfo=baseInfo;
}
//存储游戏
function storeGame(game,callback){
    let data={
        roomId:game.room.id,
        round:game.room.round,
        baseInfo:game.baseInfo,
        results:game.results,
        actions:game.actions,
        createdTime: Math.ceil(Date.now()/1000),
    }
    logger.info(JSON.stringify(data));
    db.createGame(data,callback);
}
//记录玩家游戏
function storeHistory(room){
    let seats=room.seats;
    let history={
        roomId:room.id,
        time:room.createdTime,
        seats:[]
    }
    let userIds=[];
    for(let i=0;i<seats.length;i++){
        let seat=seats[i];
        let hs=history.seats[i]={};
        hs.userId=seat.userId;
        hs.name=seat.name;
        hs.headImgUrl=seat.headImgUrl;
        hs.score=seat.score;

        userIds[i]=seat.userId;
    }

    db.updateUsersHistroy(userIds,history,function(err,res){
        logger.info(" 更新玩家游戏记录："+userIds.join(",")+" 是否成功:"+(err==null?true:false));
    })
}
//创建房间时生成初始化座位信息
module.exports.initSeats=function(config){
    let seats=[]; 
    for(let i=0;i<config.people;i++){
        seats.push({
            userId:null,
            name:null,
            headImgUrl:null,
            sex:null,
            /*
            online:false,
            ip:null
            */
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
        logger.info("begin==============>");
        //人到齐了，并且都准备好了，则开始新的一局
        module.exports.begin(roomId);
    }
    
}
module.exports.syncPush=function(userId){
    let roomId=roomManager.getUserRoomId(userId);
    if(roomId==null) return;
    let room=roomManager.getRoom(roomId);
    if(room==null) return;
    let game=games[roomId];
    if(game!=null){
        let data={
            status:game.status,
            mjsy:game.mjs.length-game.mjci-20,
            round:room.round,
            bankerIndex:game.banker,
            turn:game.turn,
            chupai:game.chupai,
            caishen:game.caishen,
            seats:[],
        }
        let seatData=null;
        for(let i=0;i<game.seats.length;i++){
            var sd=game.seats[i];
            var seat={
                userId:sd.userId,
                folds:sd.folds,
                angangs:sd.angangs,
                diangangs:sd.diangangs,
                bugangs:sd.bugangs,
                pengs:sd.pengs,
                chis:sd.chis,
                ready:game.room.seats[i].ready,
            }
            if(sd.userId==userId){
                seat.holds=sd.holds;
                seatData=sd;
            }
            data.seats.push(seat);
           
        }
        //同步整个信息给客户端
        userManager.sendMsg(userId,'sync_push',data);
        sendOperations(game,seatData,game.chupai);
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
        banker:0,               //庄是那个座位
        turn:0,                 //轮到那个座位出牌
        caishen:null,           //财神
        chupai:null,            //出的牌 {mjid:1,idx:0}
        piaocaiSeatIndex:null,  //飘财seatIndex,不为空时代表有人飘财
        status:"idle",          //idle,playing,finish
        mjs:[],                 //剩余麻将
        mjci:0,                 //麻将当前Index,(摸到第几个麻将了)
        actions:[],             //游戏操作，用来回放
        results:[],              //每个seats的分数集合
        qiangGangContext:null,  //{  turnSeat:turnSeat, seatData:seatData, gangType:gangType,numOfCnt:numOfCnt, pai:pai,  isValid:true,  }
        hupaiSeatIndex:null,    //如果为空就是渣胡（臭了）
        baseInfo:null,          //游戏开始前的基本数据
    }
    room.round++;
    /*
    //第一局随机一个庄
    if(room.round==1){
        game.banker=Math.floor(Math.random()*game.seats.length);
    }else{
        game.banker=room.banker;
    }
    */
    //当前出牌设置为庄家
    game.turn = game.banker;

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
        //如果可以碰，要碰的牌
        data.pengPai=null;       //1
        //是否可以吃
        data.canChi = false;
        //如果可以吃，要吃的牌
        data.chiPai=[];        //[[1,-1,2],[1,2,-1]]
        //是否可以胡
        data.canHu = false;
        //是否胡了
        data.isHu = false;
        //如果可以胡，要胡的牌
        data.huPai=null;   
        //如果胡了，胡牌信息
        data.huInfo={
            paixing:null,   //牌类型 13幺，7对，碰碰胡
            fan:0,          //胡牌番数
            pai:null,     //胡那个牌
            action:null,    //自摸，杠上花，抢杠胡
            target:null,    //如果是抢杠或者放炮，开杠人seatIndex或者放炮者seatIndex
            isHaiDiHu:false, //是不是海底胡
            isDangDiao:false, //是否单吊
            isSanCaiShen:false, //是否是3财神
            isCaiShenTou:false, //是否是财神头
            isQingYiSe:false,//是否是清一色
            isHunYiSe:false, //是否是混一色
            isZiYiSe:false,//是否是字一色
            numOfGang:0,      //胡牌前连着杠的次数，过字作废
            numOfPiaocai:0,//胡牌前连着飘财次数，过字作废
        }
        //是否可以出牌,用来防止多次出牌
        data.canChupai = false;
        //是否飘财
        data.isPiaocai=false;

        data.actions = [];  

        //玩家手上的牌的数目，用于快速判定碰杠吃
        data.mjmap = {};

        //最后放杠给自己的人，过手就会清除，用来判断是不是杠胡
        data.lastFangGangSeatIndex=null;
        //当局输赢分数
        data.score=0;
        //我被那些人包起来了。可以是多个。比如其他3家都吃碰杠了我3次
        data.unbaoSeatIndexMap={};
        //包起来的seatIndex，最多只能包一人个，因为最多只可以吃碰杠4次，3次才能包一个人
        data.baoSeatIndex=null; 
        //玩家吃碰杠其他人的牌的次数，用来快速判断是不是包起来了
        data.baoMap = {};

        //统计信息
        data.numZiMo = 0;      //自摸胡
        data.numJiePao = 0;    //抢杠胡
        data.numDianPao = 0;   //被捉杠
        data.numAnGang = 0;    //暗杠
        data.numMingGang = 0;  //明杠

        data.vipPai=null; //vip麻将

        SEAT_DATE_MAP[data.userId]=data;

    }
    games[roomId]=game;
    //洗牌
    shuffle(game);
    //发牌
    deal(game);
    //财神取最后一个
    game.caishen=game.mjs[game.mjs.length-1];
    game.status="begin";

    constructGameBaseInfo(game);

    //剩余麻将
    let mjsy=game.mjs.length-game.mjci-20;
    for(let i=0;i<game.seats.length;i++){
        let seat = game.seats[i];
        //通知玩家手牌
        userManager.sendMsg(seat.userId,'holds_push',seat.holds);
        //通知还剩多少张牌
        userManager.sendMsg(seat.userId,'mjsy_push',mjsy);
        //通知当前是第几局
        userManager.sendMsg(seat.userId,'round_push',room.round);
        //通知财神
        userManager.sendMsg(seat.userId,'caishen_push',game.caishen);
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
        }else{
            tmpChipai[i]=pais[i];
            var index = seatData.holds.indexOf(pais[i]);
            if(index == -1){
                logger.info("can't find mj.");
                return;
            }
            seatData.holds.splice(index,1);
            seatData.mjmap[pais[i]] --;
        }
       
    }
    seatData.chis.push({mjids:tmpChipai,idx:game.turn}); //[{mjids:[],idx:1}]

        
    //统计吃同一个人的次数
    if(seatData.baoMap[game.turn]==null){
        seatData.baoMap[game.turn]=0;
    }
    seatData.baoMap[game.turn]+=1;
    if(seatData.baoMap[game.turn]>=3){
        //包起来了
        seatData.baoSeatIndex=game.turn;
        //被包的人的数据也刷新下
        game.seats[game.turn].unbaoSeatIndexMap[seatData]=true;
    }

    game.chupai = null;

    recordGameAction(game,seatData.index,ACTION_CHI,pai);
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

    //统计吃同一个人的次数
    if(seatData.baoMap[game.turn]==null){
        seatData.baoMap[game.turn]=0;
    }
    seatData.baoMap[game.turn]+=1;
    if(seatData.baoMap[game.turn]>=3){
        //包起来了
        seatData.baoSeatIndex=game.turn;
        //被包的人的数据也标记下被谁包了
        game.seats[game.turn].unbaoSeatIndexMap[seatData]=true;
    }


    game.chupai = null;
    recordGameAction(game,seatData.index,ACTION_PENG,pai);
    //广播通知其它玩家
    userManager.broacastInRoom('peng_notify_push',{userId:seatData.userId,info:{mjid:pai,idx:game.turn}},seatData.userId,true);

    //碰的玩家打牌
    moveToNextUser(game,seatData.index);

    //广播通知玩家出牌方
    seatData.canChupai = true;
    userManager.broacastInRoom('chupai_push',seatData.userId,seatData.userId,true);
}
//开杠逻辑
function doGang(game,turnSeat,seatData,gangType,numOfCnt,pai){
    var seatIndex = seatData.index;
    var gameTurn = turnSeat.index;
    var buGangPengIndex=null;
    if(gangType == "bugang"){
        var idx=-1;
        for(var i=0;i<seatData.pengs.length;i++){
            if(seatData.pengs[i].mjid==pai){
                idx=i;
                buGangPengIndex=seatData.pengs[i].idx;
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
        gangInfo.idx=buGangPengIndex;
        seatData.bugangs.push(gangInfo);
    }

    if(gangType == "diangang"){
        //统计吃同一个人的次数
        if(seatData.baoMap[game.turn]==null){
            seatData.baoMap[game.turn]=0;
        }
        seatData.baoMap[game.turn]+=1;
        if(seatData.baoMap[game.turn]>=3){
            //包起来了
            seatData.baoSeatIndex=game.turn;
            //被包的人的数据也标记下被谁包了
            game.seats[game.turn].unbaoSeatIndexMap[seatData]=true;
        }
    }

    //通知其他玩家，有人杠了牌
    userManager.broacastInRoom('gang_notify_push',{userId:seatData.userId,info:gangInfo,gangType:gangType},seatData.userId,true);

    //开杠有一个牌不要
    game.mjci++;

    //变成自己的轮子
    moveToNextUser(game,seatIndex);
    //再次摸牌
    doUserMoPai(game);   

    //记录连杠次数 因为不胡就会清除
    seatData.huInfo.numOfGang +=1;
    //只能放在这里。因为过手就会清除杠牌标记,用来判断是不是杠胡
    seatData.lastFangGangSeatIndex = gameTurn;
}
//杠
module.exports.gang=function(userId,pai){
    let seatData = SEAT_DATE_MAP[userId];
    if(seatData == null){
        logger.info("can't find user game data.");
        return;
    }
    let seatIndex = seatData.index;
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

    let numOfCnt = seatData.mjmap[pai];
    let gangType="";
    //弯杠 去掉碰牌
    if(numOfCnt == 1){
        gangType = "bugang";
        logger.info("补杠：",pai);
    }else if(numOfCnt == 3){
        gangType = "diangang";
        logger.info("点杠：",pai);
    }else if(numOfCnt == 4){
        gangType = "angang";
        logger.info("暗杠：",pai);
    }else{
        logger.info("invalid pai count.");
        return;
    }

    game.chupai = null;
    clearAllOptions(game);
    seatData.canChupai = false;

    userManager.broacastInRoom('hangang_notify_push',{userId:seatData.userId,gangType:gangType},seatData.userId,true);
    //如果是点杠或者补杠，则需要检查是否可以抢杠
    let turnSeat = game.seats[game.turn];
    if(numOfCnt == 1||numOfCnt==3){
        let canQiangGang = checkCanQiangGang(game,turnSeat,seatData,gangType,numOfCnt,pai);
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
    let seatIndex = seatData.index;
    let game = seatData.game;
    //如果他不能胡牌，那胡个啥啊
    if(seatData.canHu == false){
        logger.info("invalid request.");
        return;
    }
    //标记为胡牌座位index
    game.hupaiSeatIndex=seatData.index;
    //标记为胡牌
    seatData.isHu=true;
    let hupai = null;
    let isZimo = false;
    
    let turnSeat = game.seats[game.turn];
    let isGangHu = turnSeat.lastFangGangSeatIndex  != null;
    if(game.qiangGangContext != null){
        //抢杠胡
        let gangSeat = game.qiangGangContext.seatData;
        hupai = game.qiangGangContext.pai;
        recordGameAction(game,seatIndex,ACTION_HU,hupai);
        game.qiangGangContext.isValid = false;
        seatData.huInfo.isZimo=false;
        seatData.huInfo.action=HU_QIANG_GANG;
        seatData.huInfo.pai=hupai;
        seatData.huInfo.target=gangSeat.index;
        seatData.numJiePao++;
        gangSeat.numDianPao++;
        logger.info("抢杠胡:",hupai);
    }else if(game.chupai==null){
        //自摸
        logger.info("自摸:",hupai);
        hupai = seatData.holds.pop();
        seatData.mjmap[hupai] --;
        seatData.huInfo.action=HU_ZIMO;
        seatData.huInfo.isZimo=true;
        seatData.huInfo.pai=hupai;
        seatData.numZiMo++;
        isZimo=true;
        if(isGangHu){
            seatData.huInfo.action=HU_GANG_HUA;
            seatData.huInfo.pai=hupai;
            logger.info("杠上花:",hupai);
            /*
            if(turnSeat.lastFangGangSeatIndex == seatIndex){
                seatData.huInfo.action=HU_GANG_HUA;
                seatData.huInfo.pai=hupai;
                logger.info("杠上花:",hupai);
            }else{
                logger.info("点杠花（松阳麻将没有）:",hupai);
            } 
            */
        }
        recordGameAction(game,seatIndex,ACTION_ZIMO,hupai);
    }else{
        /*
        //开杠后打字放炮
        if(turnSeat.lastFangGangSeatIndex >= 0){
            hupai=game.chupai;
            logger.info("放跑胡（松阳麻将没有）:",hupai);
        }
        */
    }
    //判断牌型
    checkPaiXing(game,seatData,hupai);
    //如果是最后一张牌，则认为是海底胡
    seatData.huInfo.isHaiDiHu = game.mjci == (game.mjs.length-20);
    //判断是不是单吊
    if(seatData.holds.length==1||seatData.holds.length==2){
        seatData.huInfo.isDangDiao=true;
    }
    clearAllOptions(game);
    //通知前端，有人和牌了
    userManager.broacastInRoom('hu_push',{seatIndex:seatIndex,isZimo:isZimo,hupai:hupai},seatData.userId,true);
   
    doGameOver(game,seatData.userId);

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
        userManager.broacastInRoom('guo_notify_push',{userId:tmpSeatData.userId,pai:game.chupai},seatData.userId,true);
        tmpSeatData.folds.push(game.chupai.mjid);
        game.chupai = null;
    }
    //如果qiangGangContext，当有人开杆，且有人可以抢杠时qiangGangContext才会!=null
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
    //清空杠番
    seatData.huInfo.numOfGang=0;
    //如果打的是彩神,并且手上还有一个财神以上那就是飘财
    if(game.caishen==pai&&seatData.mjmap[pai]>=1){
        //记录连杠次数 因为过手就会清除
        seatData.huInfo.numOfPiaocai +=1;
        seatData.isPiaocai = true;
        game.piaocaiSeatIndex=seatData.index;
    }else{
        seatData.huInfo.numOfPiaocai =0;
        seatData.isPiaocai = false;
        //如果飘财的人出牌
        if(seatData.index==game.piaocaiSeatIndex){
            game.piaocaiSeatIndex=null;
        }
    }
    game.chupai = {mjid:pai,idx:seatData.index};
    //记录游戏操作用来回放
    recordGameAction(game,seatData.index,ACTION_CHUPAI,pai);

    userManager.broacastInRoom('chupai_notify_push',{userId:seatData.userId,pai:pai},seatData.userId,true);
    //检查是否有人要碰 要杠 要吃
    let hasActions = false;
    for(let i = 0; i < game.seats.length; ++i){
        //如果是飘财，其他人不能吃碰
        if( game.piaocaiSeatIndex!=null){
            break;
        }
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
            userManager.broacastInRoom("guo_notify_push",{userId:seatData.userId,pai:game.chupai},seatData.userId,true);
            seatData.folds.push(game.chupai.mjid);
            game.chupai = null;
            moveToNextUser(game);
            doUserMoPai(game);
        },500);
    }
} 
module.exports.vipRequest=function(userId){
    let seatData = SEAT_DATE_MAP[userId];
    if(seatData == null){
        logger.info("can't find user game data.");
        return;
    }
    let seatIndex = seatData.index;
    let game = seatData.game;
    let mjs=game.mjs.slice(game.mjci,game.mjs.length-1);
    //let mjs=[];
    //最后一个财神不能选 
    //for(let i=game.mjci;i<game.mjs.length-1;i++){
        //mjs.push(game.mjs[i]);
    //}
    userManager.sendMsg(seatData.userId,'vip_mj_push',{mjs:mjs});
}
module.exports.vip=function(userId,pai){
    let seatData = SEAT_DATE_MAP[userId];
    if(seatData == null){
        logger.info("can't find user game data.");
        return;
    }
    seatData.vipPai=pai;
}
//申请解散
module.exports.dissolveRequest = function(roomId,userId){
    let room=roomManager.getRoom(roomId);
    if(room == null){return;}
    //已经有人申请
    if(room.dr!=null){return null;}
    let seatIndex=roomManager.getUserSeatIndex(userId);
    if(seatIndex == null){return null;}
    room.dr = {
        endTime:Date.now() + 30000,
        states:new Array(room.seats.length).fill(false)
    };
    room.dr.states[seatIndex] = true;
    dissolvingList.push(roomId);
    return room;
}
//是否同意解散
module.exports.dissolveAgree = function(roomId,userId,agree){
    let room=roomManager.getRoom(roomId);
    if(room == null){return;}
    if(room.dr==null){return null;}
    let seatIndex=roomManager.getUserSeatIndex(userId);
    if(seatIndex == null){return null;}
    if(agree){
        room.dr.states[seatIndex] = true;
    }else{
        room.dr = null;
        var idx = dissolvingList.indexOf(roomId);
        if(idx != -1){
            dissolvingList.splice(idx,1);           
        }
    }
    return room;
}
//解散
module.exports.doDissolve = function(roomId){
    let room=roomManager.getRoom(roomId);
    if(room == null){return;}
    var game = games[roomId];
    doGameOver(game,room.seats[0].userId,true);
}
function update() {
    for(var i = dissolvingList.length - 1; i >= 0; --i){
        var roomId = dissolvingList[i];
        
        var room = roomManager.getRoom(roomId);
        if(room != null && room.dr != null){
            if(Date.now() > room.dr.endTime){
                console.log("delete room and games");
                module.exports.doDissolve(roomId);
                dissolvingList.splice(i,1); 
            }
        }else{
            dissolvingList.splice(i,1);
        }
    }
}

setInterval(update,1000);