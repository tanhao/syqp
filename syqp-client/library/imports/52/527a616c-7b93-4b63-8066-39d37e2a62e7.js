"use strict";
cc._RF.push(module, '527a6Fse5NLY4BmOdN+KmLn', 'Seat');
// scripts/components/Seat.js

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
        countdown: cc.Sprite,
        ready: cc.Sprite,
        buchu: cc.Sprite,
        chat: cc.Label,
        restCard: cc.Node,

        _userId: null,
        _userName: '--',
        _headImgUrl: null,
        _countdown: null,
        _countdownEndTime: null,
        _sex: 0,
        _score: 0,
        _restCard: 0,
        _isOffline: false,
        _isReady: false,
        _isBuchu: false,
        _isFangzhu: false,
        _lastChatTime: -1
    },

    onLoad: function onLoad() {
        if (this.chat) {
            this.chat.node.active = false;
        }
        if (this.emoji) {
            this.emoji.node.active = false;
        }
        if (this.countdown) {
            this.countdown.node.active = false;
        }
        if (this.restCard) {
            this.restCard.active = false;
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
            this.ready.node.active = this._isReady;
        }
        if (this.buchu) {
            this.buchu.node.active = this._isBuchu;
        }

        if (this.fangzhu) {
            this.fangzhu.node.active = this._isFangzhu;
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

    setBuchu: function setBuchu(isBuchu) {
        this._isBuchu = isBuchu;
        if (this.buchu) {
            this.buchu.node.active = this._isBuchu;
        }
    },

    setOffline: function setOffline(isOffline) {
        this._isOffline = isOffline;
        if (this.offline) {
            this.offline.node.active = this._isOffline && this._userId != null;
        }
    },

    setRestCard: function setRestCard(rest) {
        this._restCard = rest;
        if (this.restCard) {
            this.restCard.active = rest > 0;
            this.restCard.getChildByName("poker_count").getComponent(cc.Label).string = rest + "";
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

    setCountdown: function setCountdown(time) {
        this._countdown = time;
        this._countdownEndTime = Date.now() + time * 1000;
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

        if (this._countdownEndTime > Date.now()) {
            if (this.countdown.node.active == false) {
                this.countdown.node.active = true;
            } else {
                this.countdown.getComponent(cc.Sprite).fillRange = (this._countdownEndTime - Date.now()) / 1000 / this._countdown;
            }
        } else if (this._countdownEndTime <= Date.now() && this.countdown.node.active == true) {
            this.countdown.node.active = false;
        }
    }

    /*
    update (dt) {
    },
    */

});

cc._RF.pop();