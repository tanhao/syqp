"use strict";
cc._RF.push(module, 'b73c4UBdqFO/bi0FH4AbkeD', 'Utils');
// scripts/Utils.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {},

    addClickEvent: function addClickEvent(node, target, component, handler) {
        console.log(component + ":" + handler);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

    addSlideEvent: function addSlideEvent(node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
    },

    addEscEvent: function addEscEvent(node) {
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {},
            onKeyReleased: function onKeyReleased(keyCode, event) {
                if (keyCode == cc.KEY.back) {
                    cc.vv.alert.show('提示', '确定要退出游戏吗？', function () {
                        cc.game.end();
                    }, true);
                }
            }
        }, node);
    }

    // update: function (dt) {

    // },
});

cc._RF.pop();