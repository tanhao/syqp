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

    onShareFriendClicked : function(){
        this.node.active = false;
        th.anysdkManager.shareWebpage(th.appInfo.appWeb,th.appInfo.shareTitle,th.appInfo.shareDesc,false);
    },
    onShareWechatClicked : function(){
        this.node.active = false;
        th.anysdkManager.shareWebpage(th.appInfo.appWeb,th.appInfo.shareTitle,th.appInfo.shareDesc,true);
    },
    onShareCloseClicked : function(){
        cc.log("onShareCloseClicked");
        this.node.active = false;
    },


});
