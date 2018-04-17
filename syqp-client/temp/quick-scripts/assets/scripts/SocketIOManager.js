(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/SocketIOManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'f3060chRz9FU6rQ3OvSu7my', 'SocketIOManager', __filename);
// scripts/SocketIOManager.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        dataEventHandler: null, //处理socket.io发过来的数据的节点
        roomId: null,
        config: null,
        seats: null,
        round: null,
        creator: null,
        seatIndex: -1,
        needCheckIp: false,
        status: null
    },

    onLoad: function onLoad() {},


    /*
    update (dt) {
    },
    */

    reset: function reset() {
        th.userManager.roomId = null;
        this.roomId = null;
        this.config = null;
        this.seats = null;
        this.round = null;
        this.creator = null;
        this.seatIndex = -1;
        this.needCheckIp = false;
    },

    dispatchEvent: function dispatchEvent(event, data) {
        if (this.dataEventHandler) {
            this.dataEventHandler.emit(event, data);
        }
    },


    initHandlers: function initHandlers() {
        var self = this;
        //连接成功初始化信息
        th.sio.addHandler("init_room", function (data) {
            cc.log("==>SocketIOManager init_room:", JSON.stringify(data));
            self.roomId = data.roomId;
            self.config = data.config;
            self.seats = data.seats;
            self.round = data.round;
            self.creator = data.creator;
            self.seatIndex = self.getSeatIndexById(th.userManager.userId);
            self.dispatchEvent("init_room", data);
        });
        //其他玩家加入房间
        th.sio.addHandler("join_push", function (data) {
            cc.log("==>SocketIOManager join_push:", JSON.stringify(data));
            var index = data.index;
            if (self.seats[index].userId) {
                self.seats[index].online = true;
                if (self.seats[index].ip != data.ip) {
                    self.seats[index].ip = data.ip;
                    self.needCheckIp = true;
                }
            } else {
                self.seats[index] = data;
                self.needCheckIp = true;
            }
            self.dispatchEvent("join_push", self.seats[index]);
            if (self.needCheckIp) {
                self.dispatchEvent('check_ip', self.seats[index]);
            }
        });
        //自己离开房间
        th.sio.addHandler("leave_result", function (data) {
            self.reset();
        });
        //其他玩家离开房间
        th.sio.addHandler("leave_push", function (data) {
            cc.log("==>SocketIOManager leave_push:", JSON.stringify(data));
            var userId = data.userId;
            var seat = self.getSeatByUserId(userId);
            if (seat) {
                seat.userId = null;
                seat.name = null;
                seat.headImgUrl = null;
                seat.sex = null;
                seat.sex = null;
                seat.score = 0;
                seat.ready = false;
                seat.online = false;
            }
            self.dispatchEvent("leave_push", seat);
        });
        //解散房间，所有玩家退出房间，收到此消息返回大厅
        th.sio.addHandler("dissolve_push", function (data) {
            self.reset();
            cc.log("==>SocketIOManager dissolve_push:", JSON.stringify(data));
        });
        //其他玩家断线
        th.sio.addHandler("offline_push", function (data) {
            cc.log("==>SocketIOManager offline_push:", JSON.stringify(data));
            self.dispatchEvent("offline_push", data);
        });
        //其他玩家上线
        th.sio.addHandler("online_push", function (data) {
            cc.log("==>SocketIOManager online_push:", JSON.stringify(data));
            self.dispatchEvent("online_push", data);
        });
        //自己准备返回
        th.sio.addHandler("ready_result", function (data) {
            cc.log("==>SocketIOManager ready_result:", JSON.stringify(data));
            var seat = self.getSeatByUserId(th.userManager.userId);
            seat.ready = true;
            self.dispatchEvent("ready_result", seat);
        });
        //其他玩家准备
        th.sio.addHandler("ready_push", function (data) {
            cc.log("==>SocketIOManager ready_push:", JSON.stringify(data));
            var seat = self.getSeatByUserId(data.userId);
            seat.ready = true;
            self.dispatchEvent("ready_push", seat);
        });

        //玩家手上的牌
        th.sio.addHandler("holds_push", function (data) {
            cc.log("==>SocketIOManager holds_push:", JSON.stringify(data));
            var seat = self.seats[self.seatIndex];
            seat.holds = data;
            self.dispatchEvent("holds_push");
        });

        //开始游戏，出头的人
        th.sio.addHandler("begin_push", function (data) {
            cc.log("==>SocketIOManager begin_push:", JSON.stringify(data));
            self.turn = data.turn;
            self.status = "begin";
            self.dispatchEvent("begin_push");
        });

        //断线
        th.sio.addHandler("disconnect", function (data) {
            if (self.roomId == null) {
                th.wc.show('正在返回游戏大厅');
                cc.director.loadScene("hall");
            } else {
                if (self.isOver == false) {
                    th.userManager.roomId = self.roomId;
                    self.dispatchEvent("disconnect");
                } else {
                    self.roomId = null;
                    self.config = null;
                    self.seats = null;
                    self.round = null;
                    self.seatIndex = -1;
                }
            }
        });
    },

    getSeatIndexById: function getSeatIndexById(userId) {
        for (var i = 0; i < this.seats.length; i++) {
            if (this.seats[i].userId == userId) {
                return i;
            }
        }
        return -1;
    },

    getLocalIndex: function getLocalIndex(index) {
        var total = this.seats.length;
        var ret = (index - this.seatIndex + total) % total;
        return ret;
    },

    getSeatByUserId: function getSeatByUserId(userId) {
        var index = this.getSeatIndexById(userId);
        var seat = this.seats[index];
        return seat;
    },

    getWanfa: function getWanfa() {
        var str = [];
        str.push(this.config.peoples);
        str.push("人");
        str.push(" 结算");
        str.push(this.config.score);
        str.push(" 奖励");
        str.push(this.config.gift);
        return str.join("");
    },
    getDipai: function getDipai() {
        return this.config.liudipai ? this.config.peoples == 4 ? 8 : this.config.peoples == 3 ? 9 : 0 : 0;
    },

    isFangzhu: function isFangzhu() {
        return this.creator == th.userManager.userId;
    },

    isReady: function isReady(userId) {
        var seat = this.getSeatByUserId(userId);
        return seat.ready;
    },

    connectServer: function connectServer(data) {
        var onConnectSuccess = function onConnectSuccess() {
            cc.director.loadScene("game", function () {
                th.sio.ping();
                th.wc.hide();
            });
        };

        var onConnectError = function onConnectError(err) {
            th.wc.hide();
            th.alert.show('提示', err, null, false); //
        };
        th.sio.addr = "ws://" + data.ip + ":" + data.port + "?roomId=" + data.roomId + "&token=" + data.token + "&sign=" + data.sign + "&time=" + data.time;
        th.sio.connect(onConnectSuccess, onConnectError);
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
        //# sourceMappingURL=SocketIOManager.js.map
        