(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/CreateRoom.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4d86fQBcbxD06NbosHhw5bO', 'CreateRoom', __filename);
// scripts/components/CreateRoom.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        peoples: 4,
        score: 1000,
        fee: 1,
        gift: 100,
        liudipai: false,
        jipaiqi: false
    },

    onLoad: function onLoad() {},

    // update: function (dt) {

    // },
    onEnable: function onEnable() {
        cc.log("create_room onEnable");
        this.onResetClicked();
    },

    onResetClicked: function onResetClicked() {
        this.peoples = 4;
        this.score = 1000;
        this.fee = 1;
        this.gift = 100;
        this.liudipai = false;
        this.jipaiqi = false;

        cc.find("Canvas/create_room/setting_list/peoples/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/score/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/fee/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/gift/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/options/toggle1").getComponent(cc.Toggle).uncheck();
        cc.find("Canvas/create_room/setting_list/options/toggle2").getComponent(cc.Toggle).uncheck();
    },

    onCloseClicked: function onCloseClicked() {
        this.node.active = false;
    },

    onPeoplesClicked: function onPeoplesClicked(target, num) {
        this.peoples = num;
    },

    onScoreClicked: function onScoreClicked(target, score) {
        this.score = score;
    },

    onFeeClicked: function onFeeClicked(target, fee) {
        this.fee = fee;
    },

    onGiftClicked: function onGiftClicked(target, gift) {
        this.gift = gift;
    },

    onLiudipaiClicked: function onLiudipaiClicked(target) {
        this.liudipai = target.isChecked;
    },

    onJipaiqiClicked: function onJipaiqiClicked(target) {
        this.jipaiqi = target.isChecked;
    },

    onCreateClicked: function onCreateClicked(target) {
        this.node.active = false;
        /*
        cc.log("peoples",this.peoples);
        cc.log("score",this.score);
        cc.log("fee",this.fee);
        cc.log("gift",this.gift);
        cc.log("liudipai",this.liudipai);
        cc.log("jipaiqi",this.jipaiqi);
        */
        var config = {
            peoples: this.peoples,
            score: this.score,
            fee: this.fee,
            gift: this.gift,
            liudipai: this.liudipai,
            jipaiqi: this.jipaiqi
        };
        th.userManager.createRoom(config);
    }

});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=CreateRoom.js.map
        