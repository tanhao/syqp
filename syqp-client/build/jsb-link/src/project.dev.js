require = function() {
  function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = "function" == typeof require && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f;
        }
        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n || e);
        }, l, l.exports, e, t, n, r);
      }
      return n[o].exports;
    }
    var i = "function" == typeof require && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
  }
  return e;
}()({
  Alert: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "01a0eYD3wVLrLra9sMACvXk", "Alert");
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
        if (null == th) return null;
        th.alert = this;
        this.node.active = false;
        this._fnConfirm = null;
      },
      show: function show(title, content, fnConfirm, showBtnCancel) {
        cc.log("showBtnCancel:" + showBtnCancel);
        this.node && (this.node.active = true);
        this.title && (this.title.string = title || "");
        this.content && (this.content.string = content || "");
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
        this._fnConfirm && this._fnConfirm();
      },
      hide: function hide() {
        this.node && (this.node.active = false);
      },
      onDestory: function onDestory() {
        th && (th.alert = null);
      }
    });
    cc._RF.pop();
  }, {} ],
  AnysdkManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "38eefl+wMxId5kHf1PxI2t5", "AnysdkManager");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {},
      init: function init() {
        this.ANDROID_API = "com/th/tcqp/Wechat";
        this.IOS_API = "AppController";
      },
      getBatteryPercent: function getBatteryPercent() {
        return .9;
      },
      login: function login() {
        cc.log("Login==>>");
        if (cc.sys.os == cc.sys.OS_ANDROID) {
          cc.log("Login Start ANDROID==>>" + this.ANDROID_API);
          jsb.reflection.callStaticMethod(this.ANDROID_API, "login", "()V");
          cc.log("Login End ANDROID==>>" + this.ANDROID_API);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
          cc.log("Login IOS==>>" + this.IOS_API);
          jsb.reflection.callStaticMethod(this.IOS_API, "login");
        } else cc.log("platform:" + cc.sys.os + " dosn't implement share.");
      },
      shareWebpage: function shareWebpage(url, title, desc, isTimelineCb) {
        cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod(this.ANDROID_API, "shareWebpage", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V", url, title, desc, isTimelineCb) : cc.sys.os == cc.sys.OS_IOS ? jsb.reflection.callStaticMethod(this.IOS_API, "shareWebpage:shareTitle:shareDesc:isTimelineCb:", url, title, desc, isTimelineCb) : cc.log("platform:" + cc.sys.os + " dosn't implement share.");
      },
      shareCaptureScreen: function shareCaptureScreen(isTimelineCb) {
        if (this._isCapturing) return;
        this._isCapturing = true;
        var size = cc.director.getWinSize();
        var currentDate = new Date();
        var fileName = "result_share.jpg";
        var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        jsb.fileUtils.isFileExist(fullPath) && jsb.fileUtils.removeFile(fullPath);
        var texture = new cc.RenderTexture(Math.floor(size.width), Math.floor(size.height));
        texture.setPosition(cc.p(size.width / 2, size.height / 2));
        texture.begin();
        cc.director.getRunningScene().visit();
        texture.end();
        texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);
        var self = this;
        var tryTimes = 0;
        var fn = function fn() {
          if (jsb.fileUtils.isFileExist(fullPath)) {
            var height = 100;
            var scale = height / size.height;
            var width = Math.floor(size.width * scale);
            cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod(self.ANDROID_API, "shareImage", "(Ljava/lang/String;Z)V", fullPath, isTimelineCb) : cc.sys.os == cc.sys.OS_IOS ? jsb.reflection.callStaticMethod(self.IOS_API, "shareImage:isTimelineCb:", fullPath, isTimelineCb) : cc.log("platform:" + cc.sys.os + " dosn't implement share.");
            self._isCapturing = false;
          } else {
            tryTimes++;
            if (tryTimes > 10) {
              cc.log("time out...");
              return;
            }
            setTimeout(fn, 50);
          }
        };
        setTimeout(fn, 50);
      },
      onLoginResp: function onLoginResp(code) {
        cc.log("AnysdkManager onLoginResp code===>>:" + code);
        var fn = function fn(err, ret) {
          th.wc.show("正在登录游戏");
          if (0 == ret.errcode) {
            cc.sys.localStorage.setItem("wx_account", ret.account);
            cc.sys.localStorage.setItem("wx_sign", ret.sign);
          }
          th.userManager.onAuth(err, ret);
        };
        th.http.get("/wechat_auth", {
          code: code,
          os: cc.sys.os
        }, fn);
      }
    });
    cc._RF.pop();
  }, {} ],
  AppStart: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5414cTJwbRHg5YZplKYF1DZ", "AppStart");
    "use strict";
    function initManager(I) {
      var defaultBaseUrl = "http://192.168.88.60:9001";
      window.th = window.th;
      if (window.th) {
        th.http.baseURL = defaultBaseUrl;
        return;
      }
      window.th = {};
      th.appInfo = {
        appName: "同城棋牌",
        appWeb: "http://fir.im/9r48",
        shareTitle: "同城棋牌--掌上棋牌室",
        shareDesc: "【同城棋牌】最地道的松阳麻将,爱麻将的人都在玩。"
      };
      th.http = require("Http");
      th.http.baseURL = defaultBaseUrl;
      th.sio = require("SocketIO");
      th.sio.h;
      var UserManager = require("UserManager");
      th.userManager = new UserManager();
      var AnysdkManager = require("AnysdkManager");
      th.anysdkManager = new AnysdkManager();
      th.anysdkManager.init();
      var AudioManager = require("AudioManager");
      th.audioManager = new AudioManager();
      th.audioManager.init();
      var SocketIOManager = require("SocketIOManager");
      th.socketIOManager = new SocketIOManager();
      th.socketIOManager.initHandlers();
      var Utils = require("Utils");
      th.utils = new Utils();
    }
    cc.Class({
      extends: cc.Component,
      properties: {
        _isAgree: false
      },
      onLoad: function onLoad() {
        cc.log("================>>initManager<<=====================");
        initManager();
        if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
          console.log(this.node.getChildByName("web_btns"));
          this.node.getChildByName("web_btns").active = false;
          this.node.getChildByName("btn_weixin").getComponent(cc.Button).node.active = true;
        } else {
          console.log(this.node.getChildByName("web_btns"));
          this.node.getChildByName("web_btns").active = true;
          this.node.getChildByName("btn_weixin").getComponent(cc.Button).node.active = false;
        }
      },
      start: function start() {},
      onBtnWeichatClicked: function onBtnWeichatClicked(target, account) {
        if (this._isAgree) {
          cc.log("onBtnWeichatClicked");
          cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS ? th.anysdkManager.login() : th.userManager.lingshiAuth(account);
        }
      },
      onBtnAgreeClicked: function onBtnAgreeClicked(target) {
        this._isAgree = target.isChecked;
      },
      onBtnShareFirendClicked: function onBtnShareFirendClicked(target) {
        th.anysdkManager.shareWebpage("http://fir.im/9r48", "同城棋牌--掌上棋牌室", "【同城棋牌】最地道的松阳麻将,爱麻将的人都在玩。", false);
      },
      onBtnShareWechatClicked: function onBtnShareWechatClicked(target) {
        th.anysdkManager.shareWebpage("http://fir.im/9r48", "同城棋牌--掌上棋牌室", "【同城棋牌】最地道的松阳麻将,爱麻将的人都在玩。", true);
      },
      onBtnShareImgFirendClicked: function onBtnShareImgFirendClicked(target) {
        th.anysdkManager.shareCaptureScreen(false);
      },
      onBtnShareImgWechatClicked: function onBtnShareImgWechatClicked(target) {
        th.anysdkManager.shareCaptureScreen(true);
      }
    });
    cc._RF.pop();
  }, {
    AnysdkManager: "AnysdkManager",
    AudioManager: "AudioManager",
    Http: "Http",
    SocketIO: "SocketIO",
    SocketIOManager: "SocketIOManager",
    UserManager: "UserManager",
    Utils: "Utils"
  } ],
  AudioManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d859bTzzhZK5rmyriLb24GW", "AudioManager");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        bgmVolume: .5,
        sfxVolume: .5,
        bgmAudioID: -1,
        sfxAudioID: -1,
        _pauseBgm: true
      },
      onLoad: function onLoad() {},
      init: function init() {
        var bgm = cc.sys.localStorage.getItem("bgmVolume");
        bgm ? this.bgmVolume = parseFloat(bgm) : cc.sys.localStorage.setItem("bgmVolume", this.bgmVolume);
        var sfx = cc.sys.localStorage.getItem("sfxVolume");
        sfx ? this.sfxVolume = parseFloat(sfx) : cc.sys.localStorage.setItem("sfxVolume", this.sfxVolume);
        cc.game.on(cc.game.EVENT_HIDE, function() {
          cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function() {
          cc.audioEngine.resumeAll();
        });
      },
      getUrl: function getUrl(url) {
        return cc.url.raw("resources/sounds/" + url);
      },
      playBGM: function playBGM(url) {
        var audioUrl = this.getUrl(url);
        this.bgmAudioID >= 0 && cc.audioEngine.stop(this.bgmAudioID);
        this._pauseBgm = true;
        this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
      },
      playSFX: function playSFX(url) {
        var audioUrl = this.getUrl(url);
        this.sfxVolume > 0 && (this.sfxAudioID = cc.audioEngine.play(audioUrl, false, this.sfxVolume));
      },
      setSFXVolume: function setSFXVolume(v) {
        if (this.sfxVolume != v) {
          cc.sys.localStorage.setItem("sfxVolume", v);
          this.sfxVolume = v;
        }
      },
      setBGMVolume: function setBGMVolume(v) {
        if (this.bgmAudioID >= 0) if (this._pauseBgm && v > 0) {
          this._pauseBgm = false;
          cc.audioEngine.resume(this.bgmAudioID);
        } else if (!this._pauseBgm && 0 == v) {
          this._pauseBgm = true;
          cc.audioEngine.pause(this.bgmAudioID);
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
  }, {} ],
  GameScrollBar: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a2747akXS9P6L0ATNR/aQ3U", "GameScrollBar");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        _lastPosY: 0,
        _isScrollBegan: false
      },
      onLoad: function onLoad() {},
      start: function start() {
        var btnHeight = 174;
        var currentIndex = 3;
        var posY = 0;
        var scrollView = this.node.getComponent(cc.ScrollView);
        var buttons = scrollView.getComponentsInChildren(cc.Button);
        for (var i = 0; i < buttons.length; i++) {
          var scale = Math.abs(posY + (3 - i) * btnHeight) / 800;
          buttons[i].node.setScale(1 - scale);
          buttons[i].node.setColor(i == currentIndex ? cc.color(255, 255, 255) : cc.color(120, 120, 120));
        }
      },
      update: function update(dt) {},
      onGameBarScroll: function onGameBarScroll(scrollView, eventType, customEventData) {
        var posY = parseInt(scrollView.getContentPosition().y);
        if (eventType === cc.ScrollView.EventType.SCROLLING && Math.abs(posY - this._lastPosY) > 1) {
          this._lastPosY = posY;
          var buttons = scrollView.getComponentsInChildren(cc.Button);
          var btnHeight = 174;
          var currentIndex = parseInt((posY + btnHeight / 2 * (posY > 0 ? 1 : -1)) / btnHeight) + 3;
          currentIndex = currentIndex < 0 ? 0 : currentIndex > buttons.length - 1 ? buttons.length - 1 : currentIndex;
          for (var i = 0; i < buttons.length; i++) {
            var scale = Math.abs(posY + (3 - i) * btnHeight) / 800;
            buttons[i].node.setScale(1 - scale);
            buttons[i].node.setColor(i == currentIndex ? cc.color(255, 255, 255) : cc.color(120, 120, 120));
          }
        } else if (eventType === cc.ScrollView.EventType.SCROLL_ENDED) {
          if (this._isScrollBegan) {
            var buttons = scrollView.getComponentsInChildren(cc.Button);
            var btnHeight = 174;
            var currentIndex = parseInt((posY + btnHeight / 2 * (posY > 0 ? 1 : -1)) / btnHeight) + 3;
            currentIndex = currentIndex < 0 ? 0 : currentIndex > buttons.length - 1 ? buttons.length - 1 : currentIndex;
            var max = scrollView.getMaxScrollOffset().y;
            scrollView.scrollToOffset(cc.p(0, max / 2 + (currentIndex - 3) * btnHeight), 1);
            this._isScrollBegan = false;
          }
        } else eventType === cc.ScrollView.EventType.SCROLL_BEGAN && (this._isScrollBegan = true);
      }
    });
    cc._RF.pop();
  }, {} ],
  Hall: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1b1f4flWSJNdq/hUigajnOJ", "Hall");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        lblId: cc.Label,
        lblName: cc.Label,
        lblBalance: cc.Label,
        lblMarquee: cc.Label,
        joinRoomWin: cc.Node,
        createRoomWin: cc.Node,
        settingWin: cc.Node,
        shareWin: cc.Node,
        spriteHead: cc.Sprite,
        btnCreateRoom: cc.Button,
        btnReturnRoom: cc.Button,
        btnJoinRoom: cc.Button
      },
      onLoad: function onLoad() {
        this.initUserInfo();
        th.audioManager.playBGM("bg_hall.mp3");
      },
      start: function start() {
        th.userManager.roomId && th.alert.show("提示", "你已在房间中，是否返回游戏房间？", this.onReturnRoomClicked, true);
      },
      initUserInfo: function initUserInfo() {
        var self = this;
        this.lblId.string = "ID:" + th.userManager.userId;
        this.lblName.string = th.userManager.userName;
        this.lblBalance.string = th.userManager.balance;
        cc.log("Hall th.userManager.roomId:", th.userManager.roomId);
        if (th.userManager.roomId) {
          this.btnJoinRoom.node.active = false;
          this.btnReturnRoom.node.active = true;
        } else {
          this.btnJoinRoom.node.active = true;
          this.btnReturnRoom.node.active = false;
        }
        cc.log(th.userManager.headImgUrl);
        cc.loader.load({
          url: th.userManager.headImgUrl,
          type: "jpg"
        }, function(err, texture) {
          if (!err) {
            var headSpriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
            self.spriteHead.spriteFrame = headSpriteFrame;
            self.spriteHead.node.setScale(2 - texture.width / 106);
          }
        });
      },
      update: function update(dt) {
        var x = this.lblMarquee.node.x;
        x -= 100 * dt;
        x + this.lblMarquee.node.width < -250 && (x = 260);
        this.lblMarquee.node.x = x;
      },
      onCreateRoomClicked: function onCreateRoomClicked() {
        if (th.userManager.roomId) {
          th.alert.show("提示", "你已在房间中，是否返回游戏房间？", this.onReturnRoomClicked, true);
          return;
        }
        this.createRoomWin.active = true;
      },
      onJoinRoomClicked: function onJoinRoomClicked() {
        this.joinRoomWin.active = true;
      },
      onReturnRoomClicked: function onReturnRoomClicked() {
        th.wc.show("正在返回游戏房间");
        th.userManager.joinRoom(th.userManager.roomId, function(data) {
          0 != data.errcode && th.alert.show("提示", data.errmsg, null, false);
        }.bind(this));
      },
      onLogoutClicked: function onLogoutClicked() {
        th.wc.show("正在退出游戏房间");
        th.userManager.logout();
      },
      onSettingClicked: function onSettingClicked() {
        this.settingWin.active = true;
      },
      onShareClicked: function onShareClicked() {
        cc.sys.os != cc.sys.OS_ANDROID && cc.sys.os != cc.sys.OS_IOS || (this.shareWin.active = true);
      }
    });
    cc._RF.pop();
  }, {} ],
  Http: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "904ffIoZYNMnaB5ix5gAedT", "Http");
    "use strict";
    var Http = cc.Class({
      extends: cc.Component,
      statics: {
        baseURL: null,
        get: function get(path, params, callback) {
          var xhr = cc.loader.getXMLHttpRequest();
          var paramsStr = "?";
          for (var k in params) {
            "?" != paramsStr && (paramsStr += "&");
            paramsStr += k + "=" + params[k];
          }
          var requestUrl = Http.baseURL + path + encodeURI(paramsStr);
          xhr.open("GET", requestUrl, true);
          xhr.onreadystatechange = function() {
            if (4 == xhr.readyState && xhr.status >= 200 && xhr.status < 400) try {
              cc.log("try => http response:" + xhr.responseText);
              var json = JSON.parse(xhr.responseText);
              callback(null, json);
            } catch (e) {
              callback(e, null);
            }
          };
          xhr.send();
        },
        post: function post(path, params, callback) {
          var xhr = cc.loader.getXMLHttpRequest();
          xhr.open("POST", Http.baseURL + path);
          xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
          xhr.onreadystatechange = function() {
            if (4 == xhr.readyState && xhr.status >= 200 && xhr.status <= 207) try {
              var json = JSON.parse(xhr.responseText);
              callback(null, json);
            } catch (e) {
              callback(e, null);
            }
          };
          xhr.send(params);
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  JoinRoom: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "89ec8TY4OVDEL5X/J8nkwft", "JoinRoom");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        nums: {
          default: [],
          type: [ cc.Label ]
        },
        _inputIndex: 0
      },
      onLoad: function onLoad() {},
      onEnable: function onEnable() {
        this.onResetClicked();
      },
      onResetClicked: function onResetClicked() {
        for (var i = 0; i < this.nums.length; ++i) this.nums[i].string = "";
        this._inputIndex = 0;
      },
      onDelClicked: function onDelClicked() {
        if (this._inputIndex > 0) {
          this._inputIndex -= 1;
          this.nums[this._inputIndex].string = "";
        }
      },
      onCloseClicked: function onCloseClicked() {
        this.node.active = false;
      },
      parseRoomID: function parseRoomID() {
        var str = "";
        for (var i = 0; i < this.nums.length; ++i) str += this.nums[i].string;
        return parseInt(str);
      },
      onInput: function onInput(target, num) {
        if (this._inputIndex >= this.nums.length) return;
        this.nums[this._inputIndex].string = num;
        this._inputIndex += 1;
        if (this._inputIndex == this.nums.length) {
          var roomId = this.parseRoomID();
          cc.log("ok:" + roomId);
          this.onInputFinished(roomId);
        }
      },
      onInputFinished: function onInputFinished(roomId) {
        th.userManager.joinRoom(roomId, function(data) {
          if (0 == data.errcode) this.node.active = false; else {
            th.alert.show("提示", data.errmsg, null, false);
            this.onResetClicked();
          }
        }.bind(this));
      }
    });
    cc._RF.pop();
  }, {} ],
  MJChiPengGangs: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0b065EljOlPxbmdDzwTjWvK", "MJChiPengGangs");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {
        if (null == th) return;
        var self = this;
        var myself = this.node.getChildByName("myself");
        var nodeChiPengGang = myself.getChildByName("ChiPengGang");
        var realwidth = cc.director.getVisibleSize().width;
        var scale = realwidth / 1280;
        nodeChiPengGang.scaleX *= scale;
        nodeChiPengGang.scaleY *= scale;
        this.node.on("chi_notify_push", function(data) {
          cc.log("==>ChiPengGang chi_notify_push", data.detail);
          var data = data.detail;
          self.onChiPengGangChanged(data);
        });
        this.node.on("peng_notify_push", function(data) {
          cc.log("==>ChiPengGang peng_notify_push", data.detail);
          var data = data.detail;
          self.onChiPengGangChanged(data);
        });
        this.node.on("gang_notify_push", function(data) {
          cc.log("==>ChiPengGang gang_notify_push", data.detail);
          self.onChiPengGangChanged(data.detail);
        });
        this.node.on("begin_push", function(data) {
          self.onGameBegin();
        });
        this.node.on("clean_push", function() {
          self.onGameBegin();
        });
        var seats = th.socketIOManager.seats;
        for (var i in seats) this.onChiPengGangChanged(seats[i]);
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
        if (nodeChiPengGang) for (var i = 0; i < nodeChiPengGang.childrenCount; ++i) nodeChiPengGang.children[i].active = false;
      },
      onChiPengGangChanged: function onChiPengGangChanged(seatData) {
        if (null == seatData.pengs && null == seatData.angangs && null == seatData.diangangs && null == seatData.bugangs && null == seatData.chis) return;
        var localIndex = th.socketIOManager.getLocalIndex(seatData.index);
        var side = th.mahjongManager.getSide(localIndex);
        var pre = th.mahjongManager.getFoldPre(localIndex);
        var nodeSide = this.node.getChildByName(side);
        var nodeChiPengGang = nodeSide.getChildByName("ChiPengGang");
        for (var i = 0; i < nodeChiPengGang.childrenCount; ++i) nodeChiPengGang.children[i].active = false;
        var index = 0;
        var gangs = seatData.angangs;
        for (var i = 0; i < gangs.length; ++i) {
          var info = gangs[i];
          this.initChiPengAndGangs(nodeChiPengGang, side, pre, index, info, "angang", seatData.index);
          index++;
        }
        gangs = seatData.diangangs;
        for (var i = 0; i < gangs.length; ++i) {
          var info = gangs[i];
          this.initChiPengAndGangs(nodeChiPengGang, side, pre, index, info, "diangang", seatData.index);
          index++;
        }
        gangs = seatData.bugangs;
        for (var i = 0; i < gangs.length; ++i) {
          var info = gangs[i];
          this.initChiPengAndGangs(nodeChiPengGang, side, pre, index, info, "bugang", seatData.index);
          index++;
        }
        var pengs = seatData.pengs;
        if (pengs) for (var i = 0; i < pengs.length; ++i) {
          var info = pengs[i];
          this.initChiPengAndGangs(nodeChiPengGang, side, pre, index, info, "peng", seatData.index);
          index++;
        }
        var chis = seatData.chis;
        if (chis) for (var i = 0; i < chis.length; ++i) {
          var info = chis[i];
          this.initChiPengAndGangs(nodeChiPengGang, side, pre, index, info, "chi", seatData.index);
          index++;
        }
      },
      initChiPengAndGangs: function initChiPengAndGangs(nodeChiPengGang, side, pre, index, info, flag, seatIndex) {
        cc.log("initChiPengAndGangs", side, pre, index, info, flag);
        var nodeCPG = null;
        if (nodeChiPengGang.childrenCount <= index) {
          nodeCPG = "left" == side || "right" == side ? cc.instantiate(th.mahjongManager.pengPrefabLeft) : cc.instantiate(th.mahjongManager.pengPrefabSelf);
          nodeChiPengGang.addChild(nodeCPG);
        } else {
          nodeCPG = nodeChiPengGang.children[index];
          nodeCPG.active = true;
        }
        if ("left" == side) nodeCPG.y = -25 * index * 3; else if ("right" == side) {
          nodeCPG.y = 25 * index * 3;
          nodeCPG.setLocalZOrder(-index);
        } else nodeCPG.x = "myself" == side ? 55 * index * 3 + 6 * index : -55 * index * 3 - 4 * index;
        var sprites = nodeCPG.getComponentsInChildren(cc.Sprite);
        if ("angang" == flag) for (var i = 0; i < sprites.length; i++) {
          var sprite = sprites[i];
          if ("point_left" == sprite.node.name || "point_dui" == sprite.node.name || "point_right" == sprite.node.name) {
            sprite.node.active = false;
            continue;
          }
          sprite.node.active = true;
          sprite.spriteFrame = th.mahjongManager.getEmptySpriteFrame(side);
        } else if ("diangang" == flag || "bugang" == flag) {
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
            if ("point_left" == sprite.node.name || "point_right" == sprite.node.name || "point_dui" == sprite.node.name) {
              "point_left" == sprite.node.name ? sprite.node.active = isUp : "point_right" == sprite.node.name ? sprite.node.active = isNext : "point_dui" == sprite.node.name && (sprite.node.active = isDui);
              "up" == side ? sprite.node.y = -53 : "right" == side && (sprite.node.x = -40);
              continue;
            }
            sprite.node.active = true;
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, info.mjid);
          }
        } else if ("peng" == flag) {
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
            if ("point_left" == sprite.node.name || "point_right" == sprite.node.name || "point_dui" == sprite.node.name) {
              "point_left" == sprite.node.name ? sprite.node.active = isUp : "point_right" == sprite.node.name ? sprite.node.active = isNext : "point_dui" == sprite.node.name && (sprite.node.active = isDui);
              "up" == side ? sprite.node.y = -53 : "right" == side && (sprite.node.x = -40);
              continue;
            }
            if ("gang" == sprite.node.name) sprite.node.active = false; else {
              sprite.node.active = true;
              sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, info.mjid);
            }
          }
        } else if ("chi" == flag) {
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
            if ("point_left" == sprite.node.name || "point_right" == sprite.node.name || "point_dui" == sprite.node.name) {
              "point_left" == sprite.node.name ? sprite.node.active = isUp : "point_right" == sprite.node.name ? sprite.node.active = isNext : "point_dui" == sprite.node.name && (sprite.node.active = isDui);
              "up" == side ? sprite.node.y = -53 : "right" == side && (sprite.node.x = -40);
              continue;
            }
            if ("gang" == sprite.node.name) sprite.node.active = false; else {
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
    });
    cc._RF.pop();
  }, {} ],
  MJCreateRoom: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cce92YsEchF14Hs7bYK6yoT", "MJCreateRoom");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        people: 4,
        round: 8,
        payment: "FZ",
        difen: 1,
        zuozhuang: "QZ",
        fengding: 32,
        ctdsq: false,
        lbl8Round: cc.Label,
        lbl16Round: cc.Label
      },
      onLoad: function onLoad() {},
      onEnable: function onEnable() {
        cc.log("create_room onEnable");
        this.onResetClicked();
      },
      onResetClicked: function onResetClicked() {
        this.people = 4;
        this.round = 8;
        this.payment = "FZ";
        this.difen = 1;
        this.zuozhuang = "QZ";
        this.fengding = 32;
        this.ctdsq = false;
        cc.find("Canvas/create_room_mj/setting_list/people/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/round/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/payment/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/difen/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/zuozhuang/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/fengding/toggleContainer/toggle1").getComponent(cc.Toggle).check();
        cc.find("Canvas/create_room_mj/setting_list/options/toggle1").getComponent(cc.Toggle).uncheck();
      },
      onCloseClicked: function onCloseClicked() {
        this.node.active = false;
      },
      onPeopleClicked: function onPeopleClicked(target, people) {
        this.people = people;
        if (4 == this.people) {
          this.lbl8Round.string = "x4";
          this.lbl16Round.string = "x8";
        } else if (3 == this.people) {
          this.lbl8Round.string = "x3";
          this.lbl16Round.string = "x6";
        } else if (2 == this.people) {
          this.lbl8Round.string = "x2";
          this.lbl16Round.string = "x4";
        }
      },
      onRoundClicked: function onRoundClicked(target, round) {
        this.round = parseInt(round);
      },
      onPaymentClicked: function onPaymentClicked(target, payment) {
        this.payment = payment;
      },
      onDifenClicked: function onDifenClicked(target, difen) {
        this.difen = difen;
      },
      onZuozhuangClicked: function onZuozhuangClicked(target, zuozhuang) {
        this.zuozhuang = zuozhuang;
      },
      onFengdingClicked: function onFengdingClicked(target, fengding) {
        this.fengding = fengding;
      },
      onCtdsqClicked: function onCtdsqClicked(target) {
        this.ctdsq = target.isChecked;
      },
      onCreateClicked: function onCreateClicked(target) {
        this.node.active = false;
        var config = {
          people: this.people,
          round: this.round,
          payment: this.payment,
          difen: this.difen,
          zuozhuang: this.zuozhuang,
          fengding: this.fengding,
          ctdsq: this.ctdsq
        };
        th.userManager.createRoom(config);
      }
    });
    cc._RF.pop();
  }, {} ],
  MJFolds: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0fb2fAdDZZMC6puF+qvTjQC", "MJFolds");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        _folds: null
      },
      onLoad: function onLoad() {
        if (null == th) return;
        this.initView();
        this.initEventHandler();
        this.initAllFolds();
      },
      update: function update(dt) {},
      initView: function initView() {
        this._folds = {};
        this._folds.left = [];
        this._folds.myself = [];
        this._folds.right = [];
        this._folds.up = [];
        var sides = [ "myself", "right", "up", "left" ];
        for (var i = 0; i < sides.length; i++) {
          var side = sides[i];
          var folds = this.node.getChildByName(side).getChildByName("Folds");
          for (var j = 1; j <= folds.children.length; j++) {
            var mj = folds.getChildByName("mj" + j);
            mj.active = false;
            var sprite = mj.getComponent(cc.Sprite);
            sprite.spriteFrame = null;
            this._folds[side].push(sprite);
          }
        }
      },
      initEventHandler: function initEventHandler() {
        var self = this;
        this.node.on("begin_push", function(data) {
          self.initAllFolds();
        });
        this.node.on("guo_notify_push", function(data) {
          self.initFolds(data.detail);
        });
        this.node.on("chupai_notify_push", function(data) {
          self.initFolds(data.detail.seatData);
        });
        this.node.on("sync_push", function(data) {
          self.initAllFolds();
        });
        this.node.on("clean_push", function() {
          self.initAllFolds();
        });
      },
      hideAllFolds: function hideAllFolds() {
        for (var key in this._folds) {
          var mjs = this._folds[key];
          for (var i = 0; i < mjs.length; i++) mjs[i].node.active = false;
        }
      },
      initAllFolds: function initAllFolds() {
        var seats = th.socketIOManager.seats;
        for (var i in seats) this.initFolds(seats[i]);
      },
      initFolds: function initFolds(seatData) {
        var folds = seatData.folds;
        if (null == folds) return;
        var localIndex = th.socketIOManager.getLocalIndex(seatData.index);
        var pre = th.mahjongManager.getFoldPre(localIndex);
        var side = th.mahjongManager.getSide(localIndex);
        var foldsSprites = this._folds[side];
        for (var i = 0; i < foldsSprites.length; ++i) {
          var index = i;
          var sprite = foldsSprites[index];
          sprite.node.active = true;
          this.setSpriteFrameByMJID(pre, sprite, folds[i]);
        }
        for (var i = folds.length; i < foldsSprites.length; ++i) {
          var index = i;
          var sprite = foldsSprites[index];
          sprite.spriteFrame = null;
          sprite.node.active = false;
        }
      },
      refreshAllSeat: function refreshAllSeat() {},
      refreshOneSeat: function refreshOneSeat() {},
      setSpriteFrameByMJID: function setSpriteFrameByMJID(pre, sprite, mjid) {
        sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, mjid);
        sprite.node.active = true;
      }
    });
    cc._RF.pop();
  }, {} ],
  MJGameOver: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "16fbctvcdpBSoaziZibs0zj", "MJGameOver");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        _isGameEnd: false,
        _nodeGameOver: null,
        _nodeGameResult: null,
        _nodeSeats: [],
        _btnReady: null,
        _btnConfirm: null,
        _lblWin: null,
        _lblLose: null,
        _lblLiuju: null,
        _seats: []
      },
      onLoad: function onLoad() {
        if (null == th) return;
        this._nodeGameOver = this.node.getChildByName("game_over");
        this._nodeGameResult = this.node.getChildByName("game_result");
        this._lblWin = this._nodeGameOver.getChildByName("win");
        this._lblLose = this._nodeGameOver.getChildByName("lose");
        this._lblLiuju = this._nodeGameOver.getChildByName("liuju");
        var wanfa = this._nodeGameOver.getChildByName("wanfa").getComponent(cc.Label);
        wanfa.string = th.socketIOManager.getWanfa();
        var resustRoot = this._nodeGameOver.getChildByName("result_list");
        for (var i = 1; i <= 4; i++) {
          var name = "seat" + i;
          var nodeSeat = resustRoot.getChildByName(name);
          this._nodeSeats.push(nodeSeat);
          var viewData = {};
          viewData.username = nodeSeat.getChildByName("username").getComponent(cc.Label);
          viewData.winscore = nodeSeat.getChildByName("winscore").getComponent(cc.Label);
          viewData.losescore = nodeSeat.getChildByName("losescore").getComponent(cc.Label);
          viewData.reason = nodeSeat.getChildByName("reason").getComponent(cc.Label);
          viewData.zhuang = nodeSeat.getChildByName("zhuang");
          viewData.headImg = nodeSeat.getChildByName("head_clip").getChildByName("head_img").getComponent(cc.Sprite);
          viewData.mahjongs = nodeSeat.getChildByName("pai");
          viewData.chipenggang = nodeSeat.getChildByName("chipenggang");
          this._seats.push(viewData);
        }
        this._btnReady = cc.find("Canvas/game_over/btn_ready");
        this._btnReady && th.utils.addClickEvent(this._btnReady, this.node, "MJGameOver", "onBtnReadyClicked");
        this._btnConfirm = cc.find("Canvas/game_over/btn_confirm");
        this._btnConfirm && th.utils.addClickEvent(this._btnConfirm, this.node, "MJGameOver", "onBtnReadyClicked");
        this._btnReady.active = true;
        this._btnConfirm.active = false;
        var self = this;
        this.node.on("game_over", function(data) {
          self.onGameOver(data.detail);
        });
        this.node.on("game_end", function(data) {
          self._isGameEnd = true;
          self._btnReady.active = false;
          self._btnConfirm.active = true;
        });
      },
      onGameOver: function onGameOver(data) {
        if (0 == data.length) {
          this._nodeGameResult.active = true;
          return;
        }
        this._nodeGameOver.active = true;
        this._lblWin.active = false;
        this._lblLose.active = false;
        this._lblLiuju.active = false;
        var myScore = data[th.socketIOManager.seatIndex].score;
        myScore > 0 ? this._lblWin.active = true : myScore < 0 ? this._lblLose.active = true : this._lblLiuju.active = true;
        for (var i = 0; i < 4; i++) {
          if (i > data.length - 1) {
            this._nodeSeats[i].active = false;
            continue;
          }
          this._nodeSeats[i].active = true;
          var seatView = this._seats[i];
          var userData = data[i];
          var actionArr = [];
          if (userData.isHu) {
            var huInfo = userData.huInfo;
            var paixing = huInfo.paixing;
            1 == paixing ? actionArr.push("正规七风13幺") : 2 == paixing ? actionArr.push("正规13幺") : 3 == paixing ? actionArr.push("非正规七风13幺") : 4 == paixing ? actionArr.push("非正规13幺") : 5 == paixing ? actionArr.push("7对") : 6 == paixing ? actionArr.push("碰碰胡") : 7 == paixing ? actionArr.push("平湖") : 8 == paixing && actionArr.push("三财神");
            var action = huInfo.action;
            1 == action ? actionArr.push("抢杠胡") : 2 == action ? actionArr.push("杠上花") : 3 == action && actionArr.push("自摸");
            huInfo.isDangDiao && actionArr.push("单吊");
            huInfo.isSanCaiShen && actionArr.push("三财神");
            huInfo.isCaiShenTou && actionArr.push("财神头");
            huInfo.isZiYiSe ? actionArr.push("字一色") : huInfo.isQingYiSe ? actionArr.push("清一色") : huInfo.isHunYiSe && actionArr.push("混一色");
          }
          seatView.username.string = th.socketIOManager.seats[i].name;
          seatView.reason.string = actionArr.join("、");
          seatView.zhuang.active = th.socketIOManager.bankerIndex == i;
          var headImgUrl = th.socketIOManager.seats[i].headImgUrl;
          (function(seatView, headImgUrl) {
            cc.loader.load({
              url: headImgUrl,
              type: "jpg"
            }, function(err, texture) {
              if (!err) {
                var headSpriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                seatView.headImg.spriteFrame = headSpriteFrame;
                seatView.headImg.node.setScale(2 - texture.width / 94);
              }
            });
          })(seatView, headImgUrl);
          if (userData.score >= 0) {
            seatView.winscore.string = "+" + userData.score;
            seatView.winscore.node.active = true;
            seatView.losescore.node.active = false;
          } else {
            seatView.losescore.string = userData.score;
            seatView.losescore.node.active = true;
            seatView.winscore.node.active = false;
          }
          th.mahjongManager.sortHolds(userData.holds);
          for (var k = 0; k < seatView.mahjongs.childrenCount; k++) {
            var mahjong = seatView.mahjongs.children[k];
            mahjong.active = false;
          }
          var lackingNum = 3 * (userData.pengs.length + userData.angangs.length + userData.diangangs.length + userData.bugangs.length + userData.chis.length);
          userData.isHu && userData.holds.push(userData.huInfo.pai);
          for (var k = 0; k < userData.holds.length; k++) {
            var pai = userData.holds[k];
            var mahjong = seatView.mahjongs.children[k + lackingNum];
            mahjong.active = true;
            var sprite = mahjong.getComponent(cc.Sprite);
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_", pai);
            var gold_icon = sprite.node.getChildByName("gold_icon");
            gold_icon.active = pai == th.socketIOManager.caishen;
          }
          for (var k = 0; k < seatView.chipenggang.childrenCount; k++) seatView.chipenggang.children[k].active = false;
          var index = 0;
          var gangs = userData.angangs;
          for (var k = 0; k < gangs.length; ++k) {
            var info = gangs[k];
            this.initChiPengGang(seatView, index, info, "angang");
            index++;
          }
          var gangs = userData.diangangs;
          for (var k = 0; k < gangs.length; ++k) {
            var info = gangs[k];
            this.initChiPengGang(seatView, index, info, "diangang");
            index++;
          }
          var gangs = userData.bugangs;
          for (var k = 0; k < gangs.length; ++k) {
            var info = gangs[k];
            this.initChiPengGang(seatView, index, info, "bugang");
            index++;
          }
          var pengs = userData.pengs;
          if (pengs) for (var k = 0; k < pengs.length; ++k) {
            var info = pengs[k];
            this.initChiPengGang(seatView, index, info, "peng");
            index++;
          }
          var chis = userData.chis;
          if (chis) for (var k = 0; k < chis.length; ++k) {
            var info = chis[k];
            this.initChiPengGang(seatView, index, info, "chi");
            index++;
          }
        }
      },
      initChiPengGang: function initChiPengGang(seatView, index, info, flag) {
        var nodeCPG = null;
        if (seatView.chipenggang.childrenCount <= index) {
          nodeCPG = cc.instantiate(th.mahjongManager.pengPrefabSelf);
          seatView.chipenggang.addChild(nodeCPG);
        } else {
          nodeCPG = seatView.chipenggang.children[index];
          nodeCPG.active = true;
        }
        nodeCPG.active = true;
        nodeCPG.x = 55 * index * 3 + 10 * index;
        var sprites = nodeCPG.getComponentsInChildren(cc.Sprite);
        if ("angang" == flag) for (var i = 0; i < sprites.length; i++) {
          var sprite = sprites[i];
          if ("point_left" == sprite.node.name || "point_dui" == sprite.node.name || "point_right" == sprite.node.name) sprite.node.active = false; else if ("gang" == sprite.node.name) {
            sprite.node.active = true;
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_", info.mjid);
          } else {
            sprite.node.active = true;
            sprite.spriteFrame = th.mahjongManager.getEmptySpriteFrame("myself");
          }
        } else if ("diangang" == flag || "bugang" == flag) for (var i = 0; i < sprites.length; i++) {
          var sprite = sprites[i];
          if ("point_left" == sprite.node.name || "point_dui" == sprite.node.name || "point_right" == sprite.node.name) sprite.node.active = false; else {
            sprite.node.active = true;
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_", info.mjid);
          }
        } else if ("peng" == flag) for (var i = 0; i < sprites.length; i++) {
          var sprite = sprites[i];
          if ("point_left" == sprite.node.name || "point_dui" == sprite.node.name || "point_right" == sprite.node.name) sprite.node.active = false; else if ("gang" == sprite.node.name) sprite.node.active = false; else {
            sprite.node.active = true;
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_", info.mjid);
          }
        } else if ("chi" == flag) {
          var idx = 0;
          for (var i = 0; i < sprites.length; i++) {
            var sprite = sprites[i];
            if ("point_left" == sprite.node.name || "point_dui" == sprite.node.name || "point_right" == sprite.node.name) sprite.node.active = false; else if ("gang" == sprite.node.name) sprite.node.active = false; else {
              sprite.node.active = true;
              sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_", info.mjids[idx]);
              idx += 1;
            }
          }
        }
      },
      onBtnReadyClicked: function onBtnReadyClicked() {
        cc.log("onBtnReadyClicked");
        this._isGameEnd ? this._nodeGameResult.active = true : th.sio.send("ready");
        this._nodeGameOver.active = false;
      },
      update: function update(dt) {}
    });
    cc._RF.pop();
  }, {} ],
  MJGameResult: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2378fc6BVJK4Z7bouhpSItH", "MJGameResult");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        _nodeGameResult: null,
        _seats: []
      },
      onLoad: function onLoad() {
        if (null == th) return;
        this._nodeGameResult = this.node.getChildByName("game_result");
        var seats = this._nodeGameResult.getChildByName("result_list");
        this._seats.push(seats.getChildByName("seat1"));
        this._seats.push(seats.getChildByName("seat2"));
        this._seats.push(seats.getChildByName("seat3"));
        this._seats.push(seats.getChildByName("seat4"));
        var btnBackHall = cc.find("Canvas/game_result/btn_back_hall");
        btnBackHall && th.utils.addClickEvent(btnBackHall, this.node, "MJGameResult", "onBtnBackHallClicked");
        var btnShareResult = cc.find("Canvas/game_result/btn_share_result");
        btnShareResult && th.utils.addClickEvent(btnShareResult, this.node, "MJGameResult", "onBtnShareResultClicked");
        var self = this;
        this.node.on("game_end", function(data) {
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
        var headSprite = seat.getChildByName("head_clip").getChildByName("head_img").getComponent(cc.Sprite);
        (function(headSprite, headUrl) {
          cc.loader.load({
            url: headUrl,
            type: "jpg"
          }, function(err, texture) {
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
        for (var i = 0; i < seats.length; i++) seats[i].score > maxScore && (maxScore = seats[i].score);
        for (var i = 0; i < 4; i++) this._seats[i].active = false;
        for (var i = 0; i < seats.length; i++) {
          this._seats[i].active = true;
          var seat = seats[i];
          var isDaYinJia = false;
          seat.score > 0 && (isDaYinJia = seat.score == maxScore);
          var isFangZhu = seat.userId == th.socketIOManager.creator;
          this.showResult(this._seats[i], seat.userId, seat.name, seat.headImgUrl, isFangZhu, isDaYinJia, endInfo[i], seat.score);
        }
      },
      onBtnBackHallClicked: function onBtnBackHallClicked() {
        cc.log("onBtnBackHallClicked");
        th.wc.show("正在返回游戏大厅");
        cc.director.loadScene("hall");
      },
      onBtnShareResultClicked: function onBtnShareResultClicked() {
        cc.log("onBtnShareClicked");
        cc.sys.os != cc.sys.OS_ANDROID && cc.sys.os != cc.sys.OS_IOS || th.anysdkManager.shareCaptureScreen(false);
      },
      update: function update(dt) {}
    });
    cc._RF.pop();
  }, {} ],
  MJGame: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4bfedfG94xLrbJd946qbcx3", "MJGame");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        lblMjCount: cc.Label,
        lblFontMjCount: cc.Label,
        lblRoundCount: cc.Label,
        spriteCaishen: cc.Sprite,
        btnReady: cc.Button,
        chupaidian: cc.Sprite,
        settingWin: cc.Node,
        optionsWin: cc.Node,
        nodePrepare: cc.Node,
        nodeGameInfo: cc.Node,
        _mymjs: [],
        _effects: [],
        _chupais: [],
        _hupaiTips: []
      },
      onLoad: function onLoad() {
        if (null == th) return;
        this.addComponent("MJFolds");
        this.addComponent("MJChiPengGangs");
        this.addComponent("MJGameOver");
        this.addComponent("MJGameResult");
        this.addComponent("MJReConnect");
        this.initView();
        this.initEventHandlers();
        this.nodePrepare.active = true;
        this.nodeGameInfo.active = false;
        this.onGameBegin();
        th.audioManager.playBGM("bg_fight.mp3");
      },
      initView: function initView() {
        this.chupaidian.node.active = false;
        var myHolds = this.node.getChildByName("myself").getChildByName("Holds");
        for (var j = 0; j < myHolds.children.length; j++) {
          var sprite = myHolds.children[j].getComponent(cc.Sprite);
          sprite.node.active = false;
          this._mymjs.push(sprite);
          sprite.spriteFrame = null;
          this.initDragStuffs(sprite.node);
        }
        var realwidth = cc.director.getVisibleSize().width;
        myHolds.scaleX *= realwidth / 1280;
        myHolds.scaleY *= realwidth / 1280;
        var sides = [ "myself", "right", "up", "left" ];
        for (var i = 1; i < sides.length; i++) {
          var mjs = this.node.getChildByName(sides[i]).getChildByName("Holds").children;
          for (var j = 0; j < mjs.length; j++) {
            var sprite = mjs[j].getComponent(cc.Sprite);
            sprite.node.active = false;
          }
        }
        for (var i = 0; i < sides.length; i++) {
          var seatNode = this.node.getChildByName(sides[i]);
          var spriteChupai = seatNode.getChildByName("Chupai").getComponent(cc.Sprite);
          spriteChupai.node.active = false;
          spriteChupai.spriteFrame = null;
          var nodeHupai = seatNode.getChildByName("Hupai");
          nodeHupai.active = false;
          if (2 == i && 3 == th.socketIOManager.seats.length || (1 == i || 3 == i) && 2 == th.socketIOManager.seats.length) continue;
          var animation = seatNode.getChildByName("Effect").getComponent(cc.Animation);
          this._effects.push(animation);
          this._chupais.push(spriteChupai);
          this._hupaiTips.push(nodeHupai);
        }
        this.hideOptions();
      },
      initEventHandlers: function initEventHandlers() {
        var self = this;
        th.socketIOManager.dataEventHandler = this.node;
        this.node.on("check_ip", function(data) {
          cc.log("==>MJGame check_ip:", JSON.stringify(data.detail));
          self.checkIp();
        });
        this.node.on("sync_push", function(data) {
          self.onGameBegin();
          self.checkIp();
        });
        this.node.on("ready_result", function(data) {
          cc.log("==>Gmae ready_result:", JSON.stringify(data.detail));
          var seat = data.detail;
          self.btnReady.node.active = 0 == th.socketIOManager.round && !seat.ready;
        });
        this.node.on("holds_push", function(data) {
          cc.log("==>Gmae holds_push:", JSON.stringify(data.detail));
          self.initMahjongs();
        });
        this.node.on("begin_push", function(data) {
          cc.log("==>Gmae begin_push:", JSON.stringify(data.detail));
          self.onGameBegin();
          1 == th.socketIOManager.round && cc.log("check ip ....");
        });
        this.node.on("disconnect", function(data) {
          cc.log("==>Gmae disconnect:", JSON.stringify(data.detail));
        });
        this.node.on("mjsy_push", function(target) {
          self.lblMjCount.string = "剩余 " + th.socketIOManager.mjsy + " 张";
          self.lblFontMjCount.string = "x" + th.socketIOManager.mjsy;
        });
        this.node.on("round_push", function(data) {
          cc.log("==>Gmae round_push:", JSON.stringify(data.detail));
          self.lblRoundCount.string = "剩余 " + (th.socketIOManager.config.round - th.socketIOManager.round) + " 局";
        });
        this.node.on("caishen_push", function(data) {
          cc.log("==>Gmae caishen_push:", JSON.stringify(data.detail));
          self.setSpriteFrameByMJID("B_", self.spriteCaishen, th.socketIOManager.caishen);
        });
        this.node.on("begin_push", function(data) {
          cc.log("==>Gmae begin_push:", JSON.stringify(data.detail));
          self.onGameBegin();
          1 == th.socketIOManager.round && cc.log("check ip ....");
        });
        this.node.on("chupai_push", function(data) {
          cc.log("==>Gmae chupai_push:", JSON.stringify(data.detail));
          data = data.detail;
          self.hideChupai();
          data.last != th.socketIOManager.seatIndex && self.initMopai(data.last, null);
          data.turn != th.socketIOManager.seatIndex && self.initMopai(data.turn, -1);
        });
        this.node.on("action_push", function(data) {
          cc.log("==>Gmae action_push:", JSON.stringify(data.detail));
          self.showAction(data.detail);
        });
        this.node.on("guo_result", function(data) {
          self.hideChupai();
        });
        this.node.on("guo_notify_push", function(data) {
          self.hideChupai();
          self.hideOptions();
          var seatData = data.detail;
          seatData.index == th.socketIOManager.seatIndex && self.initMahjongs();
          th.audioManager.playSFX("give.mp3");
        });
        this.node.on("chi_notify_push", function(data) {
          cc.log("==>Gmae chi_notify_push:", JSON.stringify(data.detail));
          self.hideChupai();
          var seatData = data.detail;
          seatData.index == th.socketIOManager.seatIndex ? self.initMahjongs() : self.initOtherMahjongs(seatData);
          var localIndex = th.socketIOManager.getLocalIndex(seatData.index);
          self.playEffect(localIndex, "play_chi");
          th.audioManager.playSFX("nv/chi.mp3");
          self.hideOptions();
        });
        this.node.on("peng_notify_push", function(data) {
          cc.log("==>Gmae peng_notify_push:", JSON.stringify(data.detail));
          self.hideChupai();
          var seatData = data.detail;
          seatData.index == th.socketIOManager.seatIndex ? self.initMahjongs() : self.initOtherMahjongs(seatData);
          var localIndex = th.socketIOManager.getLocalIndex(seatData.index);
          self.playEffect(localIndex, "play_peng");
          th.audioManager.playSFX("nv/peng.mp3");
          self.hideOptions();
        });
        this.node.on("gang_notify_push", function(data) {
          cc.log("==>Gmae gang_notify_push:", JSON.stringify(data.detail));
          self.hideChupai();
          var seatData = data.detail;
          seatData.index == th.socketIOManager.seatIndex ? self.initMahjongs() : self.initOtherMahjongs(seatData);
          self.hideOptions();
        });
        this.node.on("hangang_notify_push", function(data) {
          cc.log("==>Gmae hangang_notify_push:", JSON.stringify(data.detail));
          var seatIndex = th.socketIOManager.getSeatIndexById(data.detail.userId);
          var localIndex = th.socketIOManager.getLocalIndex(seatIndex);
          self.playEffect(localIndex, "angang" == data.detail.gangType ? "play_angang" : "play_gang");
          th.audioManager.playSFX("nv/gang.mp3");
          self.hideOptions();
        });
        this.node.on("chupai_notify_push", function(data) {
          self.hideChupai();
          var seatData = data.detail.seatData;
          seatData.index == th.socketIOManager.seatIndex ? self.initMahjongs() : self.initOtherMahjongs(seatData);
          self.showChupai();
          var audioUrl = th.mahjongManager.getAudioURLByMJID(data.detail.pai);
          th.audioManager.playSFX(audioUrl);
        });
        this.node.on("mopai_push", function(data) {
          self.hideChupai();
          data = data.detail;
          var pai = data.pai;
          var localIndex = th.socketIOManager.getLocalIndex(data.seatIndex);
          if (0 == localIndex) {
            var index = 13;
            var sprite = self._mymjs[index];
            sprite.node.mjid = pai;
            self.setSpriteFrameByMJID("M_", sprite, pai);
            var gold_icon = sprite.node.getChildByName("gold_icon");
            gold_icon.active = pai == th.socketIOManager.caishen;
          } else false;
        });
        this.node.on("hu_push", function(data) {
          cc.log("==>Gmae hu_push:", JSON.stringify(data.detail));
          var data = data.detail;
          var seatIndex = data.seatIndex;
          var localIndex = th.socketIOManager.getLocalIndex(seatIndex);
          var nodeHupai = self._hupaiTips[localIndex];
          nodeHupai.active = true;
          0 == localIndex && self.hideOptions();
          var seatData = th.socketIOManager.seats[seatIndex];
          seatData.isHu = true;
          nodeHupai.getChildByName("hu").active = !data.isZimo;
          nodeHupai.getChildByName("zimo").active = data.isZimo;
          self.playEffect(localIndex, data.isZimo ? "play_zimo" : "play_hu");
          th.audioManager.playSFX("nv/hu.mp3");
        });
        this.node.on("clean_push", function() {
          cc.log("==>Gmae clean_push:");
          var sides = [ "myself", "right", "up", "left" ];
          for (var i = 0; i < sides.length; i++) {
            var seatNode = self.node.getChildByName(sides[i]);
            var mjs = seatNode.getChildByName("Holds").children;
            for (var j = 0; j < mjs.length; j++) {
              var sprite = mjs[j].getComponent(cc.Sprite);
              sprite.node.active = false;
              sprite.spriteFrame = null;
            }
            var spriteChupai = seatNode.getChildByName("Chupai").getComponent(cc.Sprite);
            spriteChupai.node.active = false;
            spriteChupai.spriteFrame = null;
            var nodeHupai = seatNode.getChildByName("Hupai");
            nodeHupai.active = false;
          }
          self.nodeGameInfo.active = false;
          self.hideChupai();
          self.hideOptions();
        });
        this.node.on("repeat_login", function() {
          th.alert.show("提示", "您的账号已在别处登录！", function() {
            th.wc.show("正在返回登录场景");
            cc.director.loadScene("login");
          }, false);
        });
      },
      playEffect: function playEffect(index, name) {
        this._effects[index].node.active = true;
        this._effects[index].play(name);
      },
      initDragStuffs: function initDragStuffs(node) {
        node.on(cc.Node.EventType.TOUCH_START, function(event) {
          if (th.socketIOManager.turn != th.socketIOManager.seatIndex) return;
          node.interactable = node.getComponent(cc.Button).interactable;
          if (!node.interactable) return;
          this.chupaidian.node.active = false;
          this.chupaidian.spriteFrame = node.getComponent(cc.Sprite).spriteFrame;
          this.chupaidian.node.x = event.getLocationX() - cc.director.getVisibleSize().width / 2;
          this.chupaidian.node.y = event.getLocationY() - cc.director.getVisibleSize().height / 2;
          var gold_icon = this.chupaidian.node.getChildByName("gold_icon");
          gold_icon.active = node.mjid == th.socketIOManager.caishen;
        }.bind(this));
        node.on(cc.Node.EventType.TOUCH_MOVE, function(event) {
          if (th.socketIOManager.turn != th.socketIOManager.seatIndex) return;
          if (!node.interactable) return;
          if (Math.abs(event.getDeltaX()) + Math.abs(event.getDeltaY()) < .5) return;
          this.chupaidian.node.active = true;
          node.opacity = 150;
          this.chupaidian.node.opacity = 255;
          this.chupaidian.node.scaleX = 1;
          this.chupaidian.node.scaleY = 1;
          this.chupaidian.node.x = event.getLocationX() - cc.director.getVisibleSize().width / 2;
          this.chupaidian.node.y = event.getLocationY() - cc.director.getVisibleSize().height / 2;
          node.y = 0;
        }.bind(this));
        node.on(cc.Node.EventType.TOUCH_END, function(event) {
          if (th.socketIOManager.turn != th.socketIOManager.seatIndex) return;
          if (!node.interactable) return;
          this.chupaidian.node.active = false;
          node.opacity = 255;
          if (event.getLocationY() >= 200) {
            cc.log("chupai :", node.mjid);
            this.shoot(node.mjid);
          }
        }.bind(this));
        node.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
          if (th.socketIOManager.turn != th.socketIOManager.seatIndex) return;
          if (!node.interactable) return;
          if (event.getLocationY() >= 200) {
            this.chupaidian.node.active = false;
            node.opacity = 255;
            cc.log("chupai :", node.mjid);
            this.shoot(node.mjid);
          } else {
            this.chupaidian.node.active = false;
            node.opacity = 255;
          }
        }.bind(this));
      },
      onGameBegin: function onGameBegin() {
        for (var i = 0; i < this._effects.length; i++) this._effects[i].node.active = false;
        for (var i = 0; i < th.socketIOManager.seats.length; i++) {
          var seatData = th.socketIOManager.seats[i];
          var localIndex = th.socketIOManager.getLocalIndex(i);
          var nodeHupai = this._hupaiTips[localIndex];
          nodeHupai.active = seatData.isHu;
          if (seatData.isHu) {
            nodeHupai.getChildByName("hu").active = !seatData.isZimo;
            nodeHupai.getChildByName("zimo").active = seatData.isZimo;
          }
        }
        this.hideChupai();
        this.hideOptions();
        this.btnReady.node.active = "idle" == th.socketIOManager.status && !th.socketIOManager.seats[th.socketIOManager.seatIndex].ready;
        if ("idle" == th.socketIOManager.status) return;
        this.setSpriteFrameByMJID("B_", this.spriteCaishen, th.socketIOManager.caishen);
        this.lblRoundCount.string = "剩余 " + (th.socketIOManager.config.round - th.socketIOManager.round) + " 局";
        this.lblMjCount.string = "剩余 " + th.socketIOManager.mjsy + " 张";
        var sides = [ "right", "up", "left" ];
        for (var i = 0; i < sides.length; ++i) {
          var holds = this.node.getChildByName(sides[i]).getChildByName("Holds");
          for (var j = 0; j < holds.childrenCount; ++j) {
            var nc = holds.children[j];
            nc.active = true;
            nc.scaleX = 1;
            nc.scaleY = 1;
            var sprite = nc.getComponent(cc.Sprite);
            sprite.spriteFrame = th.mahjongManager.holdsEmpty[i + 1];
          }
        }
        this.nodePrepare.active = false;
        this.nodeGameInfo.active = true;
        this.initMahjongs();
        for (var i = 0; i < th.socketIOManager.seats.length; i++) {
          var seatData = th.socketIOManager.seats[i];
          var localIndex = th.socketIOManager.getLocalIndex(i);
          if (0 != localIndex) {
            this.initOtherMahjongs(seatData);
            i == th.socketIOManager.turn ? this.initMopai(i, -1) : this.initMopai(i, null);
          }
        }
        this.showChupai();
        if (null != th.socketIOManager.actions) {
          this.showAction(th.socketIOManager.actions);
          th.socketIOManager.actions = null;
        }
      },
      onMJClicked: function onMJClicked(event) {
        if (th.socketIOManager.turn != th.socketIOManager.seatIndex) return;
        for (var i = 0; i < this._mymjs.length; ++i) if (event.target == this._mymjs[i].node) {
          if (event.target == this._selectedMJ) {
            cc.log("chupai :", this._selectedMJ.mjid);
            this.shoot(this._selectedMJ.mjid);
            this._selectedMJ.y = 0;
            this._selectedMJ = null;
            return;
          }
          null != this._selectedMJ && (this._selectedMJ.y = 0);
          event.target.y = 15;
          this._selectedMJ = event.target;
          return;
        }
      },
      onOptionClicked: function onOptionClicked(event) {
        if ("btnPeng" == event.target.name) th.sio.send("peng"); else if ("btnGang" == event.target.name) th.sio.send("gang", event.target.pai); else if ("btnHu" == event.target.name) th.sio.send("hu"); else if ("btnChi" == event.target.name) th.sio.send("chi", event.target.pais); else if ("btnGuo" == event.target.name) {
          th.socketIOManager.turn == th.socketIOManager.seatIndex && (this.optionsWin.active = false);
          th.sio.send("guo");
        }
      },
      shoot: function shoot(mjid) {
        if (null == mjid) return;
        th.sio.send("chupai", mjid);
      },
      getMJIndex: function getMJIndex(side, index) {
        if ("right" == side || "up" == side) return 13 - index;
        return index;
      },
      initMopai: function initMopai(seatIndex, pai) {
        var localIndex = th.socketIOManager.getLocalIndex(seatIndex);
        var side = th.mahjongManager.getSide(localIndex);
        var pre = th.mahjongManager.getFoldPre(localIndex);
        var holds = this.node.getChildByName(side).getChildByName("Holds");
        var lastIndex = this.getMJIndex(side, 13);
        var nc = holds.children[lastIndex];
        nc.scaleX = 1;
        nc.scaleY = 1;
        if (null == pai) nc.active = false; else if (pai >= 0) {
          nc.active = true;
          if ("up" == side) {
            nc.scaleX = .73;
            nc.scaleY = .73;
          }
          var sprite = nc.getComponent(cc.Sprite);
          sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, pai);
        } else if (null != pai) {
          nc.active = true;
          if ("up" == side) {
            nc.scaleX = 1;
            nc.scaleY = 1;
          }
          var sprite = nc.getComponent(cc.Sprite);
          sprite.spriteFrame = th.mahjongManager.getHoldsEmptySpriteFrame(side);
        }
      },
      hideChupai: function hideChupai() {
        for (var i = 0; i < this._chupais.length; i++) this._chupais[i].node.active = false;
      },
      showChupai: function showChupai() {
        var pai = th.socketIOManager.chupai;
        if (pai >= 0) {
          var localIndex = th.socketIOManager.getLocalIndex(th.socketIOManager.turn);
          var sprite = this._chupais[localIndex];
          sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_", pai);
          sprite.node.active = true;
          var gold_icon = sprite.node.getChildByName("gold_icon");
          gold_icon.active = pai == th.socketIOManager.caishen;
        }
      },
      addOption: function addOption(btnName, pai) {
        var options = this.optionsWin.getChildByName("Options");
        for (var i = 0; i < options.childrenCount; i++) {
          var option = options.children[i];
          if ("Option" == option.name && false == option.active) {
            option.active = true;
            if ("btnChi" != btnName) {
              var sprite = option.getChildByName("opTarget1").getComponent(cc.Sprite);
              sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_", pai);
              sprite.node.active = true;
              var btns = option.getChildByName("btns");
              var btn = btns.getChildByName(btnName);
              btn.active = true;
              btn.pai = pai;
            } else {
              var pais = [];
              for (var i = 0; i < pai.length; i++) if (-1 != pai[i]) {
                pais.push(pai[i]);
                var sprite = option.getChildByName("opTarget" + (3 - pais.length)).getComponent(cc.Sprite);
                sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_", pai[i]);
                sprite.node.active = true;
              }
              var btns = option.getChildByName("btns");
              var btn = btns.getChildByName(btnName);
              btn.active = true;
              btn.pais = pai.join(",");
            }
            break;
          }
        }
      },
      showAction: function showAction(data) {
        this.optionsWin.active && this.hideOptions();
        if (data && (data.hu || data.gang || data.peng || data.chi)) {
          this.optionsWin.active = true;
          data.hu && this.addOption("btnHu", data.huPai);
          data.peng && this.addOption("btnPeng", data.pengPai);
          if (data.chi) for (var i = 0; i < data.chiPai.length; ++i) {
            var pais = data.chiPai[i];
            this.addOption("btnChi", pais);
          }
          if (data.gang) for (var i = 0; i < data.gangPai.length; ++i) {
            var gp = data.gangPai[i];
            this.addOption("btnGang", gp);
          }
        }
      },
      initMahjongs: function initMahjongs() {
        var seats = th.socketIOManager.seats;
        var seatData = seats[th.socketIOManager.seatIndex];
        var holds = seatData.holds;
        if (null == holds) return;
        holds = th.mahjongManager.sortHolds(holds);
        var lackingNum = 3 * (seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.bugangs.length + seatData.chis.length);
        for (var i = 0; i < holds.length; i++) {
          var mjid = holds[i];
          var sprite = this._mymjs[lackingNum + i];
          sprite.node.mjid = mjid;
          this.setSpriteFrameByMJID("M_", sprite, mjid);
          var gold_icon = sprite.node.getChildByName("gold_icon");
          gold_icon.active = mjid == th.socketIOManager.caishen;
          sprite.node.y = 0;
        }
        for (var i = 0; i < lackingNum; i++) {
          var sprite = this._mymjs[i];
          sprite.node.mjid = null;
          sprite.spriteFrame = null;
          sprite.node.active = false;
          sprite.node.y = 0;
        }
        for (var i = lackingNum + holds.length; i < this._mymjs.length; ++i) {
          var sprite = this._mymjs[i];
          sprite.node.mjid = null;
          sprite.spriteFrame = null;
          sprite.node.active = false;
          sprite.node.y = 0;
        }
      },
      initOtherMahjongs: function initOtherMahjongs(seatData) {
        var localIndex = th.socketIOManager.getLocalIndex(seatData.index);
        if (0 == localIndex) return;
        var side = th.mahjongManager.getSide(localIndex);
        var sideHolds = this.node.getChildByName(side).getChildByName("Holds");
        var lackingNum = 3 * (seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.bugangs.length + seatData.chis.length);
        for (var i = 0; i < lackingNum; i++) {
          var idx = this.getMJIndex(side, i);
          sideHolds.children[idx].active = false;
        }
        var pre = th.mahjongManager.getFoldPre(localIndex);
        var holds = th.mahjongManager.sortHolds(seatData.holds);
        if (null != holds && holds.length > 0) {
          for (var i = 0; i < holds.length; i++) {
            var idx = this.getMJIndex(side, i + lackingNum);
            var sprite = sideHolds.children[idx].getComponent(cc.Sprite);
            if ("up" == side) {
              sprite.node.scaleX = .73;
              sprite.node.scaleY = .73;
            }
            sprite.node.active = true;
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, holds[i]);
          }
          if (holds.length + lackingNum == 13) {
            var lasetIdx = this.getMJIndex(side, 13);
            sideHolds.children[lasetIdx].active = false;
          }
        }
      },
      setSpriteFrameByMJID: function setSpriteFrameByMJID(pre, sprite, mjid) {
        sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre, mjid);
        sprite.node.active = true;
      },
      hideOptions: function hideOptions(data) {
        this.optionsWin.active = false;
        var options = this.optionsWin.getChildByName("Options");
        for (var i = 0; i < options.childrenCount; i++) {
          var option = options.children[i];
          if ("Option" == option.name) {
            option.active = false;
            option.getChildByName("opTarget1").active = false;
            option.getChildByName("opTarget2").active = false;
            var btns = option.getChildByName("btns");
            btns.getChildByName("btnChi").active = false;
            btns.getChildByName("btnPeng").active = false;
            btns.getChildByName("btnGang").active = false;
            btns.getChildByName("btnHu").active = false;
          }
        }
      },
      checkIp: function checkIp() {
        cc.log("==>MJGame check_ip:");
      }
    });
    cc._RF.pop();
  }, {} ],
  MJReConnect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "54de3Nitr1HaaQyXFuS6GIL", "MJReConnect");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        _reconnect: null,
        _lblTip: null,
        _loading_image: null,
        _lastPing: 0
      },
      onLoad: function onLoad() {
        cc.log("MJReconnect onload");
        this._reconnect = cc.find("Canvas/ReConnect");
        this._loading_image = this._reconnect.getChildByName("loading_image");
        var self = this;
        var fnTestServerOn = function fnTestServerOn() {
          th.sio.test(function(err, data) {
            cc.log("MJReConnect fnTestServerOn:", data);
            if (err || data.errcode || false == data.isOnline) setTimeout(fnTestServerOn, 3e3); else {
              var roomId = th.userManager.roomId;
              th.socketIOManager.resetRound();
              if (null != roomId) {
                th.userManager.roomId = null;
                th.userManager.joinRoom(roomId, function(data) {
                  if (0 != data.errcode) {
                    th.socketIOManager.roomId = null;
                    cc.director.loadScene("hall");
                  }
                });
              }
            }
          });
        };
        var fn = function fn(data) {
          self.node.off("disconnect", fn);
          self._reconnect.active = true;
          cc.log("MJREConnect disconnect");
          fnTestServerOn();
        };
        this.node.on("connect_success", function() {
          self._reconnect.active = false;
          self.node.on("disconnect", fn);
        });
        this.node.on("disconnect", fn);
      },
      update: function update(dt) {
        this._reconnect.active && (this._loading_image.rotation = this._loading_image.rotation - 90 * dt);
      }
    });
    cc._RF.pop();
  }, {} ],
  MJRoom: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9e94cmRNURPVYbq/hLFI5Fb", "MJRoom");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        settingWin: cc.Node,
        lblRoomId: cc.Label,
        lblWangfa: cc.Label,
        btnMenu: cc.Button,
        btnLeave: cc.Button,
        btnWechatInvite: cc.Button,
        btnDissolve: cc.Button,
        _seats: []
      },
      onLoad: function onLoad() {
        if (null == th) return;
        this.initView();
        this.initSeats();
        this.initEventHandlers();
      },
      initView: function initView() {
        if (2 == th.socketIOManager.seats.length) {
          this.node.getChildByName("left").active = false;
          this.node.getChildByName("right").active = false;
        } else 3 == th.socketIOManager.seats.length && (this.node.getChildByName("up").active = false);
        this.lblRoomId.string = th.socketIOManager.roomId || "------";
        this.lblWangfa.string = th.socketIOManager.getWanfa();
        var sides = [ "myself", "right", "up", "left" ];
        for (var i = 0; i < sides.length; i++) {
          if (2 == i && 3 == th.socketIOManager.seats.length || (1 == i || 3 == i) && 2 == th.socketIOManager.seats.length) continue;
          var seatComponent = this.node.getChildByName(sides[i]).getChildByName("Seat").getComponent("MJSeat");
          this._seats.push(seatComponent);
        }
        cc.log("MJRoom Seats:", this._seats.length);
        this.refreshBtns();
      },
      initSeats: function initSeats() {
        var seats = th.socketIOManager.seats;
        for (var i = 0; i < seats.length; ++i) this.initSingleSeat(seats[i]);
      },
      initSingleSeat: function initSingleSeat(seat) {
        var index = th.socketIOManager.getLocalIndex(seat.index);
        this._seats[index].setInfo(seat.userId, seat.name, seat.score, seat.headImgUrl);
        this._seats[index].setFangzhu(seat.userId == th.socketIOManager.creator);
        this._seats[index].setBanker(seat.index == th.socketIOManager.bankerIndex);
        this._seats[index].setReady(seat.ready);
        this._seats[index].setOffline(!seat.online);
      },
      refreshBtns: function refreshBtns() {
        var isIdle = 0 == th.socketIOManager.round;
        var isFangzhu = th.socketIOManager.isFangzhu();
        this.btnDissolve.node.active = isIdle && isFangzhu;
        this.btnLeave.node.active = isIdle && !isFangzhu;
        this.btnWechatInvite.node.active = isIdle;
        this.btnMenu.node.active = !isIdle;
      },
      initEventHandlers: function initEventHandlers() {
        var self = this;
        this.node.on("join_push", function(target) {
          cc.log("==>MJRoom join_push:", JSON.stringify(target.detail));
          self.initSingleSeat(target.detail);
        });
        this.node.on("leave_push", function(target) {
          cc.log("==>MJRoom leave_push:", JSON.stringify(target.detail));
          self.initSingleSeat(target.detail);
        });
        this.node.on("offline_push", function(target) {
          cc.log("==>MJRoom offline_push:", JSON.stringify(target.detail));
          var seatIndex = th.socketIOManager.getSeatIndexById(target.detail.userId);
          var index = th.socketIOManager.getLocalIndex(seatIndex);
          self._seats[index].setOffline(true);
        });
        this.node.on("online_push", function(target) {
          cc.log("==>MJRoom online_push:", JSON.stringify(target.detail));
          var seatIndex = th.socketIOManager.getSeatIndexById(target.detail.userId);
          var index = th.socketIOManager.getLocalIndex(seatIndex);
          self._seats[index].setOffline(false);
        });
        this.node.on("ready_result", function(target) {
          var seat = target.detail;
          self.initSingleSeat(seat);
        });
        this.node.on("ready_push", function(target) {
          self.initSingleSeat(target.detail);
        });
        this.node.on("score_push", function(target) {
          self.initSingleSeat(target.detail);
        });
        this.node.on("begin_push", function(data) {
          self.refreshBtns();
          self.initSeats();
        });
      },
      onBtnDissolveRequestClicked: function onBtnDissolveRequestClicked() {
        th.alert.show("申请解散房间", "申请解散房间不会退换钻石，是否确定申请解散？", function() {
          th.sio.send("dissolve_request");
        }, true);
      },
      onBtnDissolveClicked: function onBtnDissolveClicked() {
        th.alert.show("解散房间", "解散房间不扣钻石，是否确定解散？", function() {
          th.sio.send("dissolve");
        }, true);
      },
      onBtnLeaveClicked: function onBtnLeaveClicked() {
        if (th.socketIOManager.isFangzhu()) {
          th.alert.show("离开房间", "您是房主，不能离开房间。", function() {});
          return;
        }
        th.alert.show("离开房间", "您确定要离开房间?", function() {
          th.sio.send("leave");
        }, true);
      },
      onBtnSettingClicked: function onBtnSettingClicked() {
        this.settingWin.active = true;
      },
      onBtnChatClicked: function onBtnChatClicked() {
        cc.log("onChatClicked==>");
      },
      onBtnVoiceClicked: function onBtnVoiceClicked() {
        cc.log("onVoiceClicked==>");
      },
      onBtnReadyClicked: function onBtnReadyClicked() {
        cc.log("onBtnReadyClicked==>");
        th.sio.send("ready");
      },
      onBtnWechatInviteClicked: function onBtnWechatInviteClicked() {
        cc.log("onBtnWechatInviteClicked==>");
        cc.sys.os != cc.sys.OS_ANDROID && cc.sys.os != cc.sys.OS_IOS || th.anysdkManager.shareWebpage(th.appInfo.appWeb, th.appInfo.shareTitle, th.socketIOManager.getRoomInfo(), false);
      }
    });
    cc._RF.pop();
  }, {} ],
  MJSeat: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f9241Gbzr5PTpX4P6axZTjN", "MJSeat");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        headImg: cc.Sprite,
        headwho: cc.Sprite,
        lblName: cc.Label,
        lblWinScore: cc.Label,
        lblLoseScore: cc.Label,
        offline: cc.Sprite,
        fangzhu: cc.Sprite,
        emoji: cc.Sprite,
        ready: cc.Sprite,
        banker: cc.Sprite,
        chat: cc.Label,
        _userId: null,
        _userName: "--",
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
        this.chat && (this.chat.node.active = false);
        this.emoji && (this.emoji.node.active = false);
        this.refresh();
      },
      refresh: function refresh() {
        this._userName && (this.lblName.string = this._userName);
        if (this._score) if (this._score >= 0) {
          this.lblWinScore.string = this._score;
          this.lblWinScore.node.active = true;
          this.lblLoseScore.node.active = false;
        } else {
          this.lblLoseScore.string = this._score;
          this.lblLoseScore.node.active = true;
          this.lblWinScore.node.active = false;
        }
        this.offline && (this.offline.node.active = this._isOffline && null != this._userId);
        this.ready && (this.ready.node.active = this._isReady && "idle" == th.socketIOManager.status);
        this.fangzhu && (this.fangzhu.node.active = this._isFangzhu);
        this.banker && (this.banker.node.active = this._isbanker);
      },
      setUserID: function setUserID(id) {
        this._userId = id;
      },
      setUserName: function setUserName(name) {
        this._userName = name;
        this.lblName && (this.lblName.string = this._userName);
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
          cc.loader.load({
            url: this._headImgUrl,
            type: "jpg"
          }, function(err, texture) {
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
        if (this.lblLoseScore && this.lblWinScore) if (this._score >= 0) {
          this.lblWinScore.string = this._score;
          this.lblWinScore.node.active = true;
          this.lblLoseScore.node.active = false;
        } else {
          this.lblLoseScore.string = this._score;
          this.lblLoseScore.node.active = true;
          this.lblWinScore.node.active = false;
        }
      },
      setFangzhu: function setFangzhu(isFangzhu) {
        this._isFangzhu = isFangzhu;
        this.fangzhu && (this.fangzhu.node.active = this._isFangzhu);
      },
      setReady: function setReady(isReady) {
        this._isReady = isReady;
        this.ready && (this.ready.node.active = this._isReady && "idle" == th.socketIOManager.status);
      },
      setBanker: function setBanker(isbanker) {
        this._isbanker = isbanker;
        this.banker && (this.banker.node.active = this._isbanker);
      },
      setOffline: function setOffline(isOffline) {
        this._isOffline = isOffline;
        this.offline && (this.offline.node.active = this._isOffline && null != this._userId);
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
          this.setUserName("--");
          this.setScore("--");
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
  }, {} ],
  MJStatus: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "eff0a4aOXBIibpfEIluCAoO", "MJStatus");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        time: cc.Label,
        delay: cc.Label,
        battery: cc.ProgressBar,
        _updateInterval: 1e3,
        _lastUpdateTime: 0,
        _updateBatteryInterval: 3e4,
        _lastUpdateBatteryTime: 0,
        _red: new cc.Color(205, 0, 0),
        _yellow: new cc.Color(255, 200, 0),
        _green: new cc.Color(0, 205, 0)
      },
      onLoad: function onLoad() {},
      update: function update(dt) {
        if (Date.now() - this._lastUpdateTime > this._updateInterval) {
          this.delay.string = th.sio.delay + "ms";
          this._lastUpdateTime = Date.now();
          th.sio.delay > 800 ? this.delay.node.color = this._red : th.sio.delay > 300 ? this.delay.node.color = this._yellow : this.delay.node.color = this._green;
          var now = new Date();
          var hour = now.getHours();
          var min = now.getMinutes();
          hour = hour < 10 ? "0" + hour : hour;
          min = min < 10 ? "0" + min : min;
          this.time.string = hour + ":" + min;
        }
        if (Date.now() - this._lastUpdateBatteryTime > this._updateBatteryInterval) {
          this._lastUpdateBatteryTime = Date.now();
          this.battery.progress = th.anysdkManager.getBatteryPercent();
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  MJTimePointer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "91966JzykBMnaossS5P+TJS", "MJTimePointer");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        lblTime: cc.Label,
        bottomPointer: cc.Sprite,
        rightPointer: cc.Sprite,
        topPointer: cc.Sprite,
        leftPointer: cc.Sprite,
        _pointers: [],
        _countdownEndTime: 0,
        _alertStartTime: 0,
        _isPlay: true
      },
      onLoad: function onLoad() {
        cc.log("TimePointer load ....");
        if (4 == th.socketIOManager.seats.length) {
          this._pointers.push(this.bottomPointer);
          this._pointers.push(this.rightPointer);
          this._pointers.push(this.topPointer);
          this._pointers.push(this.leftPointer);
        } else if (3 == th.socketIOManager.seats.length) {
          this._pointers.push(this.bottomPointer);
          this._pointers.push(this.rightPointer);
          this._pointers.push(this.leftPointer);
          this.topPointer.node.active = false;
        } else if (2 == th.socketIOManager.seats.length) {
          this._pointers.push(this.bottomPointer);
          this._pointers.push(this.topPointer);
          this.rightPointer.node.active = false;
          this.leftPointer.node.active = false;
        }
        this.initPointer();
        this.initEventHandlers();
      },
      initPointer: function initPointer() {
        if (null == th) return;
        this._isPlay = true;
        var turn = th.socketIOManager.turn;
        var localIndex = th.socketIOManager.getLocalIndex(turn);
        for (var i = 0; i < this._pointers.length; ++i) {
          var isAcitve = i == localIndex;
          this._pointers[i].node.active = isAcitve;
        }
      },
      initEventHandlers: function initEventHandlers() {
        var self = this;
        this.node.on("begin_push", function(data) {
          self.initPointer();
        });
        this.node.on("chupai_push", function(data) {
          self.initPointer();
          self._countdownEndTime = Date.now() + 1e4;
          self._alertStartTime = Date.now() + 7e3;
          self._isPlay = false;
        });
      },
      update: function update(dt) {
        var now = Date.now();
        if (this._countdownEndTime > now) {
          var miao = Math.ceil((this._countdownEndTime - now) / 1e3) - 1;
          this.lblTime.string = miao;
        }
        if (this._alertStartTime < now && !this._isPlay) {
          this._isPlay = true;
          th.audioManager.playSFX("timeup_alarm.mp3");
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  MahjongManger: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "baa6diT1/ZD/rHD/igYzXco", "MahjongManger");
    "use strict";
    var mahjongSprites = [];
    cc.Class({
      extends: cc.Component,
      properties: {
        leftAtlas: {
          default: null,
          type: cc.SpriteAtlas
        },
        rightAtlas: {
          default: null,
          type: cc.SpriteAtlas
        },
        bottomAtlas: {
          default: null,
          type: cc.SpriteAtlas
        },
        bottomFoldAtlas: {
          default: null,
          type: cc.SpriteAtlas
        },
        pengPrefabSelf: {
          default: null,
          type: cc.Prefab
        },
        pengPrefabLeft: {
          default: null,
          type: cc.Prefab
        },
        emptyAtlas: {
          default: null,
          type: cc.SpriteAtlas
        },
        holdsEmpty: {
          default: [],
          type: [ cc.SpriteFrame ]
        },
        _sides: null,
        _pres: null,
        _foldPres: null
      },
      onLoad: function onLoad() {
        if (null == th) return;
        th.mahjongManager = this;
        var seatSize = th.socketIOManager.seats.length;
        cc.log("==>MahjongManger seatSzie:", seatSize);
        if (4 == seatSize) {
          this._sides = [ "myself", "right", "up", "left" ];
          this._pres = [ "M_", "R_", "B_", "L_" ];
          this._foldPres = [ "B_", "R_", "B_", "L_" ];
        } else if (3 == seatSize) {
          this._sides = [ "myself", "right", "left" ];
          this._pres = [ "M_", "R_", "L_" ];
          this._foldPres = [ "B_", "R_", "L_" ];
        } else if (2 == seatSize) {
          this._sides = [ "myself", "up" ];
          this._pres = [ "M_", "B_" ];
          this._foldPres = [ "B_", "B_" ];
        }
        for (var i = 1; i < 10; ++i) mahjongSprites.push("character_" + i);
        for (var i = 1; i < 10; ++i) mahjongSprites.push("bamboo_" + i);
        for (var i = 1; i < 10; ++i) mahjongSprites.push("dot_" + i);
        for (var i = 1; i < 8; ++i) mahjongSprites.push("wind_" + i);
      },
      getMahjongSpriteByID: function getMahjongSpriteByID(id) {
        return mahjongSprites[id];
      },
      getMahjongType: function getMahjongType(id) {
        if (id >= 0 && id <= 8) return 0;
        if (id >= 9 && id <= 17) return 1;
        if (id >= 18 && id <= 16) return 2;
        if (id >= 27 && id <= 33) return 3;
      },
      getSpriteFrameByMJID: function getSpriteFrameByMJID(pre, mjid) {
        var spriteFrameName = this.getMahjongSpriteByID(mjid);
        spriteFrameName = pre + spriteFrameName;
        if ("M_" == pre) return this.bottomAtlas.getSpriteFrame(spriteFrameName);
        if ("B_" == pre) return this.bottomFoldAtlas.getSpriteFrame(spriteFrameName);
        if ("L_" == pre) return this.leftAtlas.getSpriteFrame(spriteFrameName);
        if ("R_" == pre) return this.rightAtlas.getSpriteFrame(spriteFrameName);
      },
      getAudioURLByMJID: function getAudioURLByMJID(id) {
        var realId = 0;
        id >= 0 && id <= 8 ? realId = id + 11 : id >= 9 && id <= 17 ? realId = id - 8 : id >= 18 && id <= 26 ? realId = id + 3 : id >= 27 && id <= 33 && (realId = id + 4);
        return "nv/" + realId + ".mp3";
      },
      getEmptySpriteFrame: function getEmptySpriteFrame(side) {
        if ("up" == side) return this.emptyAtlas.getSpriteFrame("e_mj_b_bottom");
        if ("myself" == side) return this.emptyAtlas.getSpriteFrame("e_mj_b_bottom");
        if ("left" == side) return this.emptyAtlas.getSpriteFrame("e_mj_b_left");
        if ("right" == side) return this.emptyAtlas.getSpriteFrame("e_mj_b_right");
      },
      getHoldsEmptySpriteFrame: function getHoldsEmptySpriteFrame(side) {
        if ("up" == side) return this.emptyAtlas.getSpriteFrame("e_mj_up");
        if ("myself" == side) return null;
        if ("left" == side) return this.emptyAtlas.getSpriteFrame("e_mj_left");
        if ("right" == side) return this.emptyAtlas.getSpriteFrame("e_mj_right");
      },
      sortHolds: function sortHolds(holds) {
        if (null == holds) return holds;
        holds.sort(function(a, b) {
          var aa = a;
          var bb = b;
          aa == th.socketIOManager.caishen ? aa -= 100 : 33 == aa && th.socketIOManager.caishen < 27 && (aa = th.socketIOManager.caishen);
          bb == th.socketIOManager.caishen ? bb -= 100 : 33 == bb && th.socketIOManager.caishen < 27 && (bb = th.socketIOManager.caishen);
          return aa - bb;
        });
        return holds;
      },
      sortMJ: function sortMJ(mahjongs, dingque) {
        var self = this;
        mahjongs.sort(function(a, b) {
          if (dingque >= 0) {
            var t1 = self.getMahjongType(a);
            var t2 = self.getMahjongType(b);
            if (t1 != t2) {
              if (dingque == t1) return 1;
              if (dingque == t2) return -1;
            }
          }
          return a - b;
        });
      },
      getSide: function getSide(localIndex) {
        return this._sides[localIndex];
      },
      getPre: function getPre(localIndex) {
        return this._pres[localIndex];
      },
      getFoldPre: function getFoldPre(localIndex) {
        return this._foldPres[localIndex];
      }
    });
    cc._RF.pop();
  }, {} ],
  Setting: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6a0fbUIvs9N64QfYQsH2Pec", "Setting");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        effectSlider: cc.Slider,
        musicSlider: cc.Slider
      },
      onLoad: function onLoad() {},
      onEnable: function onEnable() {
        var bgm = cc.sys.localStorage.getItem("bgmVolume");
        if (bgm) {
          th.audioManager.setBGMVolume(parseFloat(bgm));
          this.musicSlider.progress = parseFloat(bgm);
        }
        var sfx = cc.sys.localStorage.getItem("sfxVolume");
        if (sfx) {
          th.audioManager.setSFXVolume(parseFloat(sfx));
          this.effectSlider.progress = parseFloat(sfx);
        }
        cc.log("bgm:", bgm, "sfx:", sfx);
      },
      onCloseClicked: function onCloseClicked() {
        this.node.active = false;
      },
      onEffectSlide: function onEffectSlide(target) {
        th.audioManager.setSFXVolume(target.progress);
      },
      onMusicSlide: function onMusicSlide(target) {
        th.audioManager.setBGMVolume(target.progress);
      }
    });
    cc._RF.pop();
  }, {} ],
  Share: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "efe8dBa3UxKZYMdnH1aK9lw", "Share");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        btnShareFriend: cc.Button,
        btnShareWechat: cc.Button,
        btnShareClose: cc.Button
      },
      onLoad: function onLoad() {},
      update: function update(dt) {},
      onShareFriendClicked: function onShareFriendClicked() {
        this.node.active = false;
        th.anysdkManager.shareWebpage(th.appInfo.appWeb, th.appInfo.shareTitle, th.appInfo.shareDesc, false);
      },
      onShareWechatClicked: function onShareWechatClicked() {
        this.node.active = false;
        th.anysdkManager.shareWebpage(th.appInfo.appWeb, th.appInfo.shareTitle, th.appInfo.shareDesc, true);
      },
      onShareCloseClicked: function onShareCloseClicked() {
        cc.log("onShareCloseClicked");
        this.node.active = false;
      }
    });
    cc._RF.pop();
  }, {} ],
  SocketIOManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f3060chRz9FU6rQ3OvSu7my", "SocketIOManager");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        dataEventHandler: null,
        isRepeatLogin: false,
        roomId: null,
        config: null,
        seats: null,
        round: null,
        creator: null,
        chupai: null,
        caishen: null,
        seatIndex: -1,
        bankerIndex: -1,
        turn: -1,
        mjsy: 0,
        needCheckIp: false,
        status: "idle",
        actions: null,
        isOver: false
      },
      onLoad: function onLoad() {},
      resetGame: function resetGame() {
        this.resetRound();
        th.userManager.roomId = null;
        this.isRepeatLogin = false;
        this.config = null;
        this.seats = null;
        this.creator = null;
        this.isOver = true, this.seatIndex = -1;
      },
      resetRound: function resetRound() {
        this.chupai = -1;
        this.caishen = null;
        this.bankerIndex = -1;
        this.turn = -1;
        this.mjsy = 0;
        this.needCheckIp = false;
        this.status = "idle";
        this.actions = null;
        for (var i = 0; i < this.seats.length; i++) {
          this.seats[i].holds = [];
          this.seats[i].folds = [];
          this.seats[i].chis = [];
          this.seats[i].pengs = [];
          this.seats[i].angangs = [];
          this.seats[i].diangangs = [];
          this.seats[i].bugangs = [];
          this.seats[i].ready = false;
          this.seats[i].isHu = false;
        }
      },
      dispatchEvent: function dispatchEvent(event, data) {
        this.dataEventHandler && this.dataEventHandler.emit(event, data);
      },
      initHandlers: function initHandlers() {
        var self = this;
        th.sio.addHandler("init_room", function(data) {
          cc.log("==>SocketIOManager init_room:", JSON.stringify(data));
          self.roomId = data.roomId;
          self.config = data.config;
          self.seats = data.seats;
          self.round = data.round;
          self.creator = data.creator;
          self.isRepeatLogin = false;
          self.seatIndex = self.getSeatIndexById(th.userManager.userId);
          self.dispatchEvent("init_room", data);
        });
        th.sio.addHandler("join_push", function(data) {
          cc.log("==>SocketIOManager join_push:", JSON.stringify(data));
          var index = data.index;
          if (self.seats[index].userId) {
            self.seats[index].online = true;
            if (self.seats[index].ip != data.ip) {
              self.seats[index].ip = data.ip;
              self.needCheckIp = true;
            }
          } else {
            self.seats[index] = data;
            self.needCheckIp = true;
          }
          self.dispatchEvent("join_push", self.seats[index]);
          self.needCheckIp && self.dispatchEvent("check_ip", self.seats[index]);
        });
        th.sio.addHandler("leave_result", function(data) {
          self.roomId = null;
          self.resetGame();
        });
        th.sio.addHandler("sync_push", function(data) {
          cc.log("==>SocketIOManager sync_push:", JSON.stringify(data));
          self.mjsy = data.mjsy;
          self.status = data.status;
          self.turn = data.turn;
          self.bankerIndex = data.bankerIndex;
          self.chupai = data.chupai;
          self.caishen = data.caishen;
          for (var i = 0; i < data.seats.length; i++) {
            var seat = self.seats[i];
            var sd = data.seats[i];
            seat.holds = sd.holds;
            seat.folds = sd.folds;
            seat.angangs = sd.angangs;
            seat.diangangs = sd.diangangs;
            seat.bugangs = sd.bugangs;
            seat.pengs = sd.pengs;
            seat.chis = sd.chis;
            seat.ready = sd.ready;
          }
          self.dispatchEvent("sync_push");
          self.dispatchEvent("mjsy_push");
          self.dispatchEvent("caishen_push");
        });
        th.sio.addHandler("leave_push", function(data) {
          cc.log("==>SocketIOManager leave_push:", JSON.stringify(data));
          var userId = data.userId;
          var seat = self.getSeatByUserId(userId);
          cc.log("leave:", seat);
          if (seat) {
            seat.userId = null;
            seat.name = null;
            seat.headImgUrl = null;
            seat.sex = null;
            seat.score = 0;
            seat.ready = false;
            seat.online = false;
          }
          self.dispatchEvent("leave_push", seat);
        });
        th.sio.addHandler("dissolve_push", function(data) {
          self.roomId = null;
          self.resetGame();
          cc.log("==>SocketIOManager dissolve_push:", JSON.stringify(data));
        });
        th.sio.addHandler("offline_push", function(data) {
          cc.log("==>SocketIOManager offline_push:", JSON.stringify(data));
          null == self.roomId || self.isOver || self.dispatchEvent("offline_push", data);
        });
        th.sio.addHandler("online_push", function(data) {
          cc.log("==>SocketIOManager online_push:", JSON.stringify(data));
          self.dispatchEvent("online_push", data);
        });
        th.sio.addHandler("ready_result", function(data) {
          cc.log("==>SocketIOManager ready_result:", JSON.stringify(data));
          var seat = self.getSeatByUserId(th.userManager.userId);
          seat.ready = true;
          self.dispatchEvent("ready_result", seat);
        });
        th.sio.addHandler("ready_push", function(data) {
          cc.log("==>SocketIOManager ready_push:", JSON.stringify(data));
          var seat = self.getSeatByUserId(data.userId);
          seat.ready = true;
          self.dispatchEvent("ready_push", seat);
        });
        th.sio.addHandler("holds_push", function(data) {
          cc.log("==>SocketIOManager holds_push:", JSON.stringify(data));
          var seat = self.seats[self.seatIndex];
          seat.holds = data;
          for (var i = 0; i < self.seats.length; ++i) {
            var s = self.seats[i];
            null == s.folds && (s.folds = []);
            null == s.angangs && (s.angangs = []);
            null == s.diangangs && (s.diangangs = []);
            null == s.bugangs && (s.bugangs = []);
            null == s.pengs && (s.pengs = []);
            null == s.chis && (s.chis = []);
            s.ready = false;
          }
          self.dispatchEvent("holds_push");
        });
        th.sio.addHandler("mjsy_push", function(data) {
          cc.log("==>SocketIOManager mjsy_push:", data);
          self.mjsy = data;
          self.dispatchEvent("mjsy_push");
        });
        th.sio.addHandler("round_push", function(data) {
          cc.log("==>SocketIOManager round_push:", data);
          self.round = data;
          self.dispatchEvent("round_push");
        });
        th.sio.addHandler("caishen_push", function(data) {
          cc.log("==>SocketIOManager caishen_push:", data);
          self.caishen = data;
          self.dispatchEvent("caishen_push");
        });
        th.sio.addHandler("begin_push", function(data) {
          cc.log("==>SocketIOManager begin_push:", data);
          self.bankerIndex = data;
          self.turn = self.bankerIndex;
          self.status = "begin";
          self.dispatchEvent("begin_push");
        });
        th.sio.addHandler("chupai_push", function(data) {
          cc.log("==>SocketIOManager chupai_push:", JSON.stringify(data));
          var turnUserId = data;
          var seatIndex = self.getSeatIndexById(turnUserId);
          self.doTurnChange(seatIndex);
        });
        th.sio.addHandler("action_push", function(data) {
          cc.log("==>SocketIOManager action_push:", JSON.stringify(data));
          self.actions = data;
          self.dispatchEvent("action_push", data);
        });
        th.sio.addHandler("guo_result", function(data) {
          self.dispatchEvent("guo_result");
        });
        th.sio.addHandler("guo_notify_push", function(data) {
          var userId = data.userId;
          var pai = data.pai;
          var seatIndex = self.getSeatIndexById(userId);
          self.doGuo(seatIndex, data.pai);
        });
        th.sio.addHandler("chi_notify_push", function(data) {
          var userId = data.userId;
          var pai = data.pai;
          var seatIndex = self.getSeatIndexById(userId);
          self.doChi(seatIndex, data.info, pai);
        });
        th.sio.addHandler("peng_notify_push", function(data) {
          var userId = data.userId;
          var pai = data.pai;
          var seatIndex = self.getSeatIndexById(userId);
          self.doPeng(seatIndex, data.info);
        });
        th.sio.addHandler("hangang_notify_push", function(data) {
          self.dispatchEvent("hangang_notify_push", data);
        });
        th.sio.addHandler("gang_notify_push", function(data) {
          cc.log("socketIOManager gang_notify_push:", data);
          var userId = data.userId;
          var pai = data.pai;
          var seatIndex = self.getSeatIndexById(userId);
          self.doGang(seatIndex, data.info, data.gangType);
        });
        th.sio.addHandler("chupai_notify_push", function(data) {
          var userId = data.userId;
          var pai = data.pai;
          var seatIndex = self.getSeatIndexById(userId);
          self.doChupai(seatIndex, pai);
        });
        th.sio.addHandler("mopai_push", function(data) {
          self.doMopai(self.seatIndex, data);
        });
        th.sio.addHandler("hu_push", function(data) {
          cc.log("socketIOManager hu_push:", data);
          self.doHu(data);
        });
        th.sio.addHandler("hu_notify_push", function(data) {
          self.doHu(data);
        });
        th.sio.addHandler("game_over_push", function(data) {
          var results = data.results;
          for (var i = 0; i < self.seats.length; i++) self.seats[i].score = 0 == results.length ? 0 : results[i].totalScore;
          for (var i = 0; i < self.seats.length; ++i) self.dispatchEvent("score_push", self.seats[i]);
          self.dispatchEvent("game_over", results);
          if (data.endInfo) {
            self.isOver = true;
            self.dispatchEvent("game_end", data.endInfo);
            self.resetGame();
          } else {
            self.resetRound();
            self.dispatchEvent("clean_push");
          }
        });
        th.sio.addHandler("repeat_login", function(data) {
          self.resetGame();
          self.isRepeatLogin = true;
          self.dispatchEvent("repeat_login");
        });
        th.sio.addHandler("disconnect", function(data) {
          if (self.isRepeatLogin) {
            cc.log("disconnect==>>self.isRepeatLogin");
            self.isRepeatLogin = true;
            th.alert.show("提示", "您的账号已在别处登录！", function() {
              th.wc.show("正在返回登录场景");
              cc.director.loadScene("login");
            }, false);
          } else if (null == self.roomId) {
            cc.log("disconnect==>>self.roomId == null");
            th.userManager.roomId = null;
            th.wc.show("正在返回游戏大厅");
            cc.director.loadScene("hall");
          } else if (false == self.isOver) {
            cc.log("disconnect==>>self.isOver == false");
            th.userManager.roomId = self.roomId;
            self.dispatchEvent("disconnect");
          } else {
            th.userManager.roomId = null;
            self.roomId = null;
            self.config = null;
            self.seats = null;
            self.round = null;
            self.seatIndex = -1;
          }
        });
      },
      getGangType: function getGangType(seatData, pai) {
        var idx = -1;
        for (var i = 0; i < seatData.pengs.length; i++) if (seatData.pengs[i].mjid == pai) {
          idx = i;
          break;
        }
        if (-1 != idx) return "bugang";
        var cnt = 0;
        for (var i = 0; i < seatData.holds.length; ++i) seatData.holds[i] == pai && cnt++;
        return 3 == cnt ? "diangang" : "angang";
      },
      doGuo: function doGuo(seatIndex, pai) {
        var seatData = this.seats[seatIndex];
        var folds = seatData.folds;
        folds.push(pai.mjid);
        this.dispatchEvent("guo_notify_push", seatData);
      },
      doChi: function doChi(seatIndex, info, pai) {
        var seatData = this.seats[seatIndex];
        if (seatData.holds) for (var i = 0; i < info.mjids.length; ++i) {
          if (info.mjids[i] == pai) continue;
          var idx = seatData.holds.indexOf(info.mjids[i]);
          seatData.holds.splice(idx, 1);
        }
        var chis = seatData.chis;
        chis.push(info);
        this.dispatchEvent("chi_notify_push", seatData);
      },
      doPeng: function doPeng(seatIndex, info) {
        var seatData = this.seats[seatIndex];
        if (seatData.holds) for (var i = 0; i < 2; ++i) {
          var idx = seatData.holds.indexOf(info.mjid);
          seatData.holds.splice(idx, 1);
        }
        var pengs = seatData.pengs;
        pengs.push(info);
        this.dispatchEvent("peng_notify_push", seatData);
      },
      doGang: function doGang(seatIndex, info, gangType) {
        cc.log("gangType", gangType, " info:", info);
        var seatData = this.seats[seatIndex];
        var pai = info.mjid;
        gangType || (gangType = this.getGangType(seatData, pai));
        if ("bugang" == gangType) {
          var idx = -1;
          for (var i = 0; i < seatData.pengs.length; i++) if (seatData.pengs[i].mjid == pai) {
            idx = i;
            break;
          }
          -1 != idx && seatData.pengs.splice(idx, 1);
          seatData.bugangs.push(info);
        }
        if (seatData.holds) for (var i = 0; i <= 4; ++i) {
          var idx = seatData.holds.indexOf(pai);
          if (-1 == idx) break;
          seatData.holds.splice(idx, 1);
        }
        "angang" == gangType ? seatData.angangs.push(info) : "diangang" == gangType && seatData.diangangs.push(info);
        this.dispatchEvent("gang_notify_push", seatData);
      },
      doChupai: function doChupai(seatIndex, pai) {
        this.chupai = pai;
        var seatData = this.seats[seatIndex];
        if (seatData.holds) {
          var idx = seatData.holds.indexOf(pai);
          seatData.holds.splice(idx, 1);
        }
        this.dispatchEvent("chupai_notify_push", {
          seatData: seatData,
          pai: pai
        });
      },
      doMopai: function doMopai(seatIndex, pai) {
        var seatData = this.seats[seatIndex];
        if (seatData.holds) {
          seatData.holds.push(pai);
          this.dispatchEvent("mopai_push", {
            seatIndex: seatIndex,
            pai: pai
          });
        }
      },
      doHu: function doHu(data) {
        this.dispatchEvent("hu_push", data);
      },
      doTurnChange: function doTurnChange(seatIndex) {
        var data = {
          last: this.turn,
          turn: seatIndex
        };
        this.turn = seatIndex;
        this.dispatchEvent("chupai_push", data);
      },
      getSeatIndexById: function getSeatIndexById(userId) {
        for (var i = 0; i < this.seats.length; i++) if (this.seats[i].userId == parseInt(userId)) return i;
        return -1;
      },
      getLocalIndex: function getLocalIndex(index) {
        var total = this.seats.length;
        var ret = (index - this.seatIndex + total) % total;
        return ret;
      },
      getSeatByUserId: function getSeatByUserId(userId) {
        var index = this.getSeatIndexById(userId);
        var seat = this.seats[index];
        return seat;
      },
      getWanfa: function getWanfa() {
        var str = [];
        str.push("封顶");
        str.push(this.config.fengding);
        str.push("，");
        str.push(this.config.difen);
        str.push("分，");
        str.push("QZ" == this.config.zuozhuang ? "抢庄" : "轮庄");
        str.push("，");
        str.push("FZ" == this.config.payment ? "房主付" : "AA付");
        str.push(this.config.ctdsq ? "，吃吐荡三圈" : "");
        return str.join("");
      },
      getRoomInfo: function getRoomInfo() {
        var str = [];
        str.push("房间号：");
        str.push(this.roomId);
        str.push(" 局数：");
        str.push(this.config.round);
        str.push(" 房间规则：");
        str.push(this.getWanfa());
        return str.join("");
      },
      isFangzhu: function isFangzhu() {
        return this.creator == th.userManager.userId;
      },
      isReady: function isReady(userId) {
        var seat = this.getSeatByUserId(userId);
        return seat.ready;
      },
      connectServer: function connectServer(data) {
        var self = this;
        var onConnectSuccess = function onConnectSuccess() {
          cc.director.loadScene("mjgame", function() {
            th.sio.ping();
            th.wc.hide();
            self.dispatchEvent("connect_success");
          });
        };
        var onConnectError = function onConnectError(err) {
          th.wc.hide();
          th.alert.show("提示", err, null, false);
        };
        th.sio.ip = data.ip;
        th.sio.port = data.port;
        th.sio.addr = "ws://" + data.ip + ":" + data.port + "?roomId=" + data.roomId + "&token=" + data.token + "&sign=" + data.sign + "&time=" + data.time;
        th.sio.connect(onConnectSuccess, onConnectError);
      }
    });
    cc._RF.pop();
  }, {} ],
  SocketIO: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1e1fa6Pq4tHoqqg23GKLerB", "SocketIO");
    "use strict";
    var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    var SIO = cc.Class({
      extends: cc.Component,
      statics: {
        ip: null,
        port: null,
        addr: null,
        sio: null,
        handlers: {},
        fnDisconnect: null,
        isPinging: false,
        lastSendTime: 0,
        lastRecieveTime: 0,
        delay: 0,
        addHandler: function addHandler(event, fn) {
          if (this.handlers[event]) {
            cc.log("event:" + event + "' handler has been registered.");
            return;
          }
          var handler = function handler(data) {
            "disconnect" != event && "string" == typeof data && (data = JSON.parse(data));
            fn(data);
          };
          this.handlers[event] = handler;
          if (this.sio) {
            cc.log("register event: " + event);
            this.sio.on(event, handler);
          }
        },
        connect: function connect(fnConnect, fnError) {
          var self = this;
          cc.log("connect to : " + this.addr);
          var opts = {
            reconnection: false,
            "force new connection": true,
            transports: [ "websocket", "polling" ]
          };
          this.sio = window.io.connect(this.addr, opts);
          this.sio.on("connect", function(data) {
            self.sio.connected = true;
            fnConnect(data);
          });
          this.sio.on("disconnect", function(data) {
            cc.log("disconnect");
            self.sio.connected = false;
            self.close();
          });
          this.sio.on("reconnect", function() {
            cc.log("reconnect");
          });
          this.sio.on("connect_error", function() {
            cc.log("connect_error");
          });
          this.sio.on("connect_timeout", function(timeout) {
            cc.log("connect_timeout");
          });
          this.sio.on("reconnect_error", function(error) {
            cc.log("reconnect_error");
          });
          this.sio.on("reconnect_failed", function(error) {
            cc.log("reconnect_failed");
          });
          this.sio.on("error", function(error) {
            cc.log("error");
            fnError(error);
          });
          for (var key in this.handlers) {
            var handler = this.handlers[key];
            if ("function" == typeof handler) if ("disconnect" == key) this.fnDisconnect = handler; else {
              cc.log("register event: " + key);
              this.sio.on(key, handler);
            }
          }
          this.heartbeat();
        },
        heartbeat: function heartbeat() {
          var self = this;
          this.lastRecieveTime = Date.now();
          this.sio.on("th-pong", function() {
            cc.log("th-pong");
            self.lastRecieveTime = Date.now();
            self.delay = self.lastRecieveTime - self.lastSendTime;
          });
          if (!self.isPinging) {
            self.isPinging = true;
            cc.game.on(cc.game.EVENT_HIDE, function() {
              self.ping();
            });
            setInterval(function() {
              self.sio && self.ping();
            }.bind(this), 5e3);
            setInterval(function() {
              self.sio && Date.now() - self.lastRecieveTime > 1e4 && self.close();
            }.bind(this), 500);
          }
        },
        close: function close() {
          if (this.sio && this.sio.connected) {
            this.sio.connected = false;
            this.sio.disconnect();
          }
          this.sio = null;
          if (this.fnDisconnect) {
            this.fnDisconnect();
            this.fnDisconnect = null;
          }
        },
        send: function send(event, data) {
          if (this.sio && this.sio.connected) {
            data && "object" == ("undefined" === typeof data ? "undefined" : _typeof(data)) && data == JSON.stringify(data);
            this.sio.emit(event, data);
          }
        },
        ping: function ping() {
          if (this.sio) {
            this.lastSendTime = Date.now();
            this.send("th-ping");
          }
        },
        test: function test(fnResult) {
          var params = {
            account: th.userManager.account,
            sign: th.userManager.sign,
            ip: this.ip,
            port: this.port
          };
          cc.log("test:", params, this.addr);
          th.http.get("/is_server_online", params, function(err, data) {
            cc.log(data);
            fnResult(err, data);
          });
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  UserManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c6fb334U8hIn79b0A8Adc+k", "UserManager");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        userId: null,
        userName: null,
        account: null,
        sex: null,
        headImgUrl: null,
        balance: 0,
        ip: null,
        sign: null,
        roomId: null
      },
      onLoad: function onLoad() {},
      lingshiAuth: function lingshiAuth(account) {
        var self = this;
        th.http.get("/lingshi_auth", {
          account: account
        }, self.onAuth);
      },
      onAuth: function onAuth(err, data) {
        th.wc.hide();
        if (err) {
          cc.err("onAuth", err);
          th.alert.show("提示", "验证微信错误！", null, false);
          return;
        }
        var self = th.userManager;
        self.account = data.account;
        self.sign = data.sign;
        th.http.baseURL = "http://" + data.hallAddr;
        cc.log(th.http.baseURL);
        th.wc.show("正在获取玩家数据...");
        self.login();
      },
      login: function login() {
        var self = this;
        var callback = function callback(err, data) {
          th.wc.hide();
          if (err || data.errcode) {
            cc.log(err, data.errmsg);
            th.alert.show("提示", "玩家数据出错！", null, false);
            return;
          }
          self.sex = data.sex;
          self.userId = data.id;
          self.account = data.account;
          self.balance = data.balance;
          self.userName = data.name;
          self.headImgUrl = data.headImgUrl;
          self.roomId = data.roomId;
          th.wc.show("正在进入大厅...");
          cc.director.loadScene("hall", function() {
            th.wc.hide();
          });
        };
        th.http.get("/login", {
          account: self.account,
          sign: self.sign
        }, callback);
      },
      logout: function logout() {
        th.wc.show("正在退出房间");
        var self = this;
        cc.director.loadScene("login", function() {
          self.sex = null;
          self.userId = null;
          self.account = null;
          self.balance = null;
          self.userName = null;
          self.headImgUrl = null;
          self.roomId = null;
          th.wc.hide();
        });
      },
      createRoom: function createRoom(config) {
        var fnCreate = function fnCreate(err, data) {
          if (err || data.errcode) {
            th.wc.hide();
            th.alert.show("提示", data.errmsg, null, false);
          } else {
            cc.log("create room data:" + JSON.stringify(data));
            th.wc.show("正在进入房间");
            th.socketIOManager.connectServer(data);
          }
        };
        var params = {
          account: th.userManager.account,
          sign: th.userManager.sign,
          config: JSON.stringify(config)
        };
        th.wc.show("正在创建房间");
        th.http.get("/create_private_room", params, fnCreate);
      },
      joinRoom: function joinRoom(roomId, callback) {
        var self = this;
        var fnJoin = function fnJoin(err, data) {
          if (err || data.errcode) {
            th.wc.hide();
            null != callback && callback(data);
          } else {
            cc.log("join room data:" + JSON.stringify(data));
            null != callback && callback(data);
            th.socketIOManager.connectServer(data);
          }
        };
        var params = {
          account: th.userManager.account,
          sign: th.userManager.sign,
          roomId: roomId
        };
        th.wc.show("正在加入房间");
        th.http.get("/join_private_room", params, fnJoin);
      }
    });
    cc._RF.pop();
  }, {} ],
  Utils: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b73c4UBdqFO/bi0FH4AbkeD", "Utils");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      addClickEvent: function addClickEvent(node, target, component, handler) {
        cc.log(component + ":" + handler);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
      },
      addSlideEvent: function addSlideEvent(node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
      },
      addEscEvent: function addEscEvent(node) {
        cc.eventManager.addListener({
          event: cc.EventListener.KEYBOARD,
          onKeyPressed: function onKeyPressed(keyCode, event) {},
          onKeyReleased: function onKeyReleased(keyCode, event) {
            keyCode == cc.KEY.back && cc.vv.alert.show("提示", "确定要退出游戏吗？", function() {
              cc.game.end();
            }, true);
          }
        }, node);
      }
    });
    cc._RF.pop();
  }, {} ],
  WaitingConnection: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c9213QZp3ROI7Fd7AOxsnlH", "WaitingConnection");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        target: cc.Node,
        lblContent: cc.Label
      },
      onLoad: function onLoad() {
        cc.log("WaitingConnection====>onload");
        if (null == th) return null;
        th.wc = this;
        this.node.active = false;
      },
      update: function update(dt) {
        this.target.rotation = this.target.rotation - 90 * dt;
      },
      show: function show(content) {
        this.node && (this.node.active = true);
        this.lblContent && (this.lblContent.string = content || "");
      },
      hide: function hide() {
        this.node && (this.node.active = false);
      },
      onDestory: function onDestory() {
        th && (th.wc = null);
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "AnysdkManager", "AudioManager", "Http", "SocketIO", "SocketIOManager", "UserManager", "Utils", "Alert", "AppStart", "GameScrollBar", "Hall", "JoinRoom", "MJChiPengGangs", "MJCreateRoom", "MJFolds", "MJGame", "MJGameOver", "MJGameResult", "MJReConnect", "MJRoom", "MJSeat", "MJStatus", "MJTimePointer", "MahjongManger", "Setting", "Share", "WaitingConnection" ]);