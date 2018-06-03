function initManager(I){
    

    window.th=window.th || {};
    th.appInfo={}

    //th.defaultBaseUrl="http://192.168.88.60:9001";
    th.defaultBaseUrl="http://127.0.0.1:9001";
    //th.defaultBaseUrl="http://114.112.240.48:9001";

    th.http=require("Http");
    th.http.baseURL=th.defaultBaseUrl;
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
       lblLoadingMsg:cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.log("================>>initManager<<=====================");
        initManager();
        
        var url = cc.url.raw('resources/ver/cv.txt');
        cc.loader.load(url,function(err,data){
            cc.VERSION = data;
            cc.log('current core version:' + cc.VERSION);
            this.getServerInfo();
        }.bind(this));
    },



    onBtnDownloadClicked:function(){
        cc.sys.openURL(th.appInfo.appWeb);
    },
    
    getServerInfo:function(){
        var self = this;
        var onGetVersion = function(data){
            th.appInfo= data;
            cc.log("AppInfo:",th.appInfo);
            if(data.version != cc.VERSION){
                cc.find("Canvas/alert").active = true;
            } else{
                cc.director.loadScene("login");
            }
        };
        
        var xhr = null;
        var complete = false;
        var fnRequest = function(){
            self.lblLoadingMsg.string = "正在连接服务器...";
            xhr = th.http.get("/server_info",null,function(err,data){
                if(!err){
                    self.lblLoadingMsg.string="";
                    xhr = null;
                    complete = true;
                    onGetVersion(data);
                }
            });
            setTimeout(fn,5000);            
        }
        
        var fn = function(){
            if(!complete){
                if(xhr){
                    xhr.abort();
                    self.lblLoadingMsg.string = "连接失败，即将重试";
                    setTimeout(function(){
                        fnRequest();
                    },5000);
                }else{
                    fnRequest();
                }
            }
        };
        fn();
    },
    
    
    //start () {},
    // update (dt) {},
});
