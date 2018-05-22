(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/MJReConnect.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '54de3Nitr1HaaQyXFuS6GIL', 'MJReConnect', __filename);
// scripts/components/MJReConnect.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        _reconnect: null,
        _lblTip: null,
        _loading_image: null,
        _lastPing: 0
    },

    // use this for initialization
    onLoad: function onLoad() {
        cc.log("MJReconnect onload");
        this._reconnect = cc.find("Canvas/ReConnect");
        this._loading_image = this._reconnect.getChildByName("loading_image");
        var self = this;

        var fnTestServerOn = function fnTestServerOn() {
            /* cc.vv.net.test(function (ret) {
                if (ret) {
                    cc.vv.gameNetMgr.reset();
                    //cc.director.loadScene('hall');
                    var roomId = cc.vv.userMgr.oldRoomId;
                    if (roomId != null) {
                        cc.vv.userMgr.oldRoomId = null;
                        cc.vv.userMgr.enterRoom(roomId, function (ret) {
                            if (ret.errcode != 0) {
                                cc.vv.gameNetMgr.roomId = null;
                                cc.director.loadScene('hall');
                            }
                        });
                    }
                }
                else {
                    setTimeout(fnTestServerOn, 3000);
                }
            }); */
        };

        var fn = function fn(data) {
            self.node.off('disconnect', fn);
            self._reconnect.active = true;
            console.log("MJREConnect disconnect");
            ////fnTestServerOn();
        };

        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("MJREConnect EVENT_HIDE");
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("MJREConnect EVENT_SHOW");
        });

        /*
        this.node.on('login_finished', function () {
            self._reconnect.active = false;
            self.node.on('disconnect', fn);
        });
        */

        this.node.on('disconnect', fn);
    },
    update: function update(dt) {
        if (this._reconnect.active) {
            this._loading_image.rotation = this._loading_image.rotation - dt * 45;
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
        //# sourceMappingURL=MJReConnect.js.map
        