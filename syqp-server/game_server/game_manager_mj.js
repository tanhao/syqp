import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants';

const logger=require('../common/log.js').getLogger('game_dtz.js');
const roomManager=require('./room_manager.js');
const userManager=require('./user_manager.js');


var games = {};
var users={};
//取麻将类型
function getMjType(id){
    if(id >= 11 && id <= 19){
        return 0;//万
    }else if(id >= 31 && id <= 39){
        return 1;//条
    }else if(id >= 51 && id < 59){
        return 2;//筒子
    }else if(id >= 71 && id < 77){
        return 3;//风
    }
}
//洗牌
function shuffle(game) {
    let mjs = game.mjs;
    
     //万 (11 ~ 19表示万)
    let index = 0;
    for(let i = 11; i <= 19; ++i){
        for(let c = 0; c < 4; ++c){
            mjs[index] = i;
            index++;
        }
    }
    //条 (31 ~ 39表示条子)
    for(let i = 31; i <= 39; ++i){
        for(let c = 0; c < 4; ++c){
            mjs[index] = i;
            index++;
        }
    }
    //筒 (51 ~ 59 表示筒子)
    for(let i = 51; i <= 59; ++i){
        for(let c = 0; c < 4; ++c){
            mjs[index] = i;
            index++;
        }
    }
    //风 (71 ~ 77表示 东南酉北中发白)
    for(let i = 71; i <= 77; ++i){
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
        seatData.pengPai.push(targetPai);
    }
}
//检查是否可以吃
function checkCanChi(game,seatData,targetPai){
    //取白板。因为白扳可以代替财神那个字
    let count =seatData.mjmap[77] || 0;
    let count1=seatData.mjmap(targetPai-2);
    let count2=seatData.mjmap(targetPai-1);
    let count3=seatData.mjmap(targetPai+1);
    let count4=seatData.mjmap(targetPai+2);
    if(game.caishen==targetPai-2){
        count1=count;
    }else if(game.caishen==targetPai-1){
        count2=count;
    }else if(game.caishen==targetPai+1){
        count3=count;
    }else if(game.caishen==targetPai+2){
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
    
}
//发送可以做的操作
function sendOperations(game,seatData,pai) {

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
        data.angangs = [];    //{pai:15,pos:1}
        //明杠的牌
        data.minggangs = [];  //{pai:15,pos:1}
        //碰了的牌
        data.pengs = [];      //pai:15,pos:1}
        //吃了的牌
        data.chis = [];      

        //是否可以杠
        data.canGang = false;
        //如果可以杠，要杠的牌
        data.gangPai=[];
        //是否可以碰
        data.canPeng = false;
        //如果可以碰，要碰的牌
        data.pengPai=[];
        //是否可以吃
        data.canChi = false;
        //如果可以吃，要吃的牌
        data.chiPai=[];
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
    //财神取最后一个
    game.caishen=game.mjs[gmae.mjs.length-1];


    game.state="playing";

    //剩余麻将
    let symj=game.mjs.length-game.mjci;

    let beginData={
        symj:symj,
        round:room.round,
        bank:game.bank,
        caishen:game.caishen
    }

    for(let i=0;i<game.seats.length;i++){
        let seat = game.seats[i];
        //通知玩家手牌
        userManager.sendMsg(seat.userId,'holds_push',seat.holds);
        //通知游戏开始
        userManager.sendMsg(seat.userId,'begin_push',beginData);
    }

    var turnSeat = game.seats[game.turn];
    //通知玩家出牌方
    userManager.broacastInRoom('chupai_push',turnSeat.userId,turnSeat.userId,true);
    //检查否可以暗杠或者胡
    checkCanAnGang(game,turnSeat);
    checkCanHu(game,turnSeat,turnSeat.holds[turnSeat.holds.length-1]);
    //通知前端可以做的操作
    sendOperations(game,turnSeat,game.chuPai);


}