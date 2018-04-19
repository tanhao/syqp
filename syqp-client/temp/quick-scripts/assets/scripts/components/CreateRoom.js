(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/CreateRoom.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4d86fQBcbxD06NbosHhw5bO', 'CreateRoom', __filename);
// scripts/components/CreateRoom.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        peoples: 4,
        round: 8,
        fee: 1,
        difen: 1,
        zuozhuang: 1,
        beishu: 32,
        ctdsq: false //吃吐荡三圈
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
        this.round = 8;
        this.fee = 1;
        this.difen = 1;
        this.zuozhuang = 1;
        this.beishu = 32;
        this.ctdsq = false; //吃吐荡三圈

        cc.find("Canvas/create_room/setting_list/peoples/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/round/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/fee/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/difen/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/zuozhuang/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/beishu/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room/setting_list/options/toggle1").getComponent(cc.Toggle).uncheck();
    },

    onCloseClicked: function onCloseClicked() {
        this.node.active = false;
    },

    onPeoplesClicked: function onPeoplesClicked(target, peoples) {
        this.peoples = peoples;
    },

    onRoundClicked: function onRoundClicked(target, round) {
        this.round = round;
    },

    onFeeClicked: function onFeeClicked(target, fee) {
        this.fee = fee;
    },

    onDifenClicked: function onDifenClicked(target, difen) {
        this.difen = difen;
    },

    onZuozhuangClicked: function onZuozhuangClicked(target, zuozhuang) {
        this.zuozhuang = zuozhuang;
    },

    onBeishuClicked: function onBeishuClicked(target, beishu) {
        this.beishu = beishu;
    },

    onCtdsqClicked: function onCtdsqClicked(target) {
        this.ctdsq = target.isChecked;
    },

    onCreateClicked: function onCreateClicked(target) {
        this.node.active = false;
        var config = {
            peoples: this.peoples,
            round: this.round,
            fee: this.fee,
            difen: this.difen,
            zuozhuang: this.zuozhuang,
            beishu: this.beishu,
            ctdsq: this.ctdsq
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
        