"use strict";
cc._RF.push(module, 'cce92YsEchF14Hs7bYK6yoT', 'MJCreateRoom');
// scripts/components/MJCreateRoom.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        people: 4,
        round: 8,
        payment: 'FZ',
        difen: 1,
        zuozhuang: 'QZ',
        fengding: 32,
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
        this.people = 4;
        this.round = 8;
        this.payment = 'FZ';
        this.difen = 1;
        this.zuozhuang = 'QZ';
        this.fengding = 32;
        this.ctdsq = false; //吃吐荡三圈

        cc.find("Canvas/create_room_mj/setting_list/people/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/round/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/payment/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/difen/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/zuozhuang/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/fengding/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/options/toggle1").getComponent(cc.Toggle).uncheck();
    },

    onCloseClicked: function onCloseClicked() {
        this.node.active = false;
    },

    onPeopleClicked: function onPeopleClicked(target, people) {
        this.people = people;
    },

    onRoundClicked: function onRoundClicked(target, round) {
        this.round = round;
    },

    onPaymentClicked: function onPaymentClicked(target, payment) {
        this.payment = payment;
    },

    onDifenClicked: function onDifenClicked(target, difen) {
        this.difen = difen;
    },

    onZuozhuangClicked: function onZuozhuangClicked(target, zuozhuang) {
        this.zuozhuang = zuozhuang;
    },

    onFengdingClicked: function onFengdingClicked(target, fengding) {
        this.fengding = fengding;
    },

    onCtdsqClicked: function onCtdsqClicked(target) {
        this.ctdsq = target.isChecked;
    },

    onCreateClicked: function onCreateClicked(target) {
        this.node.active = false;
        var config = {
            people: this.people,
            round: this.round,
            payment: this.payment,
            difen: this.difen,
            zuozhuang: this.zuozhuang,
            fengding: this.fengding,
            ctdsq: this.ctdsq
        };
        th.userManager.createRoom(config);
    }

});

cc._RF.pop();