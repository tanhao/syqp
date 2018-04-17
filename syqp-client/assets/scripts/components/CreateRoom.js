cc.Class({
    extends: cc.Component,

    properties: {
        peoples:4,
        score:1000,
        fee:1,
        gift:100,
        liudipai:false,
        jipaiqi:false,
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
        this.score=1000;
        this.fee=1;
        this.gift=100;
        this.liudipai=false;
        this.jipaiqi=false;

        cc.find("Canvas/create_room/setting_list/peoples/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/score/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/fee/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/gift/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/options/toggle1").getComponent(cc.Toggle).uncheck();
        cc.find("Canvas/create_room/setting_list/options/toggle2").getComponent(cc.Toggle).uncheck();
    },

    onCloseClicked:function(){
        this.node.active = false;
    },

    onPeoplesClicked:function(target,num){
        this.peoples = num;
    },

    onScoreClicked:function(target,score){
        this.score =score;
    },

    onFeeClicked:function(target,fee){
        this.fee=fee;
    },

    onGiftClicked:function(target,gift){
        this.gift=gift;
    },

    onLiudipaiClicked:function(target){
        this.liudipai=target.isChecked;
    },

    onJipaiqiClicked:function(target){
        this.jipaiqi=target.isChecked;
    },

    onCreateClicked:function(target){
        this.node.active=false;
        /*
        cc.log("peoples",this.peoples);
        cc.log("score",this.score);
        cc.log("fee",this.fee);
        cc.log("gift",this.gift);
        cc.log("liudipai",this.liudipai);
        cc.log("jipaiqi",this.jipaiqi);
        */
        var config={
            peoples:this.peoples,
            score:this.score,
            fee:this.fee,
            gift:this.gift,
            liudipai:this.liudipai,
            jipaiqi:this.jipaiqi
        }
        th.userManager.createRoom(config);
    }



});
