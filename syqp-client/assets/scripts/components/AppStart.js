function initManager(I){
    //var defaultBaseUrl="http://192.168.88.60:9001";
    var defaultBaseUrl="http://127.0.0.1:9001";
    //var defaultBaseUrl="http://114.112.240.48:9001";
    window.th=window.th;
    if(window.th){ 
        th.http.baseURL=defaultBaseUrl;
        return;
    }
    window.th={};
    th.http=require("Http");
    th.http.baseURL=defaultBaseUrl;
    th.sio=require("SocketIO");
    th.sio.h

    var UserManager=require("UserManager");
    th.userManager=new UserManager();

    var AnysdkManager=require("AnysdkManager");
    th.anysdkManager=new AnysdkManager();

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
    },

    start () {
        //cc.log("start");
    },

    onBtnWeichatClicked:function(target,account){
        if(this._isAgree){
            cc.log("onBtnWeichatClicked");
            //th.wc.show("正在登录游戏");
            //th.userManager.lingshiAuth(account);
            th.anysdkManager.login();
        }
    },

    onBtnAgreeClicked:function(target){
        this._isAgree=target.isChecked;
    },

    // update (dt) {},
});
