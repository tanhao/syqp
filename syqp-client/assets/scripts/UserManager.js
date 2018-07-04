cc.Class({
    extends: cc.Component,

    properties: {
        userId:null,
        userName:null,
        account:null,
        sex:null,
        headImgUrl:null,
        gems:0,
        ip:null,
        sign:null,
        isVip:false,
        roomId:null,  //登陆时如果不为null,代表用户在房间里，直接加入房间
    },

    onLoad: function () {
    },

    // update: function (dt) {

    // },

    // start: function (dt) {

    // },

    lingshiAuth:function(account){
        var self=this;
        th.http.get('/lingshi_auth',{account:account},self.onAuth);
    },

    onAuth:function(err,data){
        th.wc.hide();
        if(err){
            cc.err("onAuth",err);
            th.alert.show('提示',"验证微信错误！",null,false);
            return ;
        }
        var self = th.userManager;
        self.account = data.account;
        self.sign = data.sign;
        th.http.baseURL = 'http://'+th.appInfo.hallAddr;
        cc.log(th.http.baseURL);
        th.wc.show("正在获取玩家数据...");
        self.login();
    },

    login:function(){
        var self = this;
        var callback = function(err,data) {
             th.wc.hide();
             if(err||data.errcode){
                 cc.log(err,data.errmsg);
                 th.alert.show('提示',"玩家数据出错！",null,false);
                 return;
             }
             self.sex = data.sex;
             self.userId = data.id;
             self.account = data.account;
             self.gems = data.gems;
             self.userName = data.name;
             self.headImgUrl = data.headImgUrl;
             self.roomId = data.roomId;
             self.isVip=data.isVip;
             th.wc.show("正在进入大厅...");
             cc.director.loadScene("hall",function(){
                 th.wc.hide();
             });
        };
        th.http.get('/login',{account:self.account,sign:self.sign},callback)
    },

    logout:function(){
        th.wc.show("正在退出房间");
        var self = this;
        cc.director.loadScene("login",function(){
            self.sex = null;
            self.userId = null;
            self.account = null;
            self.gems = null;
            self.userName = null;
            self.headImgUrl = null;
            self.roomId = null;
            th.wc.hide();
        });
    },

    createRoom : function(config){
        var fnCreate = function(err,data) {
            if(err||data.errcode){
                th.wc.hide();
                th.alert.show('提示',data.errmsg,null,false); //
            }else{
                cc.log("create room data:"+JSON.stringify(data));
                th.wc.show("正在进入房间");
                th.socketIOManager.connectServer(data);
            }
            
        };

        var params={
            account:th.userManager.account,
            sign:th.userManager.sign,
            config:JSON.stringify(config)
        }
        th.wc.show("正在创建房间");
        th.http.get('/create_private_room',params,fnCreate);
    },

    joinRoom : function(roomId,callback){
        var self = this;
        var fnJoin = function(err,data) {
            if(err||data.errcode){
                th.wc.hide();
                if(callback != null){
                    callback(data);
                }
            }else{
                cc.log("join room data:"+JSON.stringify(data));
                if(callback != null){
                    callback(data);
                }
                th.socketIOManager.connectServer(data);
            }
            
        };

        var params={
            account:th.userManager.account,
            sign:th.userManager.sign,
            roomId:roomId
        }
        th.wc.show("正在加入房间");
        th.http.get('/join_private_room',params,fnJoin);
    }
    
});
