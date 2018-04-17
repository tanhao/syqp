(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/AnysdkManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '38eefl+wMxId5kHf1PxI2t5', 'AnysdkManager', __filename);
// scripts/AnysdkManager.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function onLoad() {},

    // update: function (dt) {

    // },

    init: function init() {},

    getBatteryPercent: function getBatteryPercent() {
        if (cc.sys.isNative) {
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod(this.ANDROID_API, "getBatteryPercent", "()F");
            } else if (cc.sys.os == cc.sys.OS_IOS) {
                return jsb.reflection.callStaticMethod(this.IOS_API, "getBatteryPercent");
            }
        }
        return 0.9;
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
        //# sourceMappingURL=AnysdkManager.js.map
        