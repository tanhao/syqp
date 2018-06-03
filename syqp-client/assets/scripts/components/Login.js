cc.Class({
    extends: cc.Component,

    properties: {
       _isAgree:false
    },

    onLoad () {
      
        th.http.baseURL=th.defaultBaseUrl;
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

    start(){
        var account=cc.sys.localStorage.getItem("wx_account");
        var sign=cc.sys.localStorage.getItem("wx_sign");
        cc.log("login start  account:"+account+" sign:"+sign);
        if(account!=null && sign!= null && account!="" && sign!=""){
            th.wc.show("正在登录游戏");
            var data={
                account:account,
                sign:sign
            }
            th.userManager.onAuth(null,data);
        }
    },

    onBtnWeichatClicked:function(target,account){
        th.audioManager.playSFX("click.mp3");
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
        th.audioManager.playSFX("click.mp3");
        this._isAgree=target.isChecked;
    },

    onBtnShareFirendClicked:function(target){
        th.audioManager.playSFX("click.mp3");
        th.anysdkManager.shareWebpage("http://fir.im/9r48","同城棋牌--掌上棋牌室","【同城棋牌】最地道的松阳麻将,爱麻将的人都在玩。",false);
    },
    onBtnShareWechatClicked:function(target){
        th.audioManager.playSFX("click.mp3");
        th.anysdkManager.shareWebpage("http://fir.im/9r48","同城棋牌--掌上棋牌室","【同城棋牌】最地道的松阳麻将,爱麻将的人都在玩。",true);
    },
    
    onBtnShareImgFirendClicked:function(target){
        th.audioManager.playSFX("click.mp3");
        th.anysdkManager.shareCaptureScreen(false);
    },
    onBtnShareImgWechatClicked:function(target){
        th.audioManager.playSFX("click.mp3");
        th.anysdkManager.shareCaptureScreen(true);
    },

    
    //start () {},
    // update (dt) {},
});
