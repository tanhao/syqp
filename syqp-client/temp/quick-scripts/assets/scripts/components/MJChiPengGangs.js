(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/components/MJChiPengGangs.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '0b065EljOlPxbmdDzwTjWvK', 'MJChiPengGangs', __filename);
// scripts/components/MJChiPengGangs.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function onLoad() {
        if (th == null) {
            return;
        }
        var self = this;
        var myself = this.node.getChildByName("myself");
        var nodeChiPengGang = myself.getChildByName("ChiPengGang");
        var realwidth = cc.director.getVisibleSize().width;
        var scale = realwidth / 1280;
        nodeChiPengGang.scaleX *= scale;
        nodeChiPengGang.scaleY *= scale;

        this.node.on('chi_notify_push', function (data) {
            console.log("==>ChiPengGang chi_notify_push", data.detail);
            var data = data.detail;
            self.onChiPengGangChanged(data);
        });

        this.node.on('peng_notify_push', function (data) {
            console.log("==>ChiPengGang peng_notify_push", data.detail);
            var data = data.detail;
            self.onChiPengGangChanged(data);
        });

        this.node.on('gang_notify_push', function (data) {
            console.log("==>ChiPengGang gang_notify_push", data.detail);
            self.onChiPengGangChanged(data.detail);
        });

        this.node.on('begin_push', function (data) {
            self.onGameBegin();
        });

        var seats = th.socketIOManager.seats;
        for (var i in seats) {
            this.onChiPengGangChanged(seats[i]);
        }
    },
    onGameBegin: function onGameBegin() {
        this.hideSide("myself");
        this.hideSide("right");
        this.hideSide("up");
        this.hideSide("left");
    },
    hideSide: function hideSide(side) {
        var nodeSide = this.node.getChildByName(side);
        var nodeChiPengGang = nodeSide.getChildByName("ChiPengGang");
        if (nodeChiPengGang) {
            for (var i = 0; i < nodeChiPengGang.childrenCount; ++i) {
                nodeChiPengGang.children[i].active = false;
            }
        }
    },
    onChiPengGangChanged: function onChiPengGangChanged(seatData) {
        if (seatData.pengs == null && seatData.angangs == null && seatData.diangangs == null && seatData.bugangs == null && seatData.chis == null) {
            return;
        }
        var localIndex = th.socketIOManager.getLocalIndex(seatData.index);
        var side = th.mahjongManager.getSide(localIndex);
        var pre = th.mahjongManager.getFoldPre(localIndex);
        var nodeSide = this.node.getChildByName(side);
        var nodeChiPengGang = nodeSide.getChildByName("ChiPengGang");
        for (var i = 0; i < nodeChiPengGang.childrenCount; ++i) {
            nodeChiPengGang.children[i].active = false;
        }
        //初始化杠牌
        var index = 0;
        var gangs = seatData.angangs;
        for (var i = 0; i < gangs.length; ++i) {
            var mjid = gangs[i];
            this.initChiPengAndGangs(nodeChiPengGang, side, pre, index, mjid, "angang", seatData.index);
            index++;
        }
        gangs = seatData.diangangs;
        for (var i = 0; i < gangs.length; ++i) {
            var mjid = gangs[i];
            this.initChiPengAndGangs(nodeChiPengGang, side, pre, index, mjid, "diangang", seatData.index);
            index++;
        }
        gangs = seatData.bugangs;
        for (var i = 0; i < gangs.length; ++i) {
            var mjid = gangs[i];
            this.initChiPengAndGangs(nodeChiPengGang, side, pre, index, mjid, "bugang", seatData.index);
            index++;
        }
        //初始化碰牌
        var pengs = seatData.pengs;
        if (pengs) {
            for (var i = 0; i < pengs.length; ++i) {
                var mjid = pengs[i];
                this.initChiPengAndGangs(nodeChiPengGang, side, pre, index, mjid, "peng", seatData.index);
                index++;
            }
        }
        //初始化吃的牌
        var chis = seatData.chis;
        if (chis) {
            for (var i = 0; i < chis.length; ++i) {
                var mjid = chis[i];
                this.initChiPengAndGangs(nodeChiPengGang, side, pre, index, mjid, "chi", seatData.index);
                index++;
            }
        }
    },
    initChiPengAndGangs: function initChiPengAndGangs(nodeChiPengGang, side, pre, index, info, flag, seatIndex) {
        console.log("initChiPengAndGangs", side, pre, index, info, flag);
        var nodeCPG = null;
        if (nodeChiPengGang.childrenCount <= index) {
            if (side == "left" || side == "right") {
                nodeCPG = cc.instantiate(th.mahjongManager.pengPrefabLeft);
            } else {
                nodeCPG = cc.instantiate(th.mahjongManager.pengPrefabSelf);
            }
            nodeChiPengGang.addChild(nodeCPG);
        } else {
            nodeCPG = nodeChiPengGang.children[index];
            nodeCPG.active = true;
        }
        if (side == "left") {
            nodeCPG.y = -(index * 25 * 3);
        } else if (side == "right") {
            nodeCPG.y = index * 25 * 3;
            nodeCPG.setLocalZOrder(-index);
        } else if (side == "myself") {
            nodeCPG.x = index * 55 * 3 + index * 10;
        } else {
            nodeCPG.x = -(index * 55 * 3) - index * 7;
        }

        var sprites = nodeCPG.getComponentsInChildren(cc.Sprite);
        if (flag == "angang") {
            for (var i = 0; i < sprites.length; i++) {
                if (sprite.node.name == "point_left" || sprite.node.name == "point_dui" || sprite.node.name == "point_right") {
                    sprite.node.active = false;
                }
                var sprite = sprites[i];
                sprite.node.active = true;
                sprite.spriteFrame = th.mahjongManager.getEmptySpriteFrame(side);
            }
        } else if (flag == "diangang" || flag == "bugang") {
            var isUp = false;
            var isNext = false;
            var isDui = false;
            if (this.getUpSeatIndex(seatIndex) == info.idx) {
                isUp = true;
                isNext = false;
                isDui = false;
            } else if (this.getNextSeatIndex(seatIndex) == info.idx) {
                isUp = false;
                isNext = true;
                isDui = false;
            } else {
                isUp = false;
                isNext = false;
                isDui = true;
            }
            for (var i = 0; i < sprites.length; i++) {
                var sprite = sprites[i];
                if (sprite.node.name == "point_left" || sprite.node.name == "point_right" || sprite.node.name == "point_dui") {
                    if (sprite.node.name == "point_left") {
                        sprite.node.active = isUp;
                    } else if (sprite.node.name == "point_right") {
                        sprite.node.active = isNext;
                    } else if (sprite.node.name == "point_dui") {
                        sprite.node.active = isDui;
                    }
                    if (side == "up") {
                        sprite.node.y -= 100;
                    } else if (side == "right") {
                        sprite.node.x -= 40;
                    }
                    continue;
                }
                sprite.node.active = true;
                sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, info.mjid);
            }
        } else if (flag == "peng") {
            var isUp = false;
            var isNext = false;
            var isDui = false;
            if (this.getUpSeatIndex(seatIndex) == info.idx) {
                isUp = true;
                isNext = false;
                isDui = false;
            } else if (this.getNextSeatIndex(seatIndex) == info.idx) {
                isUp = false;
                isNext = true;
                isDui = false;
            } else {
                isUp = false;
                isNext = false;
                isDui = true;
            }
            for (var i = 0; i < sprites.length; i++) {
                var sprite = sprites[i];
                if (sprite.node.name == "point_left" || sprite.node.name == "point_right" || sprite.node.name == "point_dui") {
                    if (sprite.node.name == "point_left") {
                        sprite.node.active = isUp;
                    } else if (sprite.node.name == "point_right") {
                        sprite.node.active = isNext;
                    } else if (sprite.node.name == "point_dui") {
                        sprite.node.active = isDui;
                    }
                    if (side == "up") {
                        sprite.node.y -= 100;
                    } else if (side == "right") {
                        sprite.node.x -= 40;
                    }
                    continue;
                }
                if (sprite.node.name == "gang") {
                    sprite.node.active = false;
                } else {
                    sprite.node.active = true;
                    sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, info.mjid);
                }
            }
        } else if (flag == "chi") {
            var isUp = false;
            var isNext = false;
            var isDui = false;
            if (this.getUpSeatIndex(seatIndex) == info.idx) {
                isUp = true;
                isNext = false;
                isDui = false;
            } else if (this.getNextSeatIndex(seatIndex) == info.idx) {
                isUp = false;
                isNext = true;
                isDui = false;
            } else {
                isUp = false;
                isNext = false;
                isDui = true;
            }

            var idx = 0;
            for (var i = 0; i < sprites.length; i++) {
                var sprite = sprites[i];
                if (sprite.node.name == "point_left" || sprite.node.name == "point_right" || sprite.node.name == "point_dui") {
                    if (sprite.node.name == "point_left") {
                        sprite.node.active = isUp;
                    } else if (sprite.node.name == "point_right") {
                        sprite.node.active = isNext;
                    } else if (sprite.node.name == "point_dui") {
                        sprite.node.active = isDui;
                    }
                    if (side == "up") {
                        sprite.node.y -= 100;
                    } else if (side == "right") {
                        sprite.node.x -= 40;
                    }
                    continue;
                }
                if (sprite.node.name == "gang") {
                    sprite.node.active = false;
                } else {
                    sprite.node.active = true;
                    sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, info.mjids[idx]);
                    idx += 1;
                }
            }
        }
    },

    getUpSeatIndex: function getUpSeatIndex(seatIndex) {
        var total = th.socketIOManager.seats.length;
        var ret = (seatIndex - 1 + total) % total;
        return ret;
    },
    getNextSeatIndex: function getNextSeatIndex(seatIndex) {
        var total = th.socketIOManager.seats.length;
        var ret = (seatIndex + 1 + total) % total;
        return ret;
    },
    getDuiSeatIndex: function getDuiSeatIndex(seatIndex) {
        var total = th.socketIOManager.seats.length;
        var ret = (seatIndex + 2 + total) % total;
        return ret;
    }
    // update: function (dt) {

    // },

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
        //# sourceMappingURL=MJChiPengGangs.js.map
        