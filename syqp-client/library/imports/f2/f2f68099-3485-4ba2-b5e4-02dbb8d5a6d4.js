"use strict";
cc._RF.push(module, 'f2f68CZNIVLorXkAtu41abU', 'PokerManager');
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