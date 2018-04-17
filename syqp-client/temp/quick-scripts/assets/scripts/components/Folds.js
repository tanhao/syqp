(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/Folds.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'de9d3K4PRxAB497YFYzZtA5', 'Folds', __filename);
// scripts/components/Folds.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        _folds: null
    },

    onLoad: function onLoad() {
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
        var names = ['left', 'myself', 'right', 'up'];
        var path = ["Canvas/myself/Folds1", "Canvas/myself/Folds2", "Canvas/right/Folds1/Folds", "Canvas/right/Folds2/Folds", "Canvas/up/Folds1", "Canvas/up/Folds2", "Canvas/left/Folds1", "Canvas/left/Folds2"];
        for (var i = 0; i < path.length; i++) {
            var pokers = cc.find(path[i]).children;
            var name = names[parseInt(i / 2)];
            for (var j = 0; j < pokers.length; j++) {
                var poker = pokers[j];
                poker.active = false;
                var sprite = poker.getComponent(cc.Sprite);
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
            var pokers = this._folds[key];
            for (var i = 0; i < pokers.length; i++) {
                pokers[i].node.active = false;
            }
        }
    },

    refreshAllSeat: function refreshAllSeat() {},

    refreshOneSeat: function refreshOneSeat() {}

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
        //# sourceMappingURL=Folds.js.map
        