(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/Alert.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '01a0eYD3wVLrLra9sMACvXk', 'Alert', __filename);
// scripts/components/Alert.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        btnConfirm: cc.Button,
        btnCancel: cc.Button,
        title: cc.Label,
        content: cc.Label,
        _fnConfirm: null
    },

    onLoad: function onLoad() {
        cc.log("Alert====>onload");
        if (th == null) {
            return null;
        }
        th.alert = this;
        this.node.active = false;
        this._fnConfirm = null;
    },


    /*
    update (dt) {
    },
    */

    show: function show(title, content, fnConfirm, showBtnCancel) {

        cc.log("showBtnCancel:" + showBtnCancel);
        if (this.node) {
            this.node.active = true;
        }
        if (this.title) {
            this.title.string = title || "";
        }
        if (this.content) {
            this.content.string = content || "";
        }
        this._fnConfirm = fnConfirm;
        if (showBtnCancel) {
            this.btnCancel.node.active = true;
            this.btnCancel.node.x = 160;
            this.btnConfirm.node.x = -160;
        } else {
            this.btnCancel.node.active = false;
            this.btnConfirm.node.x = 0;
        }
    },


    onCancelClicked: function onCancelClicked() {
        this.node.active = false;
    },

    onConfirmClicked: function onConfirmClicked() {
        this.node.active = false;
        if (this._fnConfirm) {
            this._fnConfirm();
        }
    },

    hide: function hide() {
        if (this.node) {
            this.node.active = false;
        }
    },


    onDestory: function onDestory() {
        if (th) {
            th.alert = null;
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
        //# sourceMappingURL=Alert.js.map
        