cc.Class({
    extends: cc.Component,

    properties: {
        settingWin:cc.Node,
        chatWin:cc.Node,
        dissolveWin:cc.Node,
        lblRoomId:cc.Label,
        lblWangfa:cc.Label,
        btnMenu:cc.Button,
        btnLeave:cc.Button,
        btnWechatInvite:cc.Button,
        btnDissolve:cc.Button,
        _seats:[]
    },

    onLoad: function () {
        if(th==null){ return; }
        this.initView();
        this.initSeats();
        this.initEventHandlers();
    },
    initView:function(){
        if(th.socketIOManager.seats.length==2){
            this.node.getChildByName('left').active=false;
            this.node.getChildByName('right').active=false;
        }else if(th.socketIOManager.seats.length==3){
            this.node.getChildByName('up').active=false;
        }


        this.lblRoomId.string=th.socketIOManager.roomId || '------';
        this.lblWangfa.string=th.socketIOManager.getWanfa();

        var sides = ["myself","right","up","left"];
        for(var i=0;i<sides.length;i++){
            if((i==2&&th.socketIOManager.seats.length==3)||((i==1||i==3)&&th.socketIOManager.seats.length==2)){
                continue;
            }
            var seatComponent=this.node.getChildByName(sides[i]).getChildByName('Seat').getComponent('MJSeat');
            this._seats.push(seatComponent);
        }
        cc.log("MJRoom Seats:",this._seats.length);
        this.refreshBtns();
    },
    initSeats:function(){
        var seats=th.socketIOManager.seats;
        for(var i = 0; i < seats.length; ++i){
            this.initSingleSeat(seats[i]);
        }
    },
    initSingleSeat:function(seat){
        var index = th.socketIOManager.getLocalIndex(seat.index);
        this._seats[index].setInfo(seat.userId,seat.name,seat.score,seat.headImgUrl,seat.sex);
        this._seats[index].setFangzhu(seat.userId==th.socketIOManager.creator);
        this._seats[index].setBanker(seat.index==th.socketIOManager.bankerIndex);
        this._seats[index].setReady(seat.ready);
        this._seats[index].setOffline(!seat.online);
    },
    refreshBtns:function(){
         var isIdle=th.socketIOManager.round==0;
         var isFangzhu=th.socketIOManager.isFangzhu();
         this.btnDissolve.node.active=isIdle&&isFangzhu;
         this.btnLeave.node.active=isIdle&&!isFangzhu;
         this.btnWechatInvite.node.active=isIdle;
         this.btnMenu.node.active=!isIdle;
    },
    initEventHandlers:function(){
        var self=this;
        //加入房间
        this.node.on('join_push', function (target) {
            cc.log('==>MJRoom join_push:',JSON.stringify(target.detail));
            self.initSingleSeat(target.detail);
        });
        //离开房间
        this.node.on('leave_push', function (target) {
            cc.log('==>MJRoom leave_push:',JSON.stringify(target.detail));
            self.initSingleSeat(target.detail);
        });

        //其他玩家断线
        this.node.on("offline_push",function(target){
            cc.log('==>MJRoom offline_push:',JSON.stringify(target.detail));
            var seatIndex=th.socketIOManager.getSeatIndexById(target.detail.userId)
            var index = th.socketIOManager.getLocalIndex(seatIndex);
            self._seats[index].setOffline(true);
        })
        //其他玩家上线
        this.node.on("online_push",function(target){
            cc.log('==>MJRoom online_push:',JSON.stringify(target.detail));
            var seatIndex=th.socketIOManager.getSeatIndexById(target.detail.userId)
            var index = th.socketIOManager.getLocalIndex(seatIndex);
            self._seats[index].setOffline(false);
        })
        //自己准备返回
        this.node.on("ready_result",function(target){
            //cc.log('==>MJRoom ready_result:',JSON.stringify(target.detail));
            var seat=target.detail;
            self.initSingleSeat(seat);
        })
        //其他玩家准备
        this.node.on("ready_push",function(target){
            //cc.log('==>MJRoom ready_push:',JSON.stringify(target.detail));
            self.initSingleSeat(target.detail);
        })
        //分数
        this.node.on("score_push",function(target){
            //cc.log('==>MJRoom score_push:',JSON.stringify(target.detail));
            self.initSingleSeat(target.detail);
        })

        this.node.on('begin_push',function(target){
            self.refreshBtns();
            self.initSeats();
        })
        this.node.on('quick_chat_push',function(target){
            var seatIndex=th.socketIOManager.getSeatIndexById(target.detail.userId)
            var index = th.socketIOManager.getLocalIndex(seatIndex);
            var info = th.chat.getQuickChatInfo(target.detail.idx);
            self._seats[index].setChat(info.content);
            self._seats[index].setQuickVoice(info.sound);
        })
        this.node.on('emoji_push',function(target){
            var seatIndex=th.socketIOManager.getSeatIndexById(target.detail.userId)
            var index = th.socketIOManager.getLocalIndex(seatIndex);
            self._seats[index].setEmoji(target.detail.idx);
        })
    },
    onBtnDissolveRequestClicked:function(){
        var self=this;
        this.settingWin.active=false;
        th.audioManager.playSFX("click.mp3");
        th.alert.show("申请解散房间","申请解散房间不会退换钻石，是否确定申请解散？",function(){
            th.sio.send("dissolve_request"); 
            self.dissolveWin.active=false;
        },true)
    },
    onBtnDissolveClicked:function(){
        th.audioManager.playSFX("click.mp3");
        th.alert.show("解散房间","解散房间不扣钻石，是否确定解散？",function(){
            th.sio.send("dissolve"); 
        },true)
    },
    onBtnLeaveClicked:function(){
        th.audioManager.playSFX("click.mp3");
        if(th.socketIOManager.isFangzhu()){
            th.alert.show("离开房间","您是房主，不能离开房间。",function(){
                //th.sio.send("leave"); 
            })
            return ;
        }
        th.alert.show("离开房间","您确定要离开房间?",function(){
            th.sio.send("leave"); 
        },true)
    },
    onBtnSettingClicked:function(){
        th.audioManager.playSFX("click.mp3");
        this.settingWin.active=true;
    },
    
    onBtnChatClicked:function(){
        th.audioManager.playSFX("click.mp3");
        this.chatWin.active=true;
    },
   
    onBtnVoiceClicked:function(){
        th.audioManager.playSFX("click.mp3");
        cc.log('onVoiceClicked==>');
    },
    onBtnReadyClicked:function(){
        th.audioManager.playSFX("click.mp3");
        th.sio.send("ready"); 
    },
    onBtnWechatInviteClicked:function(){
        th.audioManager.playSFX("click.mp3");
        if(cc.sys.os == cc.sys.OS_ANDROID ||cc.sys.os == cc.sys.OS_IOS){
            th.anysdkManager.shareWebpage(th.appInfo.appWeb,th.appInfo.shareTitle,th.socketIOManager.getRoomInfo(),false);
        }
    },


    // update: function (dt) {

    // },
    
    

});
