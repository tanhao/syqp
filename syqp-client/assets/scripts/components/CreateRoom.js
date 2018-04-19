cc.Class({
    extends: cc.Component,

    properties: {
        peoples:4,
        round:8,
        fee:1,
        difen:1,
        zuozhuang:1,
        beishu:32,
        ctdsq:false,  //吃吐荡三圈
    },

    onLoad: function () {
    },

    // update: function (dt) {

    // },
    onEnable:function(){
        cc.log("create_room onEnable");
        this.onResetClicked();
    },

    onResetClicked:function(){
        this.peoples=4;
        this.round=8;
        this.fee=1;
        this.difen=1;
        this.zuozhuang=1;
        this.beishu=32;
        this.ctdsq=false;  //吃吐荡三圈

        cc.find("Canvas/create_room/setting_list/peoples/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/round/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/fee/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/difen/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/zuozhuang/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/beishu/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/options/toggle1").getComponent(cc.Toggle).uncheck();
    },

    onCloseClicked:function(){
        this.node.active = false;
    },

    onPeoplesClicked:function(target,peoples){
        this.peoples = peoples;
    },

    onRoundClicked:function(target,round){
        this.round =round;
    },

    onFeeClicked:function(target,fee){
        this.fee=fee;
    },

    onDifenClicked:function(target,difen){
        this.difen=difen;
    },

    onZuozhuangClicked:function(target,zuozhuang){
        this.zuozhuang=zuozhuang;
    },

    onBeishuClicked:function(target,beishu){
        this.beishu=beishu;
    },

    onCtdsqClicked:function(target){
        this.ctdsq=target.isChecked;
    },

    onCreateClicked:function(target){
        this.node.active=false;
        var config={
            peoples:this.peoples,
            round:this.round,
            fee:this.fee,
            difen:this.difen,
            zuozhuang:this.zuozhuang,
            beishu:this.beishu,
            ctdsq:this.ctdsq
        }
        th.userManager.createRoom(config);
    }



});
