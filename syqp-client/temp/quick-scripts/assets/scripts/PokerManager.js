(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/PokerManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'f2f68CZNIVLorXkAtu41abU', 'PokerManager', __filename);
// scripts/PokerManager.js

"use strict";

var pokerSprites = [];

cc.Class({
    extends: cc.Component,

    properties: {
        pokerAtlas: {
            default: null,
            type: cc.SpriteAtlas
        }
    },

    onLoad: function onLoad() {
        if (th == null) return;
        th.pokerManager = this;
        /*
        
        var flower=['spades','hearts','clubs','diamonds'];
        for(var i=0;i<flower.length;i++){
            for(var j=5;j<=15;j++){
              }
        }
        */
    },

    getSpriteFrameByPokerId: function getSpriteFrameByPokerId(pokerId) {
        var flower = pokerId % 10;
        flower = flower == 4 ? "spades" : flower == 3 ? "hearts" : flower == "2" ? "clubs" : "diamonds";
        var value = parseInt(pokerId / 10);
        return this.pokerAtlas.getSpriteFrame(flower + "_" + value);
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
        //# sourceMappingURL=PokerManager.js.map
        