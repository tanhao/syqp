(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/WaitingConnection.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'c9213QZp3ROI7Fd7AOxsnlH', 'WaitingConnection', __filename);
// scripts/components/WaitingConnection.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        target: cc.Node,
        lblContent: cc.Label
    },

    onLoad: function onLoad() {
        cc.log("WaitingConnection====>onload");
        if (th == null) {
            return null;
        }
        th.wc = this;
        this.node.active = false;
    },
    update: function update(dt) {
        //cc.log(new Date().getTime());
        this.target.rotation = this.target.rotation - dt * 90;
    },
    show: function show(content) {
        if (this.node) {
            this.node.active = true;
        }
        if (this.lblContent) {
            this.lblContent.string = content || "";
        }
    },
    hide: function hide() {
        if (this.node) {
            this.node.active = false;
        }
    },


    onDestory: function onDestory() {
        if (th) {
            th.wc = null;
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
        //# sourceMappingURL=WaitingConnection.js.map
        