cc.Class({
    extends: cc.Component,

    properties: {
        lblId:cc.Label,
        lblName:cc.Label,
        lblBalance:cc.Label,
        lblMarquee:cc.Label,
        joinRoomWin:cc.Node,
        createRoomWin:cc.Node,
        settingWin:cc.Node,
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
        this.lblBalance.string = th.userManager.balance;
        console.log("FFFFFFFFFFFFF:",th.userManager.roomId);
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
        if(th.userManager.roomId){
            th.alert.show("提示","你已在房间中，是否返回游戏房间？",this.onReturnRoomClicked,true);
            return;
        }
        this.createRoomWin.active=true;
    },

    onJoinRoomClicked : function(){
        this.joinRoomWin.active=true;
    },

    onReturnRoomClicked : function(){
        th.wc.show('正在返回游戏房间');
        th.userManager.joinRoom(th.userManager.roomId);
    },

    onSettingClicked : function(){
        this.settingWin.active=true;
    }

});
