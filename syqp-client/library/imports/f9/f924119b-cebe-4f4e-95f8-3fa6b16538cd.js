"use strict";
cc._RF.push(module, 'f9241Gbzr5PTpX4P6axZTjN', 'MJSeat');
// scripts/components/MJSeat.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        headImg: cc.Sprite,
        headwho: cc.Sprite,
        lblName: cc.Label,
        lblScore: cc.Label,
        offline: cc.Sprite,
        fangzhu: cc.Sprite,
        emoji: cc.Sprite,
        ready: cc.Sprite,
        banker: cc.Sprite,
        chat: cc.Label,

        _userId: null,
        _userName: '--',
        _headImgUrl: null,
        _sex: 0,
        _score: 0,
        _isOffline: false,
        _isReady: false,
        _isFangzhu: false,
        _isbanker: false,
        _lastChatTime: -1
    },

    onLoad: function onLoad() {
        if (this.chat) {
            this.chat.node.active = false;
        }
        if (this.emoji) {
            this.emoji.node.active = false;
        }
        this.refresh();
    },


    refresh: function refresh() {
        if (this._userName) {
            this.lblName.string = this._userName;
        }
        if (this._score) {
            this.lblScore.string = this._score;
        }
        if (this.offline) {
            this.offline.node.active = this._isOffline && this._userId != null;
        }

        if (this.ready) {
            this.ready.node.active = this._isReady && th.socketIOManager.status == "idle";
        }
        if (this.fangzhu) {
            this.fangzhu.node.active = this._isFangzhu;
        }
        if (this.banker) {
            this.banker.node.active = this._isbanker;
        }
        //this.node.active = this._userId!=null;
    },

    setUserID: function setUserID(id) {
        this._userId = id;
    },

    setUserName: function setUserName(name) {
        this._userName = name;
        if (this.lblName) {
            this.lblName.string = this._userName;
        }
    },

    setSex: function setSex(sex) {
        this._sex = sex;
    },

    setHeadImgUrl: function setHeadImgUrl(headImgUrl) {
        var self = this;
        this._headImgUrl = headImgUrl;
        if (this._headImgUrl && this.headImg) {
            this.headwho.node.active = false;
            this.headImg.node.active = true;
            cc.loader.load({ url: this._headImgUrl, type: 'jpg' }, function (err, texture) {
                if (!err) {
                    var headSpriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                    self.headImg.spriteFrame = headSpriteFrame;
                    self.headImg.node.setScale(2 - texture.width / 94);
                }
            });
        } else if (!this._headImgUrl && self.headImg) {
            this.headwho.node.active = true;
            this.headImg.node.active = false;
        }
    },

    setScore: function setScore(score) {
        this._score = score;
        if (this.lblScore) {
            this.lblScore.string = this._score;
        }
    },

    setFangzhu: function setFangzhu(isFangzhu) {
        this._isFangzhu = isFangzhu;
        if (this.fangzhu) {
            this.fangzhu.node.active = this._isFangzhu;
        }
    },

    setReady: function setReady(isReady) {
        this._isReady = isReady;
        if (this.ready) {
            this.ready.node.active = this._isReady;
        }
    },

    setBanker: function setBanker(isbanker) {
        this._isbanker = isbanker;
        if (this.banker) {
            this.banker.node.active = this._isbanker;
        }
    },

    setOffline: function setOffline(isOffline) {
        this._isOffline = isOffline;
        if (this.offline) {
            this.offline.node.active = this._isOffline && this._userId != null;
        }
    },

    setChat: function setChat(content) {
        if (this.chat) {
            this.emoji.node.active = false;
            this.chat.node.active = true;
            this.chat.getComponent(cc.Label).string = content;
            this.chat.getChildByName("chat_msg").getComponent(cc.Label).string = content;
            this._lastChatTime = 3;
        }
    },

    setEmoji: function setEmoji(emoji) {
        if (this.emoji) {
            this.chat.node.active = false;
            this.emoji.node.active = true;
            this._lastChatTime = 3;
        }
    },

    setInfo: function setInfo(id, name, score, headImgUrl) {
        this.setUserID(id);
        if (id) {
            this.setUserName(name);
            this.setScore(score);
            this.setHeadImgUrl(headImgUrl);
        } else {
            this.setUserName('--');
            this.setScore('--');
            this.setHeadImgUrl(null);
        }
    },

    update: function update(dt) {
        if (this._lastChatTime > 0) {
            this._lastChatTime -= dt;
            if (this._lastChatTime < 0) {
                this.chat.node.active = false;
                this.emoji.node.active = false;
            }
        }
    }
});

cc._RF.pop();