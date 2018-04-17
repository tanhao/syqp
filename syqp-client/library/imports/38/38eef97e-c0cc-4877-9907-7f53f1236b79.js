"use strict";
cc._RF.push(module, '38eefl+wMxId5kHf1PxI2t5', 'AnysdkManager');
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