(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/Score.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'e16eePXRDlJlYq2riTc6+vU', 'Score', __filename);
// scripts/components/Score.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        score5: cc.Label,
        score10: cc.Label,
        scoreK: cc.Label,
        scoreTotal: cc.Label

    },

    onLoad: function onLoad() {},
    update: function update(dt) {}
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
        //# sourceMappingURL=Score.js.map
        