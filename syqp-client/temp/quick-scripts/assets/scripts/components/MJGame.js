(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/MJGame.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4bfedfG94xLrbJd946qbcx3', 'MJGame', __filename);
// scripts/components/MJGame.js

"use strict";

cc.Class({
    extends: cc.Component,
    properties: {
        lblMjCount: cc.Label,
        lblRoundCount: cc.Label,
        spriteCaishen: cc.Sprite,
        btnReady: cc.Button,
        btnGang: cc.Button,
        btnPeng: cc.Button,
        btnChi: cc.Button,
        btnHu: cc.Button,
        btnGuo: cc.Button,
        chupaidian: cc.Sprite,
        settingWin: cc.Node,
        optionsWin: cc.Node, ///所有可以做的操作节点
        nodePrepare: cc.Node,
        nodeGameInfo: cc.Node,
        nodeCaishen: cc.Node,

        _mymjs: [], //自己手上的牌Sprite结合
        _effects: [], //每个座位动画节点（Animation）
        _chupais: [], //每个座位出牌节点（Sprite）
        _hupaiTips: [] //每个座位胡牌提示节点:自摸，胡（抢杠胡）
    },
    onLoad: function onLoad() {
        if (th == null) {
            return;
        }
        this.addComponent("MJFolds");
        this.initView();
        this.initEventHandlers();

        this.nodePrepare.active = true;
        this.nodeGameInfo.active = false;

        this.onGameBegin();
        th.audioManager.playBGM("bg_fight.mp3");
    },

    initView: function initView() {
        //把自己的牌都设置为null
        var holds = this.node.getChildByName('myself').getChildByName('Holds');
        for (var j = 0; j < holds.children.length; j++) {
            var sprite = holds.children[j].getComponent(cc.Sprite);
            sprite.node.active = false;
            this._mymjs.push(sprite);
            sprite.spriteFrame = null;
        }

        var sides = ["myself", "right", "up", "left"];
        //隐藏其他玩家手上的牌
        for (var i = 1; i < sides.length; i++) {
            var mjs = this.node.getChildByName(sides[i]).getChildByName('Holds').children;
            for (var j = 0; j < mjs.length; j++) {
                var sprite = mjs[j].getComponent(cc.Sprite);
                sprite.node.active = false;
            }
        }
        for (var i = 0; i < sides.length; i++) {
            var seatNode = this.node.getChildByName(sides[i]);
            //出牌
            var spriteChupai = seatNode.getChildByName('Chupai').getComponent(cc.Sprite);
            spriteChupai.node.active = false;
            spriteChupai.spriteFrame = null;
            //胡牌NODE
            var nodeHupai = seatNode.getChildByName('HuPai');
            nodeHupai.node.active = false;
            if (i == 2 && th.socketIOManager.seats.length == 3 || (i == 1 || i == 3) && th.socketIOManager.seats.length == 2) {
                continue;
            }
            //操作效果
            var animation = seatNode.getChildByName('Effect').getComponent(cc.Animation);
            this._effects.push(animation);
            this._chupais.push(spriteChupai);
            this._hupaiTips.push(nodeHupai);
        }
        this.hideOptions();
    },
    initEventHandlers: function initEventHandlers() {
        var self = this;
        th.socketIOManager.dataEventHandler = this.node;

        //检查IP
        this.node.on('check_ip', function (target) {
            console.log('==>MJGame check_ip:', JSON.stringify(target.detail));
        });
        //自己准备返回
        this.node.on("ready_result", function (target) {
            console.log('==>Gmae ready_result:', JSON.stringify(target.detail));
            var seat = target.detail;
            self.btnReady.node.active = th.socketIOManager.round == 0 && !seat.ready;
        });

        //玩家手上的牌
        this.node.on("holds_push", function (target) {
            console.log('==>Gmae holds_push:', JSON.stringify(target.detail));
            self.initMahjongs();
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

        //通知还剩多少张牌
        this.node.on("mjsy_push", function (target) {
            console.log('==>Gmae mjsy_push:', JSON.stringify(target.detail));
            self.lblMjCount.string = "剩余 " + th.socketIOManager.mjsy + " 张";
        });

        //通知当前是第几局
        this.node.on("round_push", function (target) {
            console.log('==>Gmae round_push:', JSON.stringify(target.detail));
            self.lblRoundCount.string = "剩余 " + (th.socketIOManager.config.round - th.socketIOManager.round) + " 局";
        });

        this.node.on('begin_push', function (data) {
            console.log('==>Gmae begin_push:', JSON.stringify(target.detail));
            self.onGameBegin();
            //第一把开局，要提示
            if (th.socketIOManager.round == 1) {
                cc.log("check ip ....");
            }
        });

        this.node.on('chupai_push', function (data) {
            console.log('==>Gmae chupai_push:', JSON.stringify(target.detail));
            data = data.detail;
            self.hideChupai();
            if (data.last != th.socketIOManager.seatIndex) {
                self.initMopai(data.last, null);
            }
        });

        this.node.on('action_push', function (data) {
            console.log('==>Gmae action_push:', JSON.stringify(target.detail));
            self.showAction(data.detail);
        });
    },
    onGameBegin: function onGameBegin() {
        //隐藏每个座位上的动画sprite
        for (var i = 0; i < this._effects.length; i++) {
            this._effects[i].node.active = false;
        }

        //自摸胡判断
        for (var i = 0; i < th.socketIOManager.seats.length; I++) {
            var seatData = th.socketIOManager.seats[i];
            var localIndex = th.socketIOManager.getLocalIndex(i);
            var nodeHupai = this._hupaiTips[localIndex];
            nodeHupai.active = seatData.isHu;
            if (seatData.isHu) {
                nodeHupai.getChildByName("hu").active = !seatData.isZimo;
                nodeHupai.getChildByName("zimo").active = seatData.isZimo;
            }
            //todo 如果有胡牌信息
        }
        //隐藏各座位出牌点
        this.hideChupai();
        //隐藏当前玩家所有操作（吃，碰，杠，胡，弃）
        this.hideOptions();
        //初始化其他玩家手上的牌
        var sides = ["right", "up", "left"];
        for (var i = 0; i < sides.length; ++i) {
            var holds = this.node.getChildByName(sides[i]).getChildByName("Holds");
            for (var j = 0; j < holds.childrenCount; ++j) {
                var nc = holds.children[j];
                nc.active = true;
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
                var sprite = nc.getComponent(cc.Sprite);
                sprite.spriteFrame = th.mahjongManager.holdsEmpty[i + 1];
            }
        }
        //todo 判断是否回放

        this.nodePrepare.active = false;
        this.nodeGameInfo.active = true;

        this.initMahjongs();
    },
    getMJIndex: function getMJIndex(side, index) {
        if (side == "right" || side == "up") {
            return 13 - index;
        }
        return index;
    },
    initMopai: function initMopai(seatIndex, pai) {
        var localIndex = th.socketIOManager.getLocalIndex(seatIndex);
        var side = th.mahjongManager.getSide(localIndex);
        var pre = th.mahjongManager.getFoldPre(localIndex);
        var holds = this.node.getChildByName(side).getChildByName("Holds");
        var lastIndex = this.getMJIndex(side, 13);
        var nc = holds.children[lastIndex];

        nc.scaleX = 1.0;
        nc.scaleY = 1.0;
        if (pai == null) {
            nc.active = false;
        } else if (pai >= 0) {
            nc.active = true;
            //游戏回放时用到
            if (side == "up") {
                nc.scaleX = 0.73;
                nc.scaleY = 0.73;
            }
            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, pai);
        } else if (pai != null) {
            nc.active = true;
            //UP方向正常抓牌是-1
            if (side == "up") {
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
            }
            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = th.mahjongManager.getHoldsEmptySpriteFrame(side);
        }
    },
    hideChupai: function hideChupai() {
        for (var i = 0; i < this._chupais.length; i++) {
            this._chupais[i].node.active = false;
        }
    },
    showChupai: function showChupai() {
        var pai = th.socketIOManager.chupai;
        if (pai >= 0) {
            var localIndex = this.getLocalIndex(th.socketIOManager.turn);
            var sprite = this._chupais[localIndex];
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_", pai);
            sprite.node.active = true;
        }
    },
    showAction: function showAction(data) {
        if (this.optionsWin.active) {
            this.hideOptions();
        }
        if (data && (data.hu || data.gang || data.peng || data.chi)) {
            this._options.active = true;
            if (data.hu) {
                this.btnHu.node.active = true;
            }
            if (data.peng) {
                this.btnChi.node.active = true;
            }
            if (data.chi) {
                this.btnHu.node.active = true;
            }
            if (data.gang) {
                for (var i = 0; i < data.gangpai.length; ++i) {
                    var gp = data.gangpai[i];
                    this.addOption("btnGang", gp);
                }
            }
        }
    },
    initMahjongs: function initMahjongs() {
        //手上麻将
        var seats = th.socketIOManager.seats;
        var seatData = seats[th.socketIOManager.seatIndex];
        var holds = seatData.holds;
        cc.log("initMahjongs:", holds);
        //排序
        holds.sort(function (a, b) {
            return a - b;
        });

        var lackingNum = (seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.bugangs.length + seatData.chis.length) * 3;
        //初始化手牌
        for (var i = 0; i < holds.length; i++) {
            var mjid = holds[i];
            var sprite = this._mymjs[lackingNum + i];
            sprite.node.mjId = mjid;
            this.setSpriteFrameByMJID("M_", sprite, mjid);
        }
        for (var i = 0; i < lackingNum; i++) {
            var sprite = this._mymjs[i];
            sprite.node.mjId = null;
            sprite.spriteFrame = null;
            sprite.node.active = false;
        }
        for (var i = lackingNum + holds.length; i < this._mymjs.length; ++i) {
            var sprite = this._mymjs[i];
            sprite.node.mjId = null;
            sprite.spriteFrame = null;
            sprite.node.active = false;
        }
    },
    setSpriteFrameByMJID: function setSpriteFrameByMJID(pre, sprite, mjid) {
        sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, mjid);
        sprite.node.active = true;
    },
    hideOptions: function hideOptions(data) {
        this.optionsWin.active = false;
        var activeReadyBtn = th.socketIOManager.round == 0 && !th.socketIOManager.isReady(th.userManager.userId);
        this.btnReady.node.active = activeReadyBtn;
        this.btnGang.node.active = false;
        this.btnPeng.node.active = false;
        this.btnChi.node.active = false;
        this.btnHu.node.active = false;
        this.btnGuo.node.active = false;
    }

    /*
    update (dt) {
    },
    */
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
        