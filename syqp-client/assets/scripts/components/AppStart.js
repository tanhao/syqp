function initManager(I){
    var defaultBaseUrl="http://192.168.88.60:9001";
    //var defaultBaseUrl="http://127.0.0.1:9001";
    //var defaultBaseUrl="http://114.112.240.48:9001";
    window.th=window.th;
    if(window.th){ 
        th.http.baseURL=defaultBaseUrl;
        return;
    }

  

    window.th={};
    th.appInfo={
        appName:"同城棋牌",
        appWeb:"http://fir.im/9r48",
        shareTitle:"同城棋牌--掌上棋牌室",
        shareDesc:"【同城棋牌】最地道的松阳麻将,爱麻将的人都在玩。"
    }


    th.http=require("Http");
    th.http.baseURL=defaultBaseUrl;
    th.sio=require("SocketIO");
    th.sio.h

    var UserManager=require("UserManager");
    th.userManager=new UserManager();

    var AnysdkManager=require("AnysdkManager");
    th.anysdkManager=new AnysdkManager();
    th.anysdkManager.init();

    var AudioManager = require("AudioManager");
    th.audioManager = new AudioManager();
    th.audioManager.init();

    var SocketIOManager=require("SocketIOManager");
    th.socketIOManager=new SocketIOManager();
    th.socketIOManager.initHandlers();

    var Utils = require("Utils");
    th.utils = new Utils();
}   


cc.Class({
    extends: cc.Component,

    properties: {
       _isAgree:false
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.log("================>>initManager<<=====================");
        initManager();
        //cc.log('onLoad'); 
        if(cc.sys.os == cc.sys.OS_ANDROID ||cc.sys.os == cc.sys.OS_IOS){
            console.log( this.node.getChildByName("web_btns"))
            this.node.getChildByName("web_btns").active=false;
            this.node.getChildByName("btn_weixin").getComponent(cc.Button).node.active=true;
        }else{
            console.log( this.node.getChildByName("web_btns"))
            this.node.getChildByName("web_btns").active=true;
            this.node.getChildByName("btn_weixin").getComponent(cc.Button).node.active=false;
        }
    },

    start () {
        //cc.log("start");
    },

    onBtnWeichatClicked:function(target,account){
        if(this._isAgree){
            cc.log("onBtnWeichatClicked");
            //th.wc.show("正在登录游戏");
            if(cc.sys.os == cc.sys.OS_ANDROID ||cc.sys.os == cc.sys.OS_IOS){
                th.anysdkManager.login();
            }else{
                th.userManager.lingshiAuth(account);
            }
        }

        
    },

    onBtnAgreeClicked:function(target){
        this._isAgree=target.isChecked;
    },

    onBtnShareFirendClicked:function(target){
        th.anysdkManager.shareWebpage("http://fir.im/9r48","同城棋牌--掌上棋牌室","【同城棋牌】最地道的松阳麻将,爱麻将的人都在玩。",false);
    },
    onBtnShareWechatClicked:function(target){
        th.anysdkManager.shareWebpage("http://fir.im/9r48","同城棋牌--掌上棋牌室","【同城棋牌】最地道的松阳麻将,爱麻将的人都在玩。",true);
    },
    
    onBtnShareImgFirendClicked:function(target){
        th.anysdkManager.shareCaptureScreen(false);
    },
    onBtnShareImgWechatClicked:function(target){
        th.anysdkManager.shareCaptureScreen(true);
    },

    

    // update (dt) {},
});
