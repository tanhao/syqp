cc.Class({
    extends: cc.Component,

    properties: {
        btnShareFriend:cc.Button,
        btnShareWechat:cc.Button,
        btnShareClose:cc.Button
    },

    onLoad: function () {
    },


    update: function (dt) {
     
    },

    // start: function (dt) {

    // },

    onShareSessionClicked : function(){
        th.audioManager.playSFX("click.mp3");
        this.node.active = false;
        th.anysdkManager.shareWebpage(th.appInfo.appWeb,th.appInfo.shareTitle,th.appInfo.shareDesc,false);
    },
    onShareTimelineClicked : function(){
        th.audioManager.playSFX("click.mp3");
        this.node.active = false;
        th.anysdkManager.shareWebpage(th.appInfo.appWeb,th.appInfo.shareTitle,th.appInfo.shareDesc,true);
    },
    onShareCloseClicked : function(){
        th.audioManager.playSFX("click.mp3");
        cc.log("onShareCloseClicked");
        this.node.active = false;
    },


});
