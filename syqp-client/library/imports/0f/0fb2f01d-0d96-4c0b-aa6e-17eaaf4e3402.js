"use strict";
cc._RF.push(module, '0fb2fAdDZZMC6puF+qvTjQC', 'MJFolds');
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
    },
    update: function update(dt) {},


    initView: function initView() {
        this._folds = {};
        this._folds.left = [];
        this._folds.myself = [];
        this._folds.right = [];
        this._folds.up = [];
        var names = ['myself', 'right', 'up', 'left'];
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            var mjs = this.node.getChildByName(name).getChildByName("Folds").children;
            for (var j = 0; j < mjs.length; j++) {
                var mj = mjs[j];
                mj.active = false;
                var sprite = mj.getComponent(cc.Sprite);
                sprite.spriteFrame = null;
                this._folds[name].push(sprite);
            }
        }
    },

    initEventHandler: function initEventHandler() {
        var self = this;
        this.node.on('game_begin', function (data) {
            self.initAllFolds();
        });
    },

    hideAllFolds: function hideAllFolds() {
        cc.log("Folds hideAllFolds.....");
        for (var key in this._folds) {
            var mjs = this._folds[key];
            for (var i = 0; i < mjs.length; i++) {
                mjs[i].node.active = false;
            }
        }
    },

    refreshAllSeat: function refreshAllSeat() {},

    refreshOneSeat: function refreshOneSeat() {}

});

cc._RF.pop();