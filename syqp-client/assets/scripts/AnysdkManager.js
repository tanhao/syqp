cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad: function () {
    },

    // update: function (dt) {

    // },
    
    init:function(){
        this.ANDROID_API = "com/th/tcqp/Wechat";
        this.IOS_API = "AppController";
    },

    getBatteryPercent:function(){
        return 0.9;
        if(cc.sys.isNative){
            if(cc.sys.os == cc.sys.OS_ANDROID){
                return jsb.reflection.callStaticMethod(this.ANDROID_API, "getBatteryPercent", "()F");
            }
            else if(cc.sys.os == cc.sys.OS_IOS){
                return jsb.reflection.callStaticMethod(this.IOS_API, "getBatteryPercent");
            }            
        }
        return 0.9;
    },

    login:function(){
        cc.log("Login==>>");
        if(cc.sys.os == cc.sys.OS_ANDROID){ 
            cc.log("Login Start ANDROID==>>"+this.ANDROID_API);
            jsb.reflection.callStaticMethod(this.ANDROID_API, "login", "()V");
            cc.log("Login End ANDROID==>>"+this.ANDROID_API);
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            cc.log("Login IOS==>>"+this.IOS_API);
            jsb.reflection.callStaticMethod(this.IOS_API, "login");
        }
        else{
            cc.log("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },

       
    shareWebpage:function(url,title,desc,isTimelineCb){
        if(cc.sys.os == cc.sys.OS_ANDROID){
            jsb.reflection.callStaticMethod(this.ANDROID_API, "shareWebpage", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V",url,title,desc,isTimelineCb);
        }else if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this.IOS_API, "shareWebpage:shareTitle:shareDesc:isTimelineCb:",url,title,desc,isTimelineCb);
        }else{
            cc.log("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },

    shareCaptureScreen:function(isTimelineCb){
        if(this._isCapturing){
            return;
        }
        this._isCapturing = true;
        var size = cc.director.getWinSize();
        var currentDate = new Date();
        var fileName = "result_share.jpg";
        var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        if(jsb.fileUtils.isFileExist(fullPath)){
            jsb.fileUtils.removeFile(fullPath);
        }
        var texture = new cc.RenderTexture(Math.floor(size.width), Math.floor(size.height));
        texture.setPosition(cc.p(size.width/2, size.height/2));
        texture.begin();
        cc.director.getRunningScene().visit();
        texture.end();
        texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);
        
        var self = this;
        var tryTimes = 0;
        var fn = function(){
            if(jsb.fileUtils.isFileExist(fullPath)){
                var height = 100;
                var scale = height/size.height;
			    var width = Math.floor(size.width * scale);
                
                if(cc.sys.os == cc.sys.OS_ANDROID){
                    jsb.reflection.callStaticMethod(self.ANDROID_API, "shareImage", "(Ljava/lang/String;Z)V",fullPath,isTimelineCb);
                } else if(cc.sys.os == cc.sys.OS_IOS){
                    jsb.reflection.callStaticMethod(self.IOS_API, "shareImage:isTimelineCb:",fullPath,isTimelineCb);
                }else{
                    cc.log("platform:" + cc.sys.os + " dosn't implement share.");
                }
                self._isCapturing = false;
            } else{
                tryTimes++;
                if(tryTimes > 10){
                    cc.log("time out...");
                    return;
                }
                setTimeout(fn,50); 
            }
        }
        setTimeout(fn,50);
    },

    onLoginResp:function(code){
        cc.log("AnysdkManager onLoginResp code===>>:"+code);
        var fn = function(err,ret){
            th.wc.show("正在登录游戏");
            if(ret.errcode == 0){
                cc.sys.localStorage.setItem("wx_account",ret.account);
                cc.sys.localStorage.setItem("wx_sign",ret.sign);
            }
            th.userManager.onAuth(err,ret);
        }
        th.http.get("/wechat_auth",{code:code,os:cc.sys.os},fn);
    },

    
});
