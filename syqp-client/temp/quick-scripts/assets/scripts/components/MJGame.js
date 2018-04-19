(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/MJGame.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4bfedfG94xLrbJd946qbcx3', 'MJGame', __filename);
// scripts/components/MJGame.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        lblMjCount: cc.Label,
        lblRoundCount: cc.Label,
        btnReady: cc.Button,
        btnGang: cc.Button,
        btnPeng: cc.Button,
        btnChi: cc.Button,
        btnHu: cc.Button,
        btnGuo: cc.Button,
        chupaidian: cc.Sprite,
        settingWin: cc.Node,
        menuWin: cc.Node,

        _mymjs: [], //自己手上的牌Sprite结合
        _effects: [] //每个座位动画节点（Animation）
    },

    onLoad: function onLoad() {
        if (th == null) {
            return;
        }
        this.addComponent("MJFolds");
        this.initView();
        this.initEventHandlers();
        th.audioManager.playBGM("bg_fight.mp3");
    },


    initView: function initView() {
        var holds = this.node.getChildByName('myself').getChildByName('Holds');
        for (var j = 0; j < holds.children.length; j++) {
            var sprite = holds.children[j].getComponent(cc.Sprite);
            this._mymjs.push(sprite);
            sprite.spriteFrame = null;
        }
        var seatNames = ["myself", "right", "up", "left"];
        for (var i = 0; i < seatNames.length; i++) {
            if (i == 2 && th.socketIOManager.seats.length == 3 || (i == 1 || i == 3) && th.socketIOManager.seats.length == 2) {
                continue;
            }
            var animComponent = this.node.getChildByName(seatNames[i]).getChildByName('Effect').getComponent(cc.Animation);
            this._effects.push(animComponent);
        }
        this.hideOptions();
    },

    initEventHandlers: function initEventHandlers() {
        var self = this;
        th.socketIOManager.dataEventHandler = this.node;

        this.node.on('init_room', function (target) {
            console.log('==>Gmae init_room:', JSON.stringify(target.detail));
        });
        //加入房间
        this.node.on('join_push', function (target) {
            console.log('==>Gmae join_push:', JSON.stringify(target.detail));
            self.initSingleSeat(target.detail);
        });
        //检查IP
        this.node.on('check_ip', function (target) {
            console.log('==>Gmae check_ip:', JSON.stringify(target.detail));
        });
        //离开房间
        this.node.on('leave_push', function (target) {
            console.log('==>Gmae leave_push:', JSON.stringify(target.detail));
            self.initSingleSeat(target.detail);
        });
        //解散房间
        this.node.on('dissolve_push', function (target) {
            console.log('==>Gmae dissolve_push:', JSON.stringify(target.detail));
        });
        //其他玩家断线
        this.node.on("offline_push", function (target) {
            console.log('==>Gmae offline_push:', JSON.stringify(target.detail));
            var seatIndex = th.socketIOManager.getSeatIndexById(target.detail.userId);
            var index = th.socketIOManager.getLocalIndex(seatIndex);
            self._seat[index].setOffline(true);
        });
        //其他玩家上线
        this.node.on("online_push", function (target) {
            console.log('==>Gmae online_push:', JSON.stringify(target.detail));
            var seatIndex = th.socketIOManager.getSeatIndexById(target.detail.userId);
            var index = th.socketIOManager.getLocalIndex(seatIndex);
            self._seat[index].setOffline(false);
        });
        //自己准备返回
        this.node.on("ready_result", function (target) {
            console.log('==>Gmae ready_result:', JSON.stringify(target.detail));
            var seat = target.detail;
            self.btnReady.node.active = th.socketIOManager.round == 0 && !seat.ready;
            self.initSingleSeat(seat);
        });
        //其他玩家准备
        this.node.on("ready_push", function (target) {
            console.log('==>Gmae ready_push:', JSON.stringify(target.detail));
            self.initSingleSeat(target.detail);
        });
        //玩家手上的牌
        this.node.on("holds_push", function (target) {
            console.log('==>Gmae holds_push:', JSON.stringify(target.detail));
            self.initPokers();
        });
        //开始游戏，出头的人
        this.node.on("begin_push", function (target) {
            console.log('==>Gmae begin_push:', JSON.stringify(target.detail));
            self.onGameBegin();
            //第一把开局，要检查IP
            if (th.socketIOManager.round == 1) {
                cc.log("check ip ....");
            }
        });

        //断线
        this.node.on('disconnect', function (target) {
            console.log('==>Gmae disconnect:', JSON.stringify(target.detail));
        });
    },
    onGameBegin: function onGameBegin() {
        //隐藏微信邀请，返回大厅，按钮，
        //启动第一个倒计时
        this._seat[th.socketIOManager.turn].setCountdown(20);
    },
    initPokers: function initPokers() {
        var seats = th.socketIOManager.seats;
        var seat = seats[th.socketIOManager.seatIndex];
        var holds = seat.holds;
        cc.log("initPokers:", holds);
        //排序
        holds.sort(function (a, b) {
            return a - b;
        });
        for (var i = 0; i < holds.length; i++) {
            var pokerId = holds[i];
            var sprite = this._myHoldPokers[i];
            sprite.node.pokerId = pokerId;
            sprite.spriteFrame = th.pokerManager.getSpriteFrameByPokerId(pokerId);
            sprite.node.active = true;
        }
        for (var i = 0; i < seats.length; i++) {
            this._seat[i].setRestCard(holds.length);
        }
    },

    /*
    update (dt) {
    },
    */

    hideOptions: function hideOptions(data) {
        var activeReadyBtn = th.socketIOManager.round == 0 && !th.socketIOManager.isReady(th.userManager.userId);
        this.btnReady.node.active = activeReadyBtn;
        this.btnGang.node.active = false;
        this.btnPeng.node.active = false;
        this.btnChi.node.active = false;
        this.btnHu.node.active = false;
        this.btnGuo.node.active = false;
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
        //# sourceMappingURL=MJGame.js.map
        