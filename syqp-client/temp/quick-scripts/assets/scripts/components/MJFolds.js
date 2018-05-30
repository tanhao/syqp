(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/MJFolds.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '0fb2fAdDZZMC6puF+qvTjQC', 'MJFolds', __filename);
// scripts/components/MJFolds.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        _folds: null
    },

    onLoad: function onLoad() {
        if (th == null) {
            return;
        }
        this.initView();
        this.initEventHandler();
        this.initAllFolds();
    },
    update: function update(dt) {},


    initView: function initView() {
        this._folds = {};
        this._folds.left = [];
        this._folds.myself = [];
        this._folds.right = [];
        this._folds.up = [];
        var sides = ['myself', 'right', 'up', 'left'];
        for (var i = 0; i < sides.length; i++) {
            var side = sides[i];
            var folds = this.node.getChildByName(side).getChildByName("Folds");
            for (var j = 1; j <= folds.children.length; j++) {
                var mj = folds.getChildByName("mj" + j);
                mj.active = false;
                var sprite = mj.getComponent(cc.Sprite);
                sprite.spriteFrame = null;
                this._folds[side].push(sprite);
            }
        }
    },

    initEventHandler: function initEventHandler() {
        var self = this;
        this.node.on('begin_push', function (data) {
            self.initAllFolds();
        });
        //过牌
        this.node.on('guo_notify_push', function (data) {
            //cc.log('==>MJFolds guo_notify_push:',JSON.stringify(data.detail));
            self.initFolds(data.detail);
        });
        //出牌
        this.node.on('chupai_notify_push', function (data) {
            //cc.log('==>MJFolds chupai_notify_push:',JSON.stringify(data.detail));
            self.initFolds(data.detail.seatData);
        });

        this.node.on('sync_push', function (data) {
            //cc.log('==>MJFolds chupai_notify_push:',JSON.stringify(data.detail));
            self.initAllFolds();
        });

        this.node.on('clean_push', function () {
            self.initAllFolds();
        });
    },
    hideAllFolds: function hideAllFolds() {
        for (var key in this._folds) {
            var mjs = this._folds[key];
            for (var i = 0; i < mjs.length; i++) {
                mjs[i].node.active = false;
            }
        }
    },
    initAllFolds: function initAllFolds() {
        var seats = th.socketIOManager.seats;
        for (var i in seats) {
            this.initFolds(seats[i]);
        }
    },
    initFolds: function initFolds(seatData) {
        var folds = seatData.folds;
        if (folds == null) {
            return;
        }
        var localIndex = th.socketIOManager.getLocalIndex(seatData.index);
        var pre = th.mahjongManager.getFoldPre(localIndex);
        var side = th.mahjongManager.getSide(localIndex);
        var foldsSprites = this._folds[side];

        for (var i = 0; i < foldsSprites.length; ++i) {
            var index = i;
            /*
            if(side == "right" || side == "up"){
                index = foldsSprites.length - i - 1;
            }
            */
            var sprite = foldsSprites[index];
            sprite.node.active = true;
            this.setSpriteFrameByMJID(pre, sprite, folds[i]);
        }
        for (var i = folds.length; i < foldsSprites.length; ++i) {
            var index = i;
            /*
            if(side == "right" || side == "up"){
                index = foldsSprites.length - i - 1;
            }
            */
            var sprite = foldsSprites[index];
            sprite.spriteFrame = null;
            sprite.node.active = false;
        }
    },
    refreshAllSeat: function refreshAllSeat() {},
    refreshOneSeat: function refreshOneSeat() {},
    setSpriteFrameByMJID: function setSpriteFrameByMJID(pre, sprite, mjid) {
        sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, mjid);
        sprite.node.active = true;
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
        //# sourceMappingURL=MJFolds.js.map
        