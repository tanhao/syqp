(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/MJRoom.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '9e94cmRNURPVYbq/hLFI5Fb', 'MJRoom', __filename);
// scripts/components/MJRoom.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        settingWin: cc.Node,
        lblRoomId: cc.Label,
        lblWangfa: cc.Label,
        btnMenu: cc.Button,
        btnLeave: cc.Button,
        btnWechatInvite: cc.Button,
        btnDissolve: cc.Button,
        _seats: []
    },

    onLoad: function onLoad() {
        if (th == null) {
            return;
        }
        this.initView();
        this.initSeats();
        this.initEventHandlers();
    },
    initView: function initView() {
        if (th.socketIOManager.seats.length == 2) {
            this.node.getChildByName('left').active = false;
            this.node.getChildByName('right').active = false;
        } else if (th.socketIOManager.seats.length == 3) {
            this.node.getChildByName('up').active = false;
        }

        this.lblRoomId.string = th.socketIOManager.roomId || '------';
        this.lblWangfa.string = th.socketIOManager.getWanfa();

        var sides = ["myself", "right", "up", "left"];
        for (var i = 0; i < sides.length; i++) {
            if (i == 2 && th.socketIOManager.seats.length == 3 || (i == 1 || i == 3) && th.socketIOManager.seats.length == 2) {
                continue;
            }
            var seatComponent = this.node.getChildByName(sides[i]).getChildByName('Seat').getComponent('MJSeat');
            this._seats.push(seatComponent);
        }
        cc.log("MJRoom Seats:", this._seats.length);
        this.refreshBtns();
    },
    initSeats: function initSeats() {
        var seats = th.socketIOManager.seats;
        for (var i = 0; i < seats.length; ++i) {
            this.initSingleSeat(seats[i]);
        }
    },
    initSingleSeat: function initSingleSeat(seat) {
        var index = th.socketIOManager.getLocalIndex(seat.index);
        this._seats[index].setInfo(seat.userId, seat.name, seat.score, seat.headImgUrl);
        this._seats[index].setFangzhu(seat.userId == th.socketIOManager.creator);
        this._seats[index].setBanker(seat.index == th.socketIOManager.bankerIndex);
        this._seats[index].setReady(seat.ready);
        this._seats[index].setOffline(!seat.online);
    },
    refreshBtns: function refreshBtns() {
        var isIdle = th.socketIOManager.round == 0;
        var isFangzhu = th.socketIOManager.isFangzhu();
        this.btnDissolve.node.active = isIdle && isFangzhu;
        this.btnLeave.node.active = isIdle && !isFangzhu;
        this.btnWechatInvite.node.active = isIdle;
        this.btnMenu.node.active = !isIdle;
    },
    initEventHandlers: function initEventHandlers() {
        var self = this;
        //加入房间
        this.node.on('join_push', function (target) {
            cc.log('==>MJRoom join_push:', JSON.stringify(target.detail));
            self.initSingleSeat(target.detail);
        });
        //离开房间
        this.node.on('leave_push', function (target) {
            cc.log('==>MJRoom leave_push:', JSON.stringify(target.detail));
            self.initSingleSeat(target.detail);
        });

        //其他玩家断线
        this.node.on("offline_push", function (target) {
            cc.log('==>MJRoom offline_push:', JSON.stringify(target.detail));
            var seatIndex = th.socketIOManager.getSeatIndexById(target.detail.userId);
            var index = th.socketIOManager.getLocalIndex(seatIndex);
            self._seats[index].setOffline(true);
        });
        //其他玩家上线
        this.node.on("online_push", function (target) {
            cc.log('==>MJRoom online_push:', JSON.stringify(target.detail));
            var seatIndex = th.socketIOManager.getSeatIndexById(target.detail.userId);
            var index = th.socketIOManager.getLocalIndex(seatIndex);
            self._seats[index].setOffline(false);
        });
        //自己准备返回
        this.node.on("ready_result", function (target) {
            //cc.log('==>MJRoom ready_result:',JSON.stringify(target.detail));
            var seat = target.detail;
            self.initSingleSeat(seat);
        });
        //其他玩家准备
        this.node.on("ready_push", function (target) {
            //cc.log('==>MJRoom ready_push:',JSON.stringify(target.detail));
            self.initSingleSeat(target.detail);
        });
        //分数
        this.node.on("score_push", function (target) {
            //cc.log('==>MJRoom score_push:',JSON.stringify(target.detail));
            self.initSingleSeat(target.detail);
        });

        this.node.on('begin_push', function (data) {
            self.refreshBtns();
            self.initSeats();
        });
    },
    onBtnDissolveRequestClicked: function onBtnDissolveRequestClicked() {
        th.alert.show("申请解散房间", "申请解散房间不会退换钻石，是否确定申请解散？", function () {
            th.sio.send("dissolve_request");
        }, true);
    },
    onBtnDissolveClicked: function onBtnDissolveClicked() {
        th.alert.show("解散房间", "解散房间不扣钻石，是否确定解散？", function () {
            th.sio.send("dissolve");
        }, true);
    },
    onBtnLeaveClicked: function onBtnLeaveClicked() {
        if (th.socketIOManager.isFangzhu()) {
            th.alert.show("离开房间", "您是房主，不能离开房间。", function () {
                //th.sio.send("leave"); 
            });
            return;
        }
        th.alert.show("离开房间", "您确定要离开房间?", function () {
            th.sio.send("leave");
        }, true);
    },
    onBtnSettingClicked: function onBtnSettingClicked() {
        this.settingWin.active = true;
    },
    onBtnChatClicked: function onBtnChatClicked() {
        //this._seats[0].setCountdown(10);
        cc.log('onChatClicked==>');
    },
    onBtnVoiceClicked: function onBtnVoiceClicked() {
        cc.log('onVoiceClicked==>');
    },
    onBtnReadyClicked: function onBtnReadyClicked() {
        cc.log('onBtnReadyClicked==>');
        th.sio.send("ready");
    },
    onBtnWechatInviteClicked: function onBtnWechatInviteClicked() {
        cc.log('onBtnWechatInviteClicked==>');
    }

    // update: function (dt) {

    // },


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
        //# sourceMappingURL=MJRoom.js.map
        