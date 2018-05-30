"use strict";
cc._RF.push(module, 'f3060chRz9FU6rQ3OvSu7my', 'SocketIOManager');
// scripts/SocketIOManager.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        dataEventHandler: null, //处理socket.io发过来的数据的节点
        isRepeatLogin: false,
        roomId: null,
        config: null,
        seats: null,
        round: null, //当前第几局,算剩余几局用config.round-this.round
        creator: null, //房主ID
        chupai: null, //出的牌
        caishen: null, //财神 
        seatIndex: -1, //座位Index
        bankerIndex: -1, //庄Index
        turn: -1, //轮到谁出牌了
        mjsy: 0, //剩余麻将
        needCheckIp: false,
        status: 'idle', //状态  idle,beging
        actions: null, //玩家可以做操作
        isOver: false
    },
    onLoad: function onLoad() {},


    /*
    update (dt) {
    },
    */
    resetGame: function resetGame() {
        this.resetRound();
        th.userManager.roomId = null;
        this.isRepeatLogin = false;
        //this.roomId=null;
        this.config = null;
        this.seats = null;
        this.creator = null;
        this.isOver = true, this.seatIndex = -1;
    },
    resetRound: function resetRound() {
        this.chupai = -1;
        this.caishen = null;
        this.bankerIndex = -1;
        this.turn = -1;
        this.mjsy = 0;
        this.needCheckIp = false;
        this.status = 'idle';
        this.actions = null;
        for (var i = 0; i < this.seats.length; i++) {
            this.seats[i].holds = [];
            this.seats[i].folds = [];
            this.seats[i].chis = [];
            this.seats[i].pengs = [];
            this.seats[i].angangs = [];
            this.seats[i].diangangs = [];
            this.seats[i].bugangs = [];
            this.seats[i].ready = false;
            this.seats[i].isHu = false;
        }
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
            self.isRepeatLogin = false;
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
            self.roomId = null;
            self.resetGame();
        });
        //步整个信息给客户端
        th.sio.addHandler("sync_push", function (data) {
            cc.log("==>SocketIOManager sync_push:", JSON.stringify(data));
            self.mjsy = data.mjsy;
            self.status = data.status;
            self.turn = data.turn;
            self.bankerIndex = data.bankerIndex;
            self.chupai = data.chupai;
            self.caishen = data.caishen;
            for (var i = 0; i < data.seats.length; i++) {
                var seat = self.seats[i];
                var sd = data.seats[i];
                seat.holds = sd.holds;
                seat.folds = sd.folds;
                seat.angangs = sd.angangs;
                seat.diangangs = sd.diangangs;
                seat.bugangs = sd.bugangs;
                seat.pengs = sd.pengs;
                seat.chis = sd.chis;
                seat.ready = sd.ready;
            }
            self.dispatchEvent('sync_push');
            self.dispatchEvent("mjsy_push");
            self.dispatchEvent("caishen_push");
        });
        //其他玩家离开房间
        th.sio.addHandler("leave_push", function (data) {
            cc.log("==>SocketIOManager leave_push:", JSON.stringify(data));
            var userId = data.userId;
            var seat = self.getSeatByUserId(userId);
            cc.log("leave:", seat);
            if (seat) {
                seat.userId = null;
                seat.name = null;
                seat.headImgUrl = null;
                seat.sex = null;
                seat.score = 0;
                seat.ready = false;
                seat.online = false;
            }
            self.dispatchEvent("leave_push", seat);
        });
        //解散房间，所有玩家退出房间，收到此消息返回大厅
        th.sio.addHandler("dissolve_push", function (data) {
            self.roomId = null;
            self.resetGame();
            cc.log("==>SocketIOManager dissolve_push:", JSON.stringify(data));
        });
        //其他玩家断线
        th.sio.addHandler("offline_push", function (data) {
            cc.log("==>SocketIOManager offline_push:", JSON.stringify(data));
            if (self.roomId != null && !self.isOver) {
                self.dispatchEvent("offline_push", data);
            }
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
            for (var i = 0; i < self.seats.length; ++i) {
                var s = self.seats[i];
                if (s.folds == null) {
                    s.folds = [];
                }
                if (s.angangs == null) {
                    s.angangs = [];
                }
                if (s.diangangs == null) {
                    s.diangangs = [];
                }
                if (s.bugangs == null) {
                    s.bugangs = [];
                }
                if (s.pengs == null) {
                    s.pengs = [];
                }
                if (s.chis == null) {
                    s.chis = [];
                }
                s.ready = false;
            }
            self.dispatchEvent("holds_push");
        });
        //通知还剩多少张牌
        th.sio.addHandler("mjsy_push", function (data) {
            cc.log("==>SocketIOManager mjsy_push:", data);
            self.mjsy = data;
            self.dispatchEvent("mjsy_push");
        });
        //通知当前是第几局
        th.sio.addHandler("round_push", function (data) {
            cc.log("==>SocketIOManager round_push:", data);
            self.round = data;
            self.dispatchEvent("round_push");
        });
        //通知财神
        th.sio.addHandler("caishen_push", function (data) {
            cc.log("==>SocketIOManager caishen_push:", data);
            self.caishen = data;
            self.dispatchEvent("caishen_push");
        });
        //开始游戏基本消息
        th.sio.addHandler("begin_push", function (data) {
            cc.log("==>SocketIOManager begin_push:", data);
            self.bankerIndex = data;
            self.turn = self.bankerIndex;
            self.status = "begin";
            self.dispatchEvent("begin_push");
        });
        //谁出牌
        th.sio.addHandler("chupai_push", function (data) {
            cc.log("==>SocketIOManager chupai_push:", JSON.stringify(data));
            var turnUserId = data;
            var seatIndex = self.getSeatIndexById(turnUserId);
            self.doTurnChange(seatIndex);
        });
        //出牌时可以做的操作
        th.sio.addHandler("action_push", function (data) {
            cc.log("==>SocketIOManager action_push:", JSON.stringify(data));
            self.actions = data;
            self.dispatchEvent("action_push", data);
        });
        th.sio.addHandler("guo_result", function (data) {
            self.dispatchEvent('guo_result');
        });
        th.sio.addHandler("guo_notify_push", function (data) {
            //cc.log("socketIOManager guo_notify_push:",data);
            var userId = data.userId;
            var pai = data.pai;
            var seatIndex = self.getSeatIndexById(userId);
            self.doGuo(seatIndex, data.pai);
        });
        th.sio.addHandler("chi_notify_push", function (data) {
            var userId = data.userId;
            var pai = data.pai;
            var seatIndex = self.getSeatIndexById(userId);
            self.doChi(seatIndex, data.info, pai);
        });
        th.sio.addHandler("peng_notify_push", function (data) {
            var userId = data.userId;
            var pai = data.pai;
            var seatIndex = self.getSeatIndexById(userId);
            self.doPeng(seatIndex, data.info);
        });
        th.sio.addHandler("hangang_notify_push", function (data) {
            self.dispatchEvent("hangang_notify_push", data);
        });
        th.sio.addHandler("gang_notify_push", function (data) {
            cc.log("socketIOManager gang_notify_push:", data);
            var userId = data.userId;
            var pai = data.pai;
            var seatIndex = self.getSeatIndexById(userId);
            self.doGang(seatIndex, data.info, data.gangType);
        });
        th.sio.addHandler("chupai_notify_push", function (data) {
            var userId = data.userId;
            var pai = data.pai;
            var seatIndex = self.getSeatIndexById(userId);
            self.doChupai(seatIndex, pai);
        });
        th.sio.addHandler("mopai_push", function (data) {
            self.doMopai(self.seatIndex, data);
        });
        th.sio.addHandler("hu_push", function (data) {
            cc.log("socketIOManager hu_push:", data);
            self.doHu(data);
        });
        th.sio.addHandler("hu_notify_push", function (data) {
            self.doHu(data);
        });
        th.sio.addHandler("game_over_push", function (data) {
            var results = data.results;
            for (var i = 0; i < self.seats.length; i++) {
                self.seats[i].score = results.length == 0 ? 0 : results[i].totalScore;
            }
            for (var i = 0; i < self.seats.length; ++i) {
                self.dispatchEvent('score_push', self.seats[i]);
            }
            self.dispatchEvent("game_over", results);
            if (data.endInfo) {
                self.isOver = true;
                self.dispatchEvent('game_end', data.endInfo);
                self.resetGame();
            } else {
                self.resetRound();
                self.dispatchEvent('clean_push');
            }
        });
        th.sio.addHandler("repeat_login", function (data) {
            self.resetGame();
            self.isRepeatLogin = true;
            self.dispatchEvent('repeat_login');
        });

        //断线
        th.sio.addHandler("disconnect", function (data) {
            /*
               th.alert.show("提示","您的账号已在别处登录！",function(){
                th.wc.show('正在返回登录场景');
                cc.director.loadScene("login");
            },false);
            */
            if (self.isRepeatLogin) {
                cc.log("disconnect==>>self.isRepeatLogin");
                self.isRepeatLogin = true;
                th.alert.show("提示", "您的账号已在别处登录！", function () {
                    th.wc.show('正在返回登录场景');
                    cc.director.loadScene("login");
                }, false);
            } else if (self.roomId == null) {
                cc.log("disconnect==>>self.roomId == null");
                th.userManager.roomId = null;
                th.wc.show('正在返回游戏大厅');
                cc.director.loadScene("hall");
            } else {
                if (self.isOver == false) {
                    cc.log("disconnect==>>self.isOver == false");
                    th.userManager.roomId = self.roomId;
                    self.dispatchEvent("disconnect");
                } else {
                    th.userManager.roomId = null;
                    self.roomId = null;
                    self.config = null;
                    self.seats = null;
                    self.round = null;
                    self.seatIndex = -1;
                }
            }
        });
    },
    getGangType: function getGangType(seatData, pai) {
        var idx = -1;
        for (var i = 0; i < seatData.pengs.length; i++) {
            if (seatData.pengs[i].mjid == pai) {
                idx = i;
                break;
            }
        }
        if (idx != -1) {
            return "bugang";
        } else {
            var cnt = 0;
            for (var i = 0; i < seatData.holds.length; ++i) {
                if (seatData.holds[i] == pai) {
                    cnt++;
                }
            }
            if (cnt == 3) {
                return "diangang";
            } else {
                return "angang";
            }
        }
    },
    doGuo: function doGuo(seatIndex, pai) {
        var seatData = this.seats[seatIndex];
        var folds = seatData.folds;
        folds.push(pai.mjid);
        this.dispatchEvent('guo_notify_push', seatData);
    },
    doChi: function doChi(seatIndex, info, pai) {
        var seatData = this.seats[seatIndex];
        //移除手牌
        if (seatData.holds) {
            for (var i = 0; i < info.mjids.length; ++i) {
                if (info.mjids[i] == pai) {
                    continue;
                }
                var idx = seatData.holds.indexOf(info.mjids[i]);
                seatData.holds.splice(idx, 1);
            }
            //更新碰牌数据
        }
        var chis = seatData.chis;
        chis.push(info);
        this.dispatchEvent('chi_notify_push', seatData);
    },
    doPeng: function doPeng(seatIndex, info) {
        var seatData = this.seats[seatIndex];
        //移除手牌
        if (seatData.holds) {
            for (var i = 0; i < 2; ++i) {
                var idx = seatData.holds.indexOf(info.mjid);
                seatData.holds.splice(idx, 1);
            }
        }
        //更新碰牌数据
        var pengs = seatData.pengs;
        pengs.push(info);
        this.dispatchEvent('peng_notify_push', seatData);
    },
    doGang: function doGang(seatIndex, info, gangType) {
        cc.log("gangType", gangType, " info:", info);
        var seatData = this.seats[seatIndex];
        var pai = info.mjid;
        if (!gangType) {
            gangType = this.getGangType(seatData, pai);
        }
        if (gangType == "bugang") {
            var idx = -1;
            for (var i = 0; i < seatData.pengs.length; i++) {
                if (seatData.pengs[i].mjid == pai) {
                    idx = i;
                    break;
                }
            }
            if (idx != -1) {
                seatData.pengs.splice(idx, 1);
            }
            seatData.bugangs.push(info);
        }
        if (seatData.holds) {
            for (var i = 0; i <= 4; ++i) {
                var idx = seatData.holds.indexOf(pai);
                if (idx == -1) {
                    //如果没有找到，表示移完了，直接跳出循环
                    break;
                }
                seatData.holds.splice(idx, 1);
            }
        }
        if (gangType == "angang") {
            seatData.angangs.push(info);
        } else if (gangType == "diangang") {
            seatData.diangangs.push(info);
        }
        this.dispatchEvent('gang_notify_push', seatData);
    },
    doChupai: function doChupai(seatIndex, pai) {
        this.chupai = pai;
        var seatData = this.seats[seatIndex];
        if (seatData.holds) {
            var idx = seatData.holds.indexOf(pai);
            seatData.holds.splice(idx, 1);
        }
        this.dispatchEvent('chupai_notify_push', { seatData: seatData, pai: pai });
    },
    doMopai: function doMopai(seatIndex, pai) {
        var seatData = this.seats[seatIndex];
        if (seatData.holds) {
            seatData.holds.push(pai);
            this.dispatchEvent('mopai_push', { seatIndex: seatIndex, pai: pai });
        }
    },
    doHu: function doHu(data) {
        this.dispatchEvent('hu_push', data);
    },
    doTurnChange: function doTurnChange(seatIndex) {
        var data = {
            last: this.turn,
            turn: seatIndex
        };
        this.turn = seatIndex;
        this.dispatchEvent('chupai_push', data);
    },
    getSeatIndexById: function getSeatIndexById(userId) {
        for (var i = 0; i < this.seats.length; i++) {
            if (this.seats[i].userId == parseInt(userId)) {
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
        str.push("封顶");
        str.push(this.config.fengding);
        str.push("，");
        str.push(this.config.difen);
        str.push("分，");
        str.push(this.config.zuozhuang == 'QZ' ? '抢庄' : '轮庄');
        str.push("，");
        str.push(this.config.payment == 'FZ' ? '房主付' : 'AA付');
        str.push(this.config.ctdsq ? '，吃吐荡三圈' : '');
        return str.join("");
    },
    isFangzhu: function isFangzhu() {
        return this.creator == th.userManager.userId;
    },
    isReady: function isReady(userId) {
        var seat = this.getSeatByUserId(userId);
        return seat.ready;
    },
    connectServer: function connectServer(data) {
        var self = this;
        var onConnectSuccess = function onConnectSuccess() {
            cc.director.loadScene("mjgame", function () {
                th.sio.ping();
                th.wc.hide();
                self.dispatchEvent("connect_success");
            });
        };

        var onConnectError = function onConnectError(err) {
            th.wc.hide();
            th.alert.show('提示', err, null, false); //
        };
        th.sio.ip = data.ip;
        th.sio.port = data.port;
        th.sio.addr = "ws://" + data.ip + ":" + data.port + "?roomId=" + data.roomId + "&token=" + data.token + "&sign=" + data.sign + "&time=" + data.time;
        th.sio.connect(onConnectSuccess, onConnectError);
    }

});

cc._RF.pop();