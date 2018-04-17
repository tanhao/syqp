(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/AudioManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'd859bTzzhZK5rmyriLb24GW', 'AudioManager', __filename);
// scripts/AudioManager.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        bgmVolume: 0.5,
        sfxVolume: 0.5,
        bgmAudioID: -1,
        _pauseBgm: true
    },

    onLoad: function onLoad() {},

    // update: function (dt) {

    // },


    init: function init() {
        var bgm = cc.sys.localStorage.getItem("bgmVolume");
        if (bgm) {
            this.bgmVolume = parseFloat(bgm);
        } else {
            cc.sys.localStorage.setItem("bgmVolume", this.bgmVolume);
        }

        var sfx = cc.sys.localStorage.getItem("sfxVolume");
        if (sfx) {
            this.sfxVolume = parseFloat(sfx);
        } else {
            cc.sys.localStorage.setItem("sfxVolume", this.sfxVolume);
        }

        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();
        });
    },

    getUrl: function getUrl(url) {
        return cc.url.raw("resources/sounds/" + url);
    },

    playBGM: function playBGM(url) {
        var audioUrl = this.getUrl(url);
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
        }
        this._pauseBgm = true;
        this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
    },
    playSFX: function playSFX(url) {
        var audioUrl = this.getUrl(url);
        if (this.sfxVolume > 0) {
            var audioId = cc.audioEngine.play(audioUrl, false, this.sfxVolume);
        }
    },


    setSFXVolume: function setSFXVolume(v) {
        if (this.sfxVolume != v) {
            cc.sys.localStorage.setItem("sfxVolume", v);
            this.sfxVolume = v;
        }
    },

    setBGMVolume: function setBGMVolume(v) {

        if (this.bgmAudioID >= 0) {
            if (this._pauseBgm && v > 0) {
                this._pauseBgm = false;
                cc.audioEngine.resume(this.bgmAudioID);
            } else if (!this._pauseBgm && v == 0) {
                this._pauseBgm = true;
                cc.audioEngine.pause(this.bgmAudioID);
            }
        }
        if (this.bgmVolume != v) {
            cc.sys.localStorage.setItem("bgmVolume", v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        }
    },

    pauseAll: function pauseAll() {
        cc.audioEngine.pauseAll();
    },

    resumeAll: function resumeAll() {
        cc.audioEngine.resumeAll();
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
        //# sourceMappingURL=AudioManager.js.map
        