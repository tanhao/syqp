cc.Class({
    extends: cc.Component,

    properties: {
        lblId:cc.Label,
        lblName:cc.Label,
        lblGems:cc.Label,
        lblMarquee:cc.Label,
        joinRoomWin:cc.Node,
        createRoomWin:cc.Node,
        settingWin:cc.Node,
        shareWin:cc.Node,
        ruleWin:cc.Node,
        luckGameWin:cc.Node,
        activityWin:cc.Node,
        spriteHead:cc.Sprite,
        btnCreateRoom:cc.Button,
        btnReturnRoom:cc.Button,
        btnJoinRoom:cc.Button
    },

    onLoad: function () {
        this.initUserInfo();
        th.audioManager.playBGM("bg_hall.mp3");
    },

    start:function(){
        if(th.userManager.roomId){
            th.alert.show("提示","你已在房间中，是否返回游戏房间？",this.onReturnRoomClicked,true);
        }
    },

    initUserInfo:function(){
        var self=this;
        this.lblId.string = "ID:"+th.userManager.userId;
        this.lblName.string = th.userManager.userName;
        this.lblGems.string = th.userManager.gems;
        cc.log("Hall th.userManager.roomId:",th.userManager.roomId)
        if(th.userManager.roomId){
            this.btnJoinRoom.node.active=false;
            this.btnReturnRoom.node.active=true;
        }else{
            this.btnJoinRoom.node.active=true;
            this.btnReturnRoom.node.active=false;
        }
        cc.log(th.userManager.headImgUrl);
        cc.loader.load({url: th.userManager.headImgUrl, type: 'jpg'}, function (err, texture) {
            if(!err){
                var headSpriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                self.spriteHead.spriteFrame=headSpriteFrame;
                self.spriteHead.node.setScale(2-(texture.width/106));
            }
        });
    },

    update: function (dt) {
        var x = this.lblMarquee.node.x;
        x -= dt*100;
        if(x + this.lblMarquee.node.width < -250){
            x = 260;
        }
        this.lblMarquee.node.x = x;
    },

    // start: function (dt) {

    // },

    onCreateRoomClicked : function(){
        th.audioManager.playSFX("click.mp3");
        if(th.userManager.roomId){
            th.alert.show("提示","你已在房间中，是否返回游戏房间？",this.onReturnRoomClicked,true);
            return;
        }
        this.createRoomWin.active=true;
    },

    onJoinRoomClicked : function(){
        th.audioManager.playSFX("click.mp3");
        this.joinRoomWin.active=true;
    },

    onReturnRoomClicked : function(){
        th.audioManager.playSFX("click.mp3");
        th.wc.show('正在返回游戏房间');
        th.userManager.joinRoom(th.userManager.roomId, function(data){
            if(data.errcode!=0){
                th.alert.show('提示',data.errmsg,null,false);
            }
        }.bind(this));

       
    },

    onLogoutClicked : function(){
        cc.sys.localStorage.removeItem("wx_account");
        cc.sys.localStorage.removeItem("wx_sign");
        th.audioManager.playSFX("click.mp3");
        th.wc.show('正在退出游戏房间');
        th.userManager.logout();
    },

    onSettingClicked : function(){
        th.audioManager.playSFX("click.mp3");
        this.settingWin.active=true;
    },
    onShareClicked : function(){
        th.audioManager.playSFX("click.mp3");
        if(cc.sys.os == cc.sys.OS_ANDROID ||cc.sys.os == cc.sys.OS_IOS){
            this.shareWin.active=true;
        }
    },
    onRuleClicked : function(){
        th.audioManager.playSFX("click.mp3");
        this.ruleWin.active=true;
    },
    onRuleCloseClicked : function(){
        th.audioManager.playSFX("click.mp3");
        this.ruleWin.active=false;
    },
    onLuckGameClicked : function(){
        th.audioManager.playSFX("click.mp3");
        this.luckGameWin.active=true;
    },
    
    onActivityClicked : function(){
        th.audioManager.playSFX("click.mp3");
        this.activityWin.active=true;
    },
    onActivityCloseClicked : function(){
        th.audioManager.playSFX("click.mp3");
        this.activityWin.active=false;
    },
   
});
