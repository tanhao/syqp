"use strict";
cc._RF.push(module, '2378fc6BVJK4Z7bouhpSItH', 'MJGameResult');
// scripts/components/MJGameResult.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        _nodeGameResult: null,
        _seats: []
    },

    onLoad: function onLoad() {
        if (th == null) {
            return;
        }
        this._nodeGameResult = this.node.getChildByName("game_result");
        var seats = this._nodeGameResult.getChildByName("result_list");
        this._seats.push(seats.getChildByName("seat1"));
        this._seats.push(seats.getChildByName("seat2"));
        this._seats.push(seats.getChildByName("seat3"));
        this._seats.push(seats.getChildByName("seat4"));

        var btnBackHall = cc.find("Canvas/game_result/btn_back_hall");
        if (btnBackHall) {
            th.utils.addClickEvent(btnBackHall, this.node, "MJGameResult", "onBtnBackHallClicked");
        }

        var btnShareResult = cc.find("Canvas/game_result/btn_share_result");
        if (btnShareResult) {
            th.utils.addClickEvent(btnShareResult, this.node, "MJGameResult", "onBtnShareClicked");
        }

        var self = this;
        this.node.on('game_end', function (data) {
            cc.log("==>MJGameResult game_end", data.detail);
            self.onGameEnd(data.detail);
        });
    },

    showResult: function showResult(seat, id, name, headUrl, isFangZhu, isDaYinJia, info, score) {
        seat.getChildByName("id").getComponent(cc.Label).string = id;
        seat.getChildByName("name").getComponent(cc.Label).string = name;
        seat.getChildByName("fangzhu").getComponent(cc.Sprite).node.active = isFangZhu;
        seat.getChildByName("dayinjia").getComponent(cc.Sprite).node.active = isDaYinJia;
        seat.getChildByName("zimocishu").getComponent(cc.Label).string = info.numZiMo;
        seat.getChildByName("jiepaocishu").getComponent(cc.Label).string = info.numJiePao;
        seat.getChildByName("dianpaocishu").getComponent(cc.Label).string = info.numDianPao;
        seat.getChildByName("angangcishu").getComponent(cc.Label).string = info.numAnGang;
        seat.getChildByName("minggangcishu").getComponent(cc.Label).string = info.numMingGang;

        var winscore = seat.getChildByName("winscore").getComponent(cc.Label);
        var losescore = seat.getChildByName("losescore").getComponent(cc.Label);
        if (score >= 0) {
            winscore.node.active = true;
            losescore.node.active = false;
            winscore.string = "+" + score;
        } else {
            winscore.node.active = false;
            losescore.node.active = true;
            losescore.string = "" + score;
        }

        var headSprite = seat.getChildByName("head_clip").getChildByName('head_img').getComponent(cc.Sprite);
        (function (headSprite, headUrl) {
            cc.loader.load({ url: headUrl, type: 'jpg' }, function (err, texture) {
                if (!err) {
                    var headSpriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                    headSprite.spriteFrame = headSpriteFrame;
                    headSprite.node.setScale(2 - texture.width / 94);
                }
            });
        })(headSprite, headUrl);
    },
    onGameEnd: function onGameEnd(endInfo) {
        var seats = th.socketIOManager.seats;
        var maxScore = -1;
        for (var i = 0; i < seats.length; i++) {
            if (seats[i].score > maxScore) {
                maxScore = seats[i].score;
            }
        }
        for (var i = 0; i < 4; i++) {
            this._seats[i].active = false;
        }
        for (var i = 0; i < seats.length; i++) {
            this._seats[i].active = true;
            var seat = seats[i];
            var isDaYinJia = false;
            if (seat.score > 0) {
                isDaYinJia = seat.score == maxScore;
            }
            var isFangZhu = seat.userId == th.socketIOManager.creator;
            this.showResult(this._seats[i], seat.userId, seat.name, seat.headImgUrl, isFangZhu, isDaYinJia, endInfo[i], seat.score);
        }
    },
    onBtnBackHallClicked: function onBtnBackHallClicked() {
        cc.log("onBtnBackHallClicked");
        th.wc.show('正在返回游戏大厅');
        cc.director.loadScene("hall");
    },
    onBtnShareClicked: function onBtnShareClicked() {
        cc.log("onBtnShareClicked");
    },
    update: function update(dt) {}
});

cc._RF.pop();