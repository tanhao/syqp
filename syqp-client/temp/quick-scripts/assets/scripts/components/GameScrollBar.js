(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/GameScrollBar.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'a2747akXS9P6L0ATNR/aQ3U', 'GameScrollBar', __filename);
// scripts/components/GameScrollBar.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        _lastPosY: 0,
        _isScrollBegan: false
    },

    onLoad: function onLoad() {},
    start: function start() {
        var btnHeight = 174;
        var currentIndex = 3;
        var posY = 0;
        var scrollView = this.node.getComponent(cc.ScrollView);
        var buttons = scrollView.getComponentsInChildren(cc.Button);
        for (var i = 0; i < buttons.length; i++) {
            var scale = Math.abs(posY + (3 - i) * btnHeight) / 800;
            buttons[i].node.setScale(1 - scale);
            buttons[i].node.setColor(i == currentIndex ? cc.color(255, 255, 255) : cc.color(120, 120, 120));
        }
    },
    update: function update(dt) {},


    onGameBarScroll: function onGameBarScroll(scrollView, eventType, customEventData) {
        var posY = parseInt(scrollView.getContentPosition().y);
        if (eventType === cc.ScrollView.EventType.SCROLLING && Math.abs(posY - this._lastPosY) > 1) {
            this._lastPosY = posY;
            var buttons = scrollView.getComponentsInChildren(cc.Button);
            var btnHeight = 174;
            var currentIndex = parseInt((posY + btnHeight / 2 * (posY > 0 ? 1 : -1)) / btnHeight) + 3;
            currentIndex = currentIndex < 0 ? 0 : currentIndex > buttons.length - 1 ? buttons.length - 1 : currentIndex;
            for (var i = 0; i < buttons.length; i++) {
                var scale = Math.abs(posY + (3 - i) * btnHeight) / 800;
                buttons[i].node.setScale(1 - scale);
                buttons[i].node.setColor(i == currentIndex ? cc.color(255, 255, 255) : cc.color(120, 120, 120));
            }
        } else if (eventType === cc.ScrollView.EventType.SCROLL_ENDED) {
            if (this._isScrollBegan) {
                var buttons = scrollView.getComponentsInChildren(cc.Button);
                var btnHeight = 174;
                var currentIndex = parseInt((posY + btnHeight / 2 * (posY > 0 ? 1 : -1)) / btnHeight) + 3;
                currentIndex = currentIndex < 0 ? 0 : currentIndex > buttons.length - 1 ? buttons.length - 1 : currentIndex;
                var max = scrollView.getMaxScrollOffset().y;
                scrollView.scrollToOffset(cc.p(0, max / 2 + (currentIndex - 3) * btnHeight), 1);
                this._isScrollBegan = false;
            }
        } else if (eventType === cc.ScrollView.EventType.SCROLL_BEGAN) {
            this._isScrollBegan = true;
        }
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
        //# sourceMappingURL=GameScrollBar.js.map
        