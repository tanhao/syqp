require = function o(s, c, h) {
function r(n, e) {
if (!c[n]) {
if (!s[n]) {
var t = "function" == typeof require && require;
if (!e && t) return t(n, !0);
if (l) return l(n, !0);
var i = new Error("Cannot find module '" + n + "'");
throw i.code = "MODULE_NOT_FOUND", i;
}
var a = c[n] = {
exports: {}
};
s[n][0].call(a.exports, function(e) {
var t = s[n][1][e];
return r(t || e);
}, a, a.exports, o, s, c, h);
}
return c[n].exports;
}
for (var l = "function" == typeof require && require, e = 0; e < h.length; e++) r(h[e]);
return r;
}({
Alert: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "01a0eYD3wVLrLra9sMACvXk", "Alert");
cc.Class({
extends: cc.Component,
properties: {
btnConfirm: cc.Button,
btnCancel: cc.Button,
title: cc.Label,
content: cc.Label,
_fnConfirm: null
},
onLoad: function() {
cc.log("Alert====>onload");
if (null == th) return null;
(th.alert = this).node.active = !1;
this._fnConfirm = null;
},
show: function(e, t, n, i) {
cc.log("showBtnCancel:" + i);
this.node && (this.node.active = !0);
this.title && (this.title.string = e || "");
this.content && (this.content.string = t || "");
this._fnConfirm = n;
if (i) {
this.btnCancel.node.active = !0;
this.btnCancel.node.x = 160;
this.btnConfirm.node.x = -160;
} else {
this.btnCancel.node.active = !1;
this.btnConfirm.node.x = 0;
}
},
onCancelClicked: function() {
this.node.active = !1;
},
onConfirmClicked: function() {
this.node.active = !1;
this._fnConfirm && this._fnConfirm();
},
hide: function() {
this.node && (this.node.active = !1);
},
onDestory: function() {
th && (th.alert = null);
}
});
cc._RF.pop();
}, {} ],
AnysdkManager: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "38eefl+wMxId5kHf1PxI2t5", "AnysdkManager");
cc.Class({
extends: cc.Component,
properties: {},
onLoad: function() {},
init: function() {
this.ANDROID_API = "org/cocos2dx/javascript/AppActivity";
this.IOS_API = "AppController";
},
getBatteryPercent: function() {
if (cc.sys.isNative) {
if (cc.sys.os == cc.sys.OS_ANDROID) return jsb.reflection.callStaticMethod(this.ANDROID_API, "getBatteryPercent", "()F");
if (cc.sys.os == cc.sys.OS_IOS) return jsb.reflection.callStaticMethod(this.IOS_API, "getBatteryPercent");
}
return .9;
},
login: function() {
cc.log("Login==>>");
if (cc.sys.os == cc.sys.OS_ANDROID) {
cc.log("Login ANDROID==>>" + this.ANDROID_API);
var e = jsb.reflection.callStaticMethod(this.ANDROID_API, "login", "()V");
cc.log("result", e);
} else if (cc.sys.os == cc.sys.OS_IOS) {
cc.log("Login IOS==>>" + this.IOS_API);
jsb.reflection.callStaticMethod(this.IOS_API, "login");
} else cc.log("platform:" + cc.sys.os + " dosn't implement share.");
},
shareWebpage: function(e, t, n, i) {
cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod(this.ANDROID_API, "shareWebpage", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V", e, t, n, i) : cc.sys.os == cc.sys.OS_IOS ? jsb.reflection.callStaticMethod(this.IOS_API, "shareWebpage:shareTitle:shareDesc:isTimelineCb:", e, t, n, i) : cc.log("platform:" + cc.sys.os + " dosn't implement share.");
},
shareCaptureScreen: function(n) {
if (!this._isCapturing) {
this._isCapturing = !0;
var i = cc.director.getWinSize(), e = (new Date(), "result_share.jpg"), a = jsb.fileUtils.getWritablePath() + e;
jsb.fileUtils.isFileExist(a) && jsb.fileUtils.removeFile(a);
var t = new cc.RenderTexture(Math.floor(i.width), Math.floor(i.height));
t.setPosition(cc.p(i.width / 2, i.height / 2));
t.begin();
cc.director.getRunningScene().visit();
t.end();
t.saveToFile(e, cc.IMAGE_FORMAT_JPG);
var o = this, s = 0;
setTimeout(function e() {
if (jsb.fileUtils.isFileExist(a)) {
var t = 100 / i.height;
Math.floor(i.width * t);
cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod(o.ANDROID_API, "shareImage", "(Ljava/lang/String;Z)V", a, n) : cc.sys.os == cc.sys.OS_IOS ? jsb.reflection.callStaticMethod(o.IOS_API, "shareImage:isTimelineCb:", a, n) : cc.log("platform:" + cc.sys.os + " dosn't implement share.");
o._isCapturing = !1;
} else {
if (10 < ++s) {
cc.log("time out...");
return;
}
setTimeout(e, 50);
}
}, 50);
}
},
onLoginResp: function(e) {
th.http.get("/wechat_auth", {
code: e,
os: cc.sys.os
}, function(e) {
if (0 == e.errcode) {
cc.sys.localStorage.setItem("wx_account", e.account);
cc.sys.localStorage.setItem("wx_sign", e.sign);
}
th.userManager.onAuth(null, e);
});
}
});
cc._RF.pop();
}, {} ],
AppStart: [ function(c, e, t) {
"use strict";
cc._RF.push(e, "5414cTJwbRHg5YZplKYF1DZ", "AppStart");
cc.Class({
extends: cc.Component,
properties: {
_isAgree: !1
},
onLoad: function() {
cc.log("================>>initManager<<=====================");
(function(e) {
var t = "http://127.0.0.1:9001";
window.th = window.th;
if (window.th) th.http.baseURL = t; else {
window.th = {};
th.http = c("Http");
th.http.baseURL = t;
th.sio = c("SocketIO");
th.sio.h;
var n = c("UserManager");
th.userManager = new n();
var i = c("AnysdkManager");
th.anysdkManager = new i();
var a = c("AudioManager");
th.audioManager = new a();
th.audioManager.init();
var o = c("SocketIOManager");
th.socketIOManager = new o();
th.socketIOManager.initHandlers();
var s = c("Utils");
th.utils = new s();
}
})();
},
start: function() {},
onBtnWeichatClicked: function(e, t) {
if (this._isAgree) {
cc.log("onBtnWeichatClicked");
th.anysdkManager.login();
}
},
onBtnAgreeClicked: function(e) {
this._isAgree = e.isChecked;
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
AudioManager: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "d859bTzzhZK5rmyriLb24GW", "AudioManager");
cc.Class({
extends: cc.Component,
properties: {
bgmVolume: .5,
sfxVolume: .5,
bgmAudioID: -1,
sfxAudioID: -1,
_pauseBgm: !0
},
onLoad: function() {},
init: function() {
var e = cc.sys.localStorage.getItem("bgmVolume");
e ? this.bgmVolume = parseFloat(e) : cc.sys.localStorage.setItem("bgmVolume", this.bgmVolume);
var t = cc.sys.localStorage.getItem("sfxVolume");
t ? this.sfxVolume = parseFloat(t) : cc.sys.localStorage.setItem("sfxVolume", this.sfxVolume);
cc.game.on(cc.game.EVENT_HIDE, function() {
cc.audioEngine.pauseAll();
});
cc.game.on(cc.game.EVENT_SHOW, function() {
cc.audioEngine.resumeAll();
});
},
getUrl: function(e) {
return cc.url.raw("resources/sounds/" + e);
},
playBGM: function(e) {
var t = this.getUrl(e);
0 <= this.bgmAudioID && cc.audioEngine.stop(this.bgmAudioID);
this._pauseBgm = !0;
this.bgmAudioID = cc.audioEngine.play(t, !0, this.bgmVolume);
},
playSFX: function(e) {
var t = this.getUrl(e);
0 < this.sfxVolume && (this.sfxAudioID = cc.audioEngine.play(t, !1, this.sfxVolume));
},
setSFXVolume: function(e) {
if (this.sfxVolume != e) {
cc.sys.localStorage.setItem("sfxVolume", e);
this.sfxVolume = e;
}
},
setBGMVolume: function(e) {
if (0 <= this.bgmAudioID) if (this._pauseBgm && 0 < e) {
this._pauseBgm = !1;
cc.audioEngine.resume(this.bgmAudioID);
} else if (!this._pauseBgm && 0 == e) {
this._pauseBgm = !0;
cc.audioEngine.pause(this.bgmAudioID);
}
if (this.bgmVolume != e) {
cc.sys.localStorage.setItem("bgmVolume", e);
this.bgmVolume = e;
cc.audioEngine.setVolume(this.bgmAudioID, e);
}
},
pauseAll: function() {
cc.audioEngine.pauseAll();
},
resumeAll: function() {
cc.audioEngine.resumeAll();
}
});
cc._RF.pop();
}, {} ],
GameScrollBar: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "a2747akXS9P6L0ATNR/aQ3U", "GameScrollBar");
cc.Class({
extends: cc.Component,
properties: {
_lastPosY: 0,
_isScrollBegan: !1
},
onLoad: function() {},
start: function() {
for (var e = this.node.getComponent(cc.ScrollView).getComponentsInChildren(cc.Button), t = 0; t < e.length; t++) {
var n = Math.abs(0 + 174 * (3 - t)) / 800;
e[t].node.setScale(1 - n);
e[t].node.setColor(3 == t ? cc.color(255, 255, 255) : cc.color(120, 120, 120));
}
},
update: function(e) {},
onGameBarScroll: function(e, t, n) {
var i = parseInt(e.getContentPosition().y);
if (t === cc.ScrollView.EventType.SCROLLING && 1 < Math.abs(i - this._lastPosY)) {
this._lastPosY = i;
var a = e.getComponentsInChildren(cc.Button), o = 174;
h = (h = parseInt((i + o / 2 * (0 < i ? 1 : -1)) / o) + 3) < 0 ? 0 : h > a.length - 1 ? a.length - 1 : h;
for (var s = 0; s < a.length; s++) {
var c = Math.abs(i + (3 - s) * o) / 800;
a[s].node.setScale(1 - c);
a[s].node.setColor(s == h ? cc.color(255, 255, 255) : cc.color(120, 120, 120));
}
} else if (t === cc.ScrollView.EventType.SCROLL_ENDED) {
if (this._isScrollBegan) {
var h;
a = e.getComponentsInChildren(cc.Button), o = 174;
h = (h = parseInt((i + o / 2 * (0 < i ? 1 : -1)) / o) + 3) < 0 ? 0 : h > a.length - 1 ? a.length - 1 : h;
var r = e.getMaxScrollOffset().y;
e.scrollToOffset(cc.p(0, r / 2 + (h - 3) * o), 1);
this._isScrollBegan = !1;
}
} else t === cc.ScrollView.EventType.SCROLL_BEGAN && (this._isScrollBegan = !0);
}
});
cc._RF.pop();
}, {} ],
Hall: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "1b1f4flWSJNdq/hUigajnOJ", "Hall");
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
spriteHead: cc.Sprite,
btnCreateRoom: cc.Button,
btnReturnRoom: cc.Button,
btnJoinRoom: cc.Button
},
onLoad: function() {
this.initUserInfo();
th.audioManager.playBGM("bg_hall.mp3");
},
start: function() {
th.userManager.roomId && th.alert.show("提示", "你已在房间中，是否返回游戏房间？", this.onReturnRoomClicked, !0);
},
initUserInfo: function() {
var i = this;
this.lblId.string = "ID:" + th.userManager.userId;
this.lblName.string = th.userManager.userName;
this.lblBalance.string = th.userManager.balance;
cc.log("Hall th.userManager.roomId:", th.userManager.roomId);
if (th.userManager.roomId) {
this.btnJoinRoom.node.active = !1;
this.btnReturnRoom.node.active = !0;
} else {
this.btnJoinRoom.node.active = !0;
this.btnReturnRoom.node.active = !1;
}
cc.log(th.userManager.headImgUrl);
cc.loader.load({
url: th.userManager.headImgUrl,
type: "jpg"
}, function(e, t) {
if (!e) {
var n = new cc.SpriteFrame(t, cc.Rect(0, 0, t.width, t.height));
i.spriteHead.spriteFrame = n;
i.spriteHead.node.setScale(2 - t.width / 106);
}
});
},
update: function(e) {
var t = this.lblMarquee.node.x;
(t -= 100 * e) + this.lblMarquee.node.width < -250 && (t = 260);
this.lblMarquee.node.x = t;
},
onCreateRoomClicked: function() {
th.userManager.roomId ? th.alert.show("提示", "你已在房间中，是否返回游戏房间？", this.onReturnRoomClicked, !0) : this.createRoomWin.active = !0;
},
onJoinRoomClicked: function() {
this.joinRoomWin.active = !0;
},
onReturnRoomClicked: function() {
th.wc.show("正在返回游戏房间");
th.userManager.joinRoom(th.userManager.roomId, function(e) {
0 != e.errcode && th.alert.show("提示", e.errmsg, null, !1);
}.bind(this));
},
onLogoutClicked: function() {
th.wc.show("正在退出游戏房间");
th.userManager.logout();
},
onSettingClicked: function() {
this.settingWin.active = !0;
}
});
cc._RF.pop();
}, {} ],
Http: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "904ffIoZYNMnaB5ix5gAedT", "Http");
var c = cc.Class({
extends: cc.Component,
statics: {
baseURL: null,
get: function(e, t, n) {
var i = cc.loader.getXMLHttpRequest(), a = "?";
for (var o in t) {
"?" != a && (a += "&");
a += o + "=" + t[o];
}
var s = c.baseURL + e + encodeURI(a);
i.open("GET", s, !0);
i.onreadystatechange = function() {
if (4 == i.readyState && 200 <= i.status && i.status < 400) try {
cc.log("try => http response:" + i.responseText);
var e = JSON.parse(i.responseText);
n(null, e);
} catch (e) {
n(e, null);
}
};
i.send();
},
post: function(e, t, n) {
var i = cc.loader.getXMLHttpRequest();
i.open("POST", c.baseURL + e);
i.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
i.onreadystatechange = function() {
if (4 == i.readyState && 200 <= i.status && i.status <= 207) try {
var e = JSON.parse(i.responseText);
n(null, e);
} catch (e) {
n(e, null);
}
};
i.send(t);
}
}
});
cc._RF.pop();
}, {} ],
JoinRoom: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "89ec8TY4OVDEL5X/J8nkwft", "JoinRoom");
cc.Class({
extends: cc.Component,
properties: {
nums: {
default: [],
type: [ cc.Label ]
},
_inputIndex: 0
},
onLoad: function() {},
onEnable: function() {
this.onResetClicked();
},
onResetClicked: function() {
for (var e = 0; e < this.nums.length; ++e) this.nums[e].string = "";
this._inputIndex = 0;
},
onDelClicked: function() {
if (0 < this._inputIndex) {
this._inputIndex -= 1;
this.nums[this._inputIndex].string = "";
}
},
onCloseClicked: function() {
this.node.active = !1;
},
parseRoomID: function() {
for (var e = "", t = 0; t < this.nums.length; ++t) e += this.nums[t].string;
return parseInt(e);
},
onInput: function(e, t) {
if (!(this._inputIndex >= this.nums.length)) {
this.nums[this._inputIndex].string = t;
this._inputIndex += 1;
if (this._inputIndex == this.nums.length) {
var n = this.parseRoomID();
cc.log("ok:" + n);
this.onInputFinished(n);
}
}
},
onInputFinished: function(e) {
th.userManager.joinRoom(e, function(e) {
if (0 == e.errcode) this.node.active = !1; else {
th.alert.show("提示", e.errmsg, null, !1);
this.onResetClicked();
}
}.bind(this));
}
});
cc._RF.pop();
}, {} ],
MJChiPengGangs: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "0b065EljOlPxbmdDzwTjWvK", "MJChiPengGangs");
cc.Class({
extends: cc.Component,
properties: {},
onLoad: function() {
if (null != th) {
var t = this, e = this.node.getChildByName("myself").getChildByName("ChiPengGang"), n = cc.director.getVisibleSize().width / 1280;
e.scaleX *= n;
e.scaleY *= n;
this.node.on("chi_notify_push", function(e) {
cc.log("==>ChiPengGang chi_notify_push", e.detail);
e = e.detail;
t.onChiPengGangChanged(e);
});
this.node.on("peng_notify_push", function(e) {
cc.log("==>ChiPengGang peng_notify_push", e.detail);
e = e.detail;
t.onChiPengGangChanged(e);
});
this.node.on("gang_notify_push", function(e) {
cc.log("==>ChiPengGang gang_notify_push", e.detail);
t.onChiPengGangChanged(e.detail);
});
this.node.on("begin_push", function(e) {
t.onGameBegin();
});
this.node.on("clean_push", function() {
t.onGameBegin();
});
var i = th.socketIOManager.seats;
for (var a in i) this.onChiPengGangChanged(i[a]);
}
},
onGameBegin: function() {
this.hideSide("myself");
this.hideSide("right");
this.hideSide("up");
this.hideSide("left");
},
hideSide: function(e) {
var t = this.node.getChildByName(e).getChildByName("ChiPengGang");
if (t) for (var n = 0; n < t.childrenCount; ++n) t.children[n].active = !1;
},
onChiPengGangChanged: function(e) {
if (null != e.pengs || null != e.angangs || null != e.diangangs || null != e.bugangs || null != e.chis) {
for (var t = th.socketIOManager.getLocalIndex(e.index), n = th.mahjongManager.getSide(t), i = th.mahjongManager.getFoldPre(t), a = this.node.getChildByName(n).getChildByName("ChiPengGang"), o = 0; o < a.childrenCount; ++o) a.children[o].active = !1;
var s = 0, c = e.angangs;
for (o = 0; o < c.length; ++o) {
var h = c[o];
this.initChiPengAndGangs(a, n, i, s, h, "angang", e.index);
s++;
}
c = e.diangangs;
for (o = 0; o < c.length; ++o) {
h = c[o];
this.initChiPengAndGangs(a, n, i, s, h, "diangang", e.index);
s++;
}
c = e.bugangs;
for (o = 0; o < c.length; ++o) {
h = c[o];
this.initChiPengAndGangs(a, n, i, s, h, "bugang", e.index);
s++;
}
var r = e.pengs;
if (r) for (o = 0; o < r.length; ++o) {
h = r[o];
this.initChiPengAndGangs(a, n, i, s, h, "peng", e.index);
s++;
}
var l = e.chis;
if (l) for (o = 0; o < l.length; ++o) {
h = l[o];
this.initChiPengAndGangs(a, n, i, s, h, "chi", e.index);
s++;
}
}
},
initChiPengAndGangs: function(e, t, n, i, a, o, s) {
cc.log("initChiPengAndGangs", t, n, i, a, o);
var c = null;
if (e.childrenCount <= i) {
c = "left" == t || "right" == t ? cc.instantiate(th.mahjongManager.pengPrefabLeft) : cc.instantiate(th.mahjongManager.pengPrefabSelf);
e.addChild(c);
} else (c = e.children[i]).active = !0;
if ("left" == t) c.y = -25 * i * 3; else if ("right" == t) {
c.y = 25 * i * 3;
c.setLocalZOrder(-i);
} else c.x = "myself" == t ? 55 * i * 3 + 6 * i : -55 * i * 3 - 4 * i;
var h = c.getComponentsInChildren(cc.Sprite);
if ("angang" == o) for (var r = 0; r < h.length; r++) {
if ("point_left" != (p = h[r]).node.name && "point_dui" != p.node.name && "point_right" != p.node.name) {
p.node.active = !0;
p.spriteFrame = th.mahjongManager.getEmptySpriteFrame(t);
} else p.node.active = !1;
} else if ("diangang" == o || "bugang" == o) {
var l = !1, d = !1, g = !1;
if (this.getUpSeatIndex(s) == a.idx) {
l = !0;
g = d = !1;
} else if (this.getNextSeatIndex(s) == a.idx) {
d = !0;
g = l = !1;
} else {
d = l = !1;
g = !0;
}
for (r = 0; r < h.length; r++) {
if ("point_left" != (p = h[r]).node.name && "point_right" != p.node.name && "point_dui" != p.node.name) {
p.node.active = !0;
p.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(n, a.mjid);
} else {
"point_left" == p.node.name ? p.node.active = l : "point_right" == p.node.name ? p.node.active = d : "point_dui" == p.node.name && (p.node.active = g);
"up" == t ? p.node.y = -53 : "right" == t && (p.node.x = -40);
}
}
} else if ("peng" == o) {
l = !1, d = !1, g = !1;
if (this.getUpSeatIndex(s) == a.idx) {
l = !0;
g = d = !1;
} else if (this.getNextSeatIndex(s) == a.idx) {
d = !0;
g = l = !1;
} else {
d = l = !1;
g = !0;
}
for (r = 0; r < h.length; r++) {
if ("point_left" != (p = h[r]).node.name && "point_right" != p.node.name && "point_dui" != p.node.name) if ("gang" == p.node.name) p.node.active = !1; else {
p.node.active = !0;
p.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(n, a.mjid);
} else {
"point_left" == p.node.name ? p.node.active = l : "point_right" == p.node.name ? p.node.active = d : "point_dui" == p.node.name && (p.node.active = g);
"up" == t ? p.node.y = -53 : "right" == t && (p.node.x = -40);
}
}
} else if ("chi" == o) {
l = !1, d = !1, g = !1;
if (this.getUpSeatIndex(s) == a.idx) {
l = !0;
g = d = !1;
} else if (this.getNextSeatIndex(s) == a.idx) {
d = !0;
g = l = !1;
} else {
d = l = !1;
g = !0;
}
var u = 0;
for (r = 0; r < h.length; r++) {
var p;
if ("point_left" != (p = h[r]).node.name && "point_right" != p.node.name && "point_dui" != p.node.name) if ("gang" == p.node.name) p.node.active = !1; else {
p.node.active = !0;
p.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(n, a.mjids[u]);
u += 1;
} else {
"point_left" == p.node.name ? p.node.active = l : "point_right" == p.node.name ? p.node.active = d : "point_dui" == p.node.name && (p.node.active = g);
"up" == t ? p.node.y = -53 : "right" == t && (p.node.x = -40);
}
}
}
},
getUpSeatIndex: function(e) {
var t = th.socketIOManager.seats.length;
return (e - 1 + t) % t;
},
getNextSeatIndex: function(e) {
var t = th.socketIOManager.seats.length;
return (e + 1 + t) % t;
},
getDuiSeatIndex: function(e) {
var t = th.socketIOManager.seats.length;
return (e + 2 + t) % t;
}
});
cc._RF.pop();
}, {} ],
MJCreateRoom: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "cce92YsEchF14Hs7bYK6yoT", "MJCreateRoom");
cc.Class({
extends: cc.Component,
properties: {
people: 4,
round: 8,
payment: "FZ",
difen: 1,
zuozhuang: "QZ",
fengding: 32,
ctdsq: !1,
lbl8Round: cc.Label,
lbl16Round: cc.Label
},
onLoad: function() {},
onEnable: function() {
cc.log("create_room onEnable");
this.onResetClicked();
},
onResetClicked: function() {
this.people = 4;
this.round = 8;
this.payment = "FZ";
this.difen = 1;
this.zuozhuang = "QZ";
this.fengding = 32;
this.ctdsq = !1;
cc.find("Canvas/create_room_mj/setting_list/people/toggleContainer/toggle1").getComponent(cc.Toggle).check();
cc.find("Canvas/create_room_mj/setting_list/round/toggleContainer/toggle1").getComponent(cc.Toggle).check();
cc.find("Canvas/create_room_mj/setting_list/payment/toggleContainer/toggle1").getComponent(cc.Toggle).check();
cc.find("Canvas/create_room_mj/setting_list/difen/toggleContainer/toggle1").getComponent(cc.Toggle).check();
cc.find("Canvas/create_room_mj/setting_list/zuozhuang/toggleContainer/toggle1").getComponent(cc.Toggle).check();
cc.find("Canvas/create_room_mj/setting_list/fengding/toggleContainer/toggle1").getComponent(cc.Toggle).check();
cc.find("Canvas/create_room_mj/setting_list/options/toggle1").getComponent(cc.Toggle).uncheck();
},
onCloseClicked: function() {
this.node.active = !1;
},
onPeopleClicked: function(e, t) {
this.people = t;
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
onRoundClicked: function(e, t) {
this.round = parseInt(t);
},
onPaymentClicked: function(e, t) {
this.payment = t;
},
onDifenClicked: function(e, t) {
this.difen = t;
},
onZuozhuangClicked: function(e, t) {
this.zuozhuang = t;
},
onFengdingClicked: function(e, t) {
this.fengding = t;
},
onCtdsqClicked: function(e) {
this.ctdsq = e.isChecked;
},
onCreateClicked: function(e) {
this.node.active = !1;
var t = {
people: this.people,
round: this.round,
payment: this.payment,
difen: this.difen,
zuozhuang: this.zuozhuang,
fengding: this.fengding,
ctdsq: this.ctdsq
};
th.userManager.createRoom(t);
}
});
cc._RF.pop();
}, {} ],
MJFolds: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "0fb2fAdDZZMC6puF+qvTjQC", "MJFolds");
cc.Class({
extends: cc.Component,
properties: {
_folds: null
},
onLoad: function() {
if (null != th) {
this.initView();
this.initEventHandler();
this.initAllFolds();
}
},
update: function(e) {},
initView: function() {
this._folds = {};
this._folds.left = [];
this._folds.myself = [];
this._folds.right = [];
this._folds.up = [];
for (var e = [ "myself", "right", "up", "left" ], t = 0; t < e.length; t++) for (var n = e[t], i = this.node.getChildByName(n).getChildByName("Folds"), a = 1; a <= i.children.length; a++) {
var o = i.getChildByName("mj" + a);
o.active = !1;
var s = o.getComponent(cc.Sprite);
s.spriteFrame = null;
this._folds[n].push(s);
}
},
initEventHandler: function() {
var t = this;
this.node.on("begin_push", function(e) {
t.initAllFolds();
});
this.node.on("guo_notify_push", function(e) {
t.initFolds(e.detail);
});
this.node.on("chupai_notify_push", function(e) {
t.initFolds(e.detail.seatData);
});
this.node.on("sync_push", function(e) {
t.initAllFolds();
});
this.node.on("clean_push", function() {
t.initAllFolds();
});
},
hideAllFolds: function() {
for (var e in this._folds) for (var t = this._folds[e], n = 0; n < t.length; n++) t[n].node.active = !1;
},
initAllFolds: function() {
var e = th.socketIOManager.seats;
for (var t in e) this.initFolds(e[t]);
},
initFolds: function(e) {
var t = e.folds;
if (null != t) {
for (var n = th.socketIOManager.getLocalIndex(e.index), i = th.mahjongManager.getFoldPre(n), a = th.mahjongManager.getSide(n), o = this._folds[a], s = 0; s < o.length; ++s) {
(c = o[s]).node.active = !0;
this.setSpriteFrameByMJID(i, c, t[s]);
}
for (s = t.length; s < o.length; ++s) {
var c;
(c = o[s]).spriteFrame = null;
c.node.active = !1;
}
}
},
refreshAllSeat: function() {},
refreshOneSeat: function() {},
setSpriteFrameByMJID: function(e, t, n) {
t.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(e, n);
t.node.active = !0;
}
});
cc._RF.pop();
}, {} ],
MJGameOver: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "16fbctvcdpBSoaziZibs0zj", "MJGameOver");
cc.Class({
extends: cc.Component,
properties: {
_isGameEnd: !1,
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
onLoad: function() {
if (null != th) {
this._nodeGameOver = this.node.getChildByName("game_over");
this._nodeGameResult = this.node.getChildByName("game_result");
this._lblWin = this._nodeGameOver.getChildByName("win");
this._lblLose = this._nodeGameOver.getChildByName("lose");
this._lblLiuju = this._nodeGameOver.getChildByName("liuju");
this._nodeGameOver.getChildByName("wanfa").getComponent(cc.Label).string = th.socketIOManager.getWanfa();
for (var e = this._nodeGameOver.getChildByName("result_list"), t = 1; t <= 4; t++) {
var n = "seat" + t, i = e.getChildByName(n);
this._nodeSeats.push(i);
var a = {};
a.username = i.getChildByName("username").getComponent(cc.Label);
a.winscore = i.getChildByName("winscore").getComponent(cc.Label);
a.losescore = i.getChildByName("losescore").getComponent(cc.Label);
a.reason = i.getChildByName("reason").getComponent(cc.Label);
a.zhuang = i.getChildByName("zhuang");
a.headImg = i.getChildByName("head_clip").getChildByName("head_img").getComponent(cc.Sprite);
a.mahjongs = i.getChildByName("pai");
a.chipenggang = i.getChildByName("chipenggang");
this._seats.push(a);
}
this._btnReady = cc.find("Canvas/game_over/btn_ready");
this._btnReady && th.utils.addClickEvent(this._btnReady, this.node, "MJGameOver", "onBtnReadyClicked");
this._btnConfirm = cc.find("Canvas/game_over/btn_confirm");
this._btnConfirm && th.utils.addClickEvent(this._btnConfirm, this.node, "MJGameOver", "onBtnReadyClicked");
this._btnReady.active = !0;
this._btnConfirm.active = !1;
var o = this;
this.node.on("game_over", function(e) {
o.onGameOver(e.detail);
});
this.node.on("game_end", function(e) {
o._isGameEnd = !0;
o._btnReady.active = !1;
o._btnConfirm.active = !0;
});
}
},
onGameOver: function(e) {
if (0 != e.length) {
this._nodeGameOver.active = !0;
this._lblWin.active = !1;
this._lblLose.active = !1;
this._lblLiuju.active = !1;
var t = e[th.socketIOManager.seatIndex].score;
0 < t ? this._lblWin.active = !0 : t < 0 ? this._lblLose.active = !0 : this._lblLiuju.active = !0;
for (var n = 0; n < 4; n++) if (n > e.length - 1) this._nodeSeats[n].active = !1; else {
this._nodeSeats[n].active = !0;
var i = this._seats[n], a = e[n], o = [];
if (a.isHu) {
var s = a.huInfo, c = s.paixing;
1 == c ? o.push("正规七风13幺") : 2 == c ? o.push("正规13幺") : 3 == c ? o.push("非正规七风13幺") : 4 == c ? o.push("非正规13幺") : 5 == c ? o.push("7对") : 6 == c ? o.push("碰碰胡") : 7 == c ? o.push("平湖") : 8 == c && o.push("三财神");
var h = s.action;
1 == h ? o.push("抢杠胡") : 2 == h ? o.push("杠上花") : 3 == h && o.push("自摸");
s.isDangDiao && o.push("单吊");
s.isSanCaiShen && o.push("三财神");
s.isCaiShenTou && o.push("财神头");
s.isZiYiSe ? o.push("字一色") : s.isQingYiSe ? o.push("清一色") : s.isHunYiSe && o.push("混一色");
}
i.username.string = th.socketIOManager.seats[n].name;
i.reason.string = o.join("、");
i.zhuang.active = th.socketIOManager.bankerIndex == n;
(function(i, e) {
cc.loader.load({
url: e,
type: "jpg"
}, function(e, t) {
if (!e) {
var n = new cc.SpriteFrame(t, cc.Rect(0, 0, t.width, t.height));
i.headImg.spriteFrame = n;
i.headImg.node.setScale(2 - t.width / 94);
}
});
})(i, th.socketIOManager.seats[n].headImgUrl);
if (0 <= a.score) {
i.winscore.string = "+" + a.score;
i.winscore.node.active = !0;
i.losescore.node.active = !1;
} else {
i.losescore.string = a.score;
i.losescore.node.active = !0;
i.winscore.node.active = !1;
}
th.mahjongManager.sortHolds(a.holds);
for (var r = 0; r < i.mahjongs.childrenCount; r++) {
(d = i.mahjongs.children[r]).active = !1;
}
var l = 3 * (a.pengs.length + a.angangs.length + a.diangangs.length + a.bugangs.length + a.chis.length);
a.isHu && a.holds.push(a.huInfo.pai);
for (r = 0; r < a.holds.length; r++) {
var d, g = a.holds[r];
(d = i.mahjongs.children[r + l]).active = !0;
var u = d.getComponent(cc.Sprite);
u.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_", g);
u.node.getChildByName("gold_icon").active = g == th.socketIOManager.caishen;
}
for (r = 0; r < i.chipenggang.childrenCount; r++) i.chipenggang.children[r].active = !1;
var p = 0, f = a.angangs;
for (r = 0; r < f.length; ++r) {
var m = f[r];
this.initChiPengGang(i, p, m, "angang");
p++;
}
for (f = a.diangangs, r = 0; r < f.length; ++r) {
m = f[r];
this.initChiPengGang(i, p, m, "diangang");
p++;
}
for (f = a.bugangs, r = 0; r < f.length; ++r) {
m = f[r];
this.initChiPengGang(i, p, m, "bugang");
p++;
}
var _ = a.pengs;
if (_) for (r = 0; r < _.length; ++r) {
m = _[r];
this.initChiPengGang(i, p, m, "peng");
p++;
}
var v = a.chis;
if (v) for (r = 0; r < v.length; ++r) {
m = v[r];
this.initChiPengGang(i, p, m, "chi");
p++;
}
}
} else this._nodeGameResult.active = !0;
},
initChiPengGang: function(e, t, n, i) {
var a = null;
if (e.chipenggang.childrenCount <= t) {
a = cc.instantiate(th.mahjongManager.pengPrefabSelf);
e.chipenggang.addChild(a);
} else (a = e.chipenggang.children[t]).active = !0;
a.active = !0;
a.x = 55 * t * 3 + 10 * t;
var o = a.getComponentsInChildren(cc.Sprite);
if ("angang" == i) for (var s = 0; s < o.length; s++) {
if ("point_left" == (h = o[s]).node.name || "point_dui" == h.node.name || "point_right" == h.node.name) h.node.active = !1; else if ("gang" == h.node.name) {
h.node.active = !0;
h.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_", n.mjid);
} else {
h.node.active = !0;
h.spriteFrame = th.mahjongManager.getEmptySpriteFrame("myself");
}
} else if ("diangang" == i || "bugang" == i) for (s = 0; s < o.length; s++) {
if ("point_left" == (h = o[s]).node.name || "point_dui" == h.node.name || "point_right" == h.node.name) h.node.active = !1; else {
h.node.active = !0;
h.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_", n.mjid);
}
} else if ("peng" == i) for (s = 0; s < o.length; s++) {
if ("point_left" == (h = o[s]).node.name || "point_dui" == h.node.name || "point_right" == h.node.name) h.node.active = !1; else if ("gang" == h.node.name) h.node.active = !1; else {
h.node.active = !0;
h.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_", n.mjid);
}
} else if ("chi" == i) {
var c = 0;
for (s = 0; s < o.length; s++) {
var h;
if ("point_left" == (h = o[s]).node.name || "point_dui" == h.node.name || "point_right" == h.node.name) h.node.active = !1; else if ("gang" == h.node.name) h.node.active = !1; else {
h.node.active = !0;
h.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_", n.mjids[c]);
c += 1;
}
}
}
},
onBtnReadyClicked: function() {
cc.log("onBtnReadyClicked");
this._isGameEnd ? this._nodeGameResult.active = !0 : th.sio.send("ready");
this._nodeGameOver.active = !1;
},
update: function(e) {}
});
cc._RF.pop();
}, {} ],
MJGameResult: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "2378fc6BVJK4Z7bouhpSItH", "MJGameResult");
cc.Class({
extends: cc.Component,
properties: {
_nodeGameResult: null,
_seats: []
},
onLoad: function() {
if (null != th) {
this._nodeGameResult = this.node.getChildByName("game_result");
var e = this._nodeGameResult.getChildByName("result_list");
this._seats.push(e.getChildByName("seat1"));
this._seats.push(e.getChildByName("seat2"));
this._seats.push(e.getChildByName("seat3"));
this._seats.push(e.getChildByName("seat4"));
var t = cc.find("Canvas/game_result/btn_back_hall");
t && th.utils.addClickEvent(t, this.node, "MJGameResult", "onBtnBackHallClicked");
var n = cc.find("Canvas/game_result/btn_share_result");
n && th.utils.addClickEvent(n, this.node, "MJGameResult", "onBtnShareClicked");
var i = this;
this.node.on("game_end", function(e) {
cc.log("==>MJGameResult game_end", e.detail);
i.onGameEnd(e.detail);
});
}
},
showResult: function(e, t, n, i, a, o, s, c) {
e.getChildByName("id").getComponent(cc.Label).string = t;
e.getChildByName("name").getComponent(cc.Label).string = n;
e.getChildByName("fangzhu").getComponent(cc.Sprite).node.active = a;
e.getChildByName("dayinjia").getComponent(cc.Sprite).node.active = o;
e.getChildByName("zimocishu").getComponent(cc.Label).string = s.numZiMo;
e.getChildByName("jiepaocishu").getComponent(cc.Label).string = s.numJiePao;
e.getChildByName("dianpaocishu").getComponent(cc.Label).string = s.numDianPao;
e.getChildByName("angangcishu").getComponent(cc.Label).string = s.numAnGang;
e.getChildByName("minggangcishu").getComponent(cc.Label).string = s.numMingGang;
var h = e.getChildByName("winscore").getComponent(cc.Label), r = e.getChildByName("losescore").getComponent(cc.Label);
if (0 <= c) {
h.node.active = !0;
r.node.active = !1;
h.string = "+" + c;
} else {
h.node.active = !1;
r.node.active = !0;
r.string = "" + c;
}
var l, d, g = e.getChildByName("head_clip").getChildByName("head_img").getComponent(cc.Sprite);
l = g, d = i, cc.loader.load({
url: d,
type: "jpg"
}, function(e, t) {
if (!e) {
var n = new cc.SpriteFrame(t, cc.Rect(0, 0, t.width, t.height));
l.spriteFrame = n;
l.node.setScale(2 - t.width / 94);
}
});
},
onGameEnd: function(e) {
for (var t = th.socketIOManager.seats, n = -1, i = 0; i < t.length; i++) t[i].score > n && (n = t[i].score);
for (i = 0; i < 4; i++) this._seats[i].active = !1;
for (i = 0; i < t.length; i++) {
this._seats[i].active = !0;
var a = t[i], o = !1;
0 < a.score && (o = a.score == n);
var s = a.userId == th.socketIOManager.creator;
this.showResult(this._seats[i], a.userId, a.name, a.headImgUrl, s, o, e[i], a.score);
}
},
onBtnBackHallClicked: function() {
cc.log("onBtnBackHallClicked");
th.wc.show("正在返回游戏大厅");
cc.director.loadScene("hall");
},
onBtnShareClicked: function() {
cc.log("onBtnShareClicked");
},
update: function(e) {}
});
cc._RF.pop();
}, {} ],
MJGame: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "4bfedfG94xLrbJd946qbcx3", "MJGame");
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
onLoad: function() {
if (null != th) {
this.addComponent("MJFolds");
this.addComponent("MJChiPengGangs");
this.addComponent("MJGameOver");
this.addComponent("MJGameResult");
this.addComponent("MJReConnect");
this.initView();
this.initEventHandlers();
this.nodePrepare.active = !0;
this.nodeGameInfo.active = !1;
this.onGameBegin();
th.audioManager.playBGM("bg_fight.mp3");
}
},
initView: function() {
this.chupaidian.node.active = !1;
for (var e = this.node.getChildByName("myself").getChildByName("Holds"), t = 0; t < e.children.length; t++) {
(s = e.children[t].getComponent(cc.Sprite)).node.active = !1;
this._mymjs.push(s);
s.spriteFrame = null;
this.initDragStuffs(s.node);
}
var n = cc.director.getVisibleSize().width;
e.scaleX *= n / 1280;
e.scaleY *= n / 1280;
for (var i = [ "myself", "right", "up", "left" ], a = 1; a < i.length; a++) {
var o = this.node.getChildByName(i[a]).getChildByName("Holds").children;
for (t = 0; t < o.length; t++) {
var s;
(s = o[t].getComponent(cc.Sprite)).node.active = !1;
}
}
for (a = 0; a < i.length; a++) {
var c = this.node.getChildByName(i[a]), h = c.getChildByName("Chupai").getComponent(cc.Sprite);
h.node.active = !1;
h.spriteFrame = null;
var r = c.getChildByName("Hupai");
r.active = !1;
if ((2 != a || 3 != th.socketIOManager.seats.length) && (1 != a && 3 != a || 2 != th.socketIOManager.seats.length)) {
var l = c.getChildByName("Effect").getComponent(cc.Animation);
this._effects.push(l);
this._chupais.push(h);
this._hupaiTips.push(r);
}
}
this.hideOptions();
},
initEventHandlers: function() {
var c = this;
th.socketIOManager.dataEventHandler = this.node;
this.node.on("check_ip", function(e) {
cc.log("==>MJGame check_ip:", JSON.stringify(e.detail));
c.checkIp();
});
this.node.on("sync_push", function(e) {
c.onGameBegin();
c.checkIp();
});
this.node.on("ready_result", function(e) {
cc.log("==>Gmae ready_result:", JSON.stringify(e.detail));
var t = e.detail;
c.btnReady.node.active = 0 == th.socketIOManager.round && !t.ready;
});
this.node.on("holds_push", function(e) {
cc.log("==>Gmae holds_push:", JSON.stringify(e.detail));
c.initMahjongs();
});
this.node.on("begin_push", function(e) {
cc.log("==>Gmae begin_push:", JSON.stringify(e.detail));
c.onGameBegin();
1 == th.socketIOManager.round && cc.log("check ip ....");
});
this.node.on("disconnect", function(e) {
cc.log("==>Gmae disconnect:", JSON.stringify(e.detail));
});
this.node.on("mjsy_push", function(e) {
c.lblMjCount.string = "剩余 " + th.socketIOManager.mjsy + " 张";
c.lblFontMjCount.string = "x" + th.socketIOManager.mjsy;
});
this.node.on("round_push", function(e) {
cc.log("==>Gmae round_push:", JSON.stringify(e.detail));
c.lblRoundCount.string = "剩余 " + (th.socketIOManager.config.round - th.socketIOManager.round) + " 局";
});
this.node.on("caishen_push", function(e) {
cc.log("==>Gmae caishen_push:", JSON.stringify(e.detail));
c.setSpriteFrameByMJID("B_", c.spriteCaishen, th.socketIOManager.caishen);
});
this.node.on("begin_push", function(e) {
cc.log("==>Gmae begin_push:", JSON.stringify(e.detail));
c.onGameBegin();
1 == th.socketIOManager.round && cc.log("check ip ....");
});
this.node.on("chupai_push", function(e) {
cc.log("==>Gmae chupai_push:", JSON.stringify(e.detail));
e = e.detail;
c.hideChupai();
e.last != th.socketIOManager.seatIndex && c.initMopai(e.last, null);
e.turn != th.socketIOManager.seatIndex && c.initMopai(e.turn, -1);
});
this.node.on("action_push", function(e) {
cc.log("==>Gmae action_push:", JSON.stringify(e.detail));
c.showAction(e.detail);
});
this.node.on("guo_result", function(e) {
c.hideChupai();
});
this.node.on("guo_notify_push", function(e) {
c.hideChupai();
c.hideOptions();
e.detail.index == th.socketIOManager.seatIndex && c.initMahjongs();
th.audioManager.playSFX("give.mp3");
});
this.node.on("chi_notify_push", function(e) {
cc.log("==>Gmae chi_notify_push:", JSON.stringify(e.detail));
c.hideChupai();
var t = e.detail;
t.index == th.socketIOManager.seatIndex ? c.initMahjongs() : c.initOtherMahjongs(t);
var n = th.socketIOManager.getLocalIndex(t.index);
c.playEffect(n, "play_chi");
th.audioManager.playSFX("nv/chi.mp3");
c.hideOptions();
});
this.node.on("peng_notify_push", function(e) {
cc.log("==>Gmae peng_notify_push:", JSON.stringify(e.detail));
c.hideChupai();
var t = e.detail;
t.index == th.socketIOManager.seatIndex ? c.initMahjongs() : c.initOtherMahjongs(t);
var n = th.socketIOManager.getLocalIndex(t.index);
c.playEffect(n, "play_peng");
th.audioManager.playSFX("nv/peng.mp3");
c.hideOptions();
});
this.node.on("gang_notify_push", function(e) {
cc.log("==>Gmae gang_notify_push:", JSON.stringify(e.detail));
c.hideChupai();
var t = e.detail;
t.index == th.socketIOManager.seatIndex ? c.initMahjongs() : c.initOtherMahjongs(t);
c.hideOptions();
});
this.node.on("hangang_notify_push", function(e) {
cc.log("==>Gmae hangang_notify_push:", JSON.stringify(e.detail));
var t = th.socketIOManager.getSeatIndexById(e.detail.userId), n = th.socketIOManager.getLocalIndex(t);
c.playEffect(n, "angang" == e.detail.gangType ? "play_angang" : "play_gang");
th.audioManager.playSFX("nv/gang.mp3");
c.hideOptions();
});
this.node.on("chupai_notify_push", function(e) {
c.hideChupai();
var t = e.detail.seatData;
t.index == th.socketIOManager.seatIndex ? c.initMahjongs() : c.initOtherMahjongs(t);
c.showChupai();
var n = th.mahjongManager.getAudioURLByMJID(e.detail.pai);
th.audioManager.playSFX(n);
});
this.node.on("mopai_push", function(e) {
c.hideChupai();
var t = (e = e.detail).pai;
if (0 == th.socketIOManager.getLocalIndex(e.seatIndex)) {
var n = c._mymjs[13];
n.node.mjid = t;
c.setSpriteFrameByMJID("M_", n, t);
n.node.getChildByName("gold_icon").active = t == th.socketIOManager.caishen;
} else 0;
});
this.node.on("hu_push", function(e) {
cc.log("==>Gmae hu_push:", JSON.stringify(e.detail));
var t = (e = e.detail).seatIndex, n = th.socketIOManager.getLocalIndex(t), i = c._hupaiTips[n];
i.active = !0;
0 == n && c.hideOptions();
th.socketIOManager.seats[t].isHu = !0;
i.getChildByName("hu").active = !e.isZimo;
i.getChildByName("zimo").active = e.isZimo;
c.playEffect(n, e.isZimo ? "play_zimo" : "play_hu");
th.audioManager.playSFX("nv/hu.mp3");
});
this.node.on("clean_push", function() {
cc.log("==>Gmae clean_push:");
for (var e = [ "myself", "right", "up", "left" ], t = 0; t < e.length; t++) {
for (var n = c.node.getChildByName(e[t]), i = n.getChildByName("Holds").children, a = 0; a < i.length; a++) {
var o = i[a].getComponent(cc.Sprite);
o.node.active = !1;
o.spriteFrame = null;
}
var s = n.getChildByName("Chupai").getComponent(cc.Sprite);
s.node.active = !1;
s.spriteFrame = null;
n.getChildByName("Hupai").active = !1;
}
c.nodeGameInfo.active = !1;
c.hideChupai();
c.hideOptions();
});
this.node.on("repeat_login", function() {
th.alert.show("提示", "您的账号已在别处登录！", function() {
th.wc.show("正在返回登录场景");
cc.director.loadScene("login");
}, !1);
});
},
playEffect: function(e, t) {
this._effects[e].node.active = !0;
this._effects[e].play(t);
},
initDragStuffs: function(t) {
t.on(cc.Node.EventType.TOUCH_START, function(e) {
if (th.socketIOManager.turn == th.socketIOManager.seatIndex) {
t.interactable = t.getComponent(cc.Button).interactable;
if (t.interactable) {
this.chupaidian.node.active = !1;
this.chupaidian.spriteFrame = t.getComponent(cc.Sprite).spriteFrame;
this.chupaidian.node.x = e.getLocationX() - cc.director.getVisibleSize().width / 2;
this.chupaidian.node.y = e.getLocationY() - cc.director.getVisibleSize().height / 2;
this.chupaidian.node.getChildByName("gold_icon").active = t.mjid == th.socketIOManager.caishen;
}
}
}.bind(this));
t.on(cc.Node.EventType.TOUCH_MOVE, function(e) {
if (th.socketIOManager.turn == th.socketIOManager.seatIndex && t.interactable && !(Math.abs(e.getDeltaX()) + Math.abs(e.getDeltaY()) < .5)) {
this.chupaidian.node.active = !0;
t.opacity = 150;
this.chupaidian.node.opacity = 255;
this.chupaidian.node.scaleX = 1;
this.chupaidian.node.scaleY = 1;
this.chupaidian.node.x = e.getLocationX() - cc.director.getVisibleSize().width / 2;
this.chupaidian.node.y = e.getLocationY() - cc.director.getVisibleSize().height / 2;
t.y = 0;
}
}.bind(this));
t.on(cc.Node.EventType.TOUCH_END, function(e) {
if (th.socketIOManager.turn == th.socketIOManager.seatIndex && t.interactable) {
this.chupaidian.node.active = !1;
t.opacity = 255;
if (200 <= e.getLocationY()) {
cc.log("chupai :", t.mjid);
this.shoot(t.mjid);
}
}
}.bind(this));
t.on(cc.Node.EventType.TOUCH_CANCEL, function(e) {
if (th.socketIOManager.turn == th.socketIOManager.seatIndex && t.interactable) if (200 <= e.getLocationY()) {
this.chupaidian.node.active = !1;
t.opacity = 255;
cc.log("chupai :", t.mjid);
this.shoot(t.mjid);
} else {
this.chupaidian.node.active = !1;
t.opacity = 255;
}
}.bind(this));
},
onGameBegin: function() {
for (var e = 0; e < this._effects.length; e++) this._effects[e].node.active = !1;
for (e = 0; e < th.socketIOManager.seats.length; e++) {
var t = th.socketIOManager.seats[e], n = th.socketIOManager.getLocalIndex(e), i = this._hupaiTips[n];
i.active = t.isHu;
if (t.isHu) {
i.getChildByName("hu").active = !t.isZimo;
i.getChildByName("zimo").active = t.isZimo;
}
}
this.hideChupai();
this.hideOptions();
this.btnReady.node.active = "idle" == th.socketIOManager.status && !th.socketIOManager.seats[th.socketIOManager.seatIndex].ready;
if ("idle" != th.socketIOManager.status) {
this.setSpriteFrameByMJID("B_", this.spriteCaishen, th.socketIOManager.caishen);
this.lblRoundCount.string = "剩余 " + (th.socketIOManager.config.round - th.socketIOManager.round) + " 局";
this.lblMjCount.string = "剩余 " + th.socketIOManager.mjsy + " 张";
var a = [ "right", "up", "left" ];
for (e = 0; e < a.length; ++e) for (var o = this.node.getChildByName(a[e]).getChildByName("Holds"), s = 0; s < o.childrenCount; ++s) {
var c = o.children[s];
c.active = !0;
c.scaleX = 1;
c.scaleY = 1;
c.getComponent(cc.Sprite).spriteFrame = th.mahjongManager.holdsEmpty[e + 1];
}
this.nodePrepare.active = !1;
this.nodeGameInfo.active = !0;
this.initMahjongs();
for (e = 0; e < th.socketIOManager.seats.length; e++) {
t = th.socketIOManager.seats[e];
if (0 != (n = th.socketIOManager.getLocalIndex(e))) {
this.initOtherMahjongs(t);
e == th.socketIOManager.turn ? this.initMopai(e, -1) : this.initMopai(e, null);
}
}
this.showChupai();
if (null != th.socketIOManager.actions) {
this.showAction(th.socketIOManager.actions);
th.socketIOManager.actions = null;
}
}
},
onMJClicked: function(e) {
if (th.socketIOManager.turn == th.socketIOManager.seatIndex) for (var t = 0; t < this._mymjs.length; ++t) if (e.target == this._mymjs[t].node) {
if (e.target == this._selectedMJ) {
cc.log("chupai :", this._selectedMJ.mjid);
this.shoot(this._selectedMJ.mjid);
this._selectedMJ.y = 0;
this._selectedMJ = null;
return;
}
null != this._selectedMJ && (this._selectedMJ.y = 0);
e.target.y = 15;
this._selectedMJ = e.target;
return;
}
},
onOptionClicked: function(e) {
if ("btnPeng" == e.target.name) th.sio.send("peng"); else if ("btnGang" == e.target.name) th.sio.send("gang", e.target.pai); else if ("btnHu" == e.target.name) th.sio.send("hu"); else if ("btnChi" == e.target.name) th.sio.send("chi", e.target.pais); else if ("btnGuo" == e.target.name) {
th.socketIOManager.turn == th.socketIOManager.seatIndex && (this.optionsWin.active = !1);
th.sio.send("guo");
}
},
shoot: function(e) {
null != e && th.sio.send("chupai", e);
},
getMJIndex: function(e, t) {
return "right" == e || "up" == e ? 13 - t : t;
},
initMopai: function(e, t) {
var n = th.socketIOManager.getLocalIndex(e), i = th.mahjongManager.getSide(n), a = th.mahjongManager.getFoldPre(n), o = this.node.getChildByName(i).getChildByName("Holds"), s = this.getMJIndex(i, 13), c = o.children[s];
c.scaleX = 1;
c.scaleY = 1;
if (null == t) c.active = !1; else if (0 <= t) {
c.active = !0;
if ("up" == i) {
c.scaleX = .73;
c.scaleY = .73;
}
c.getComponent(cc.Sprite).spriteFrame = th.mahjongManager.getSpriteFrameByMJID(a, t);
} else if (null != t) {
c.active = !0;
if ("up" == i) {
c.scaleX = 1;
c.scaleY = 1;
}
c.getComponent(cc.Sprite).spriteFrame = th.mahjongManager.getHoldsEmptySpriteFrame(i);
}
},
hideChupai: function() {
for (var e = 0; e < this._chupais.length; e++) this._chupais[e].node.active = !1;
},
showChupai: function() {
var e = th.socketIOManager.chupai;
if (0 <= e) {
var t = th.socketIOManager.getLocalIndex(th.socketIOManager.turn), n = this._chupais[t];
n.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_", e);
n.node.active = !0;
n.node.getChildByName("gold_icon").active = e == th.socketIOManager.caishen;
}
},
addOption: function(e, t) {
for (var n = this.optionsWin.getChildByName("Options"), i = 0; i < n.childrenCount; i++) {
var a = n.children[i];
if ("Option" == a.name && 0 == a.active) {
a.active = !0;
if ("btnChi" != e) {
(s = a.getChildByName("opTarget1").getComponent(cc.Sprite)).spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_", t);
s.node.active = !0;
(c = a.getChildByName("btns").getChildByName(e)).active = !0;
c.pai = t;
} else {
var o = [];
for (i = 0; i < t.length; i++) if (-1 != t[i]) {
o.push(t[i]);
var s;
(s = a.getChildByName("opTarget" + (3 - o.length)).getComponent(cc.Sprite)).spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_", t[i]);
s.node.active = !0;
}
var c;
(c = a.getChildByName("btns").getChildByName(e)).active = !0;
c.pais = t.join(",");
}
break;
}
}
},
showAction: function(e) {
this.optionsWin.active && this.hideOptions();
if (e && (e.hu || e.gang || e.peng || e.chi)) {
this.optionsWin.active = !0;
e.hu && this.addOption("btnHu", e.huPai);
e.peng && this.addOption("btnPeng", e.pengPai);
if (e.chi) for (var t = 0; t < e.chiPai.length; ++t) {
var n = e.chiPai[t];
this.addOption("btnChi", n);
}
if (e.gang) for (t = 0; t < e.gangPai.length; ++t) {
var i = e.gangPai[t];
this.addOption("btnGang", i);
}
}
},
initMahjongs: function() {
var e = th.socketIOManager.seats[th.socketIOManager.seatIndex], t = e.holds;
if (null != t) {
t = th.mahjongManager.sortHolds(t);
for (var n = 3 * (e.pengs.length + e.angangs.length + e.diangangs.length + e.bugangs.length + e.chis.length), i = 0; i < t.length; i++) {
var a = t[i];
(o = this._mymjs[n + i]).node.mjid = a;
this.setSpriteFrameByMJID("M_", o, a);
o.node.getChildByName("gold_icon").active = a == th.socketIOManager.caishen;
o.node.y = 0;
}
for (i = 0; i < n; i++) {
(o = this._mymjs[i]).node.mjid = null;
o.spriteFrame = null;
o.node.active = !1;
o.node.y = 0;
}
for (i = n + t.length; i < this._mymjs.length; ++i) {
var o;
(o = this._mymjs[i]).node.mjid = null;
o.spriteFrame = null;
o.node.active = !1;
o.node.y = 0;
}
}
},
initOtherMahjongs: function(e) {
var t = th.socketIOManager.getLocalIndex(e.index);
if (0 != t) {
for (var n = th.mahjongManager.getSide(t), i = this.node.getChildByName(n).getChildByName("Holds"), a = 3 * (e.pengs.length + e.angangs.length + e.diangangs.length + e.bugangs.length + e.chis.length), o = 0; o < a; o++) {
var s = this.getMJIndex(n, o);
i.children[s].active = !1;
}
var c = th.mahjongManager.getFoldPre(t), h = th.mahjongManager.sortHolds(e.holds);
if (null != h && 0 < h.length) {
for (o = 0; o < h.length; o++) {
s = this.getMJIndex(n, o + a);
var r = i.children[s].getComponent(cc.Sprite);
if ("up" == n) {
r.node.scaleX = .73;
r.node.scaleY = .73;
}
r.node.active = !0;
r.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(c, h[o]);
}
if (h.length + a == 13) {
var l = this.getMJIndex(n, 13);
i.children[l].active = !1;
}
}
}
},
setSpriteFrameByMJID: function(e, t, n) {
t.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(e, n);
t.node.active = !0;
},
hideOptions: function(e) {
this.optionsWin.active = !1;
for (var t = this.optionsWin.getChildByName("Options"), n = 0; n < t.childrenCount; n++) {
var i = t.children[n];
if ("Option" == i.name) {
i.active = !1;
i.getChildByName("opTarget1").active = !1;
i.getChildByName("opTarget2").active = !1;
var a = i.getChildByName("btns");
a.getChildByName("btnChi").active = !1;
a.getChildByName("btnPeng").active = !1;
a.getChildByName("btnGang").active = !1;
a.getChildByName("btnHu").active = !1;
}
}
},
checkIp: function() {
cc.log("==>MJGame check_ip:");
}
});
cc._RF.pop();
}, {} ],
MJReConnect: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "54de3Nitr1HaaQyXFuS6GIL", "MJReConnect");
cc.Class({
extends: cc.Component,
properties: {
_reconnect: null,
_lblTip: null,
_loading_image: null,
_lastPing: 0
},
onLoad: function() {
cc.log("MJReconnect onload");
this._reconnect = cc.find("Canvas/ReConnect");
this._loading_image = this._reconnect.getChildByName("loading_image");
var n = this, e = function e(t) {
n.node.off("disconnect", e);
n._reconnect.active = !0;
cc.log("MJREConnect disconnect");
(function i() {
th.sio.test(function(e, t) {
cc.log("MJReConnect fnTestServerOn:", t);
if (e || t.errcode || 0 == t.isOnline) setTimeout(i, 3e3); else {
var n = th.userManager.roomId;
th.socketIOManager.resetRound();
if (null != n) {
th.userManager.roomId = null;
th.userManager.joinRoom(n, function(e) {
if (0 != e.errcode) {
th.socketIOManager.roomId = null;
cc.director.loadScene("hall");
}
});
}
}
});
})();
};
this.node.on("connect_success", function() {
n._reconnect.active = !1;
n.node.on("disconnect", e);
});
this.node.on("disconnect", e);
},
update: function(e) {
this._reconnect.active && (this._loading_image.rotation = this._loading_image.rotation - 45 * e);
}
});
cc._RF.pop();
}, {} ],
MJRoom: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "9e94cmRNURPVYbq/hLFI5Fb", "MJRoom");
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
onLoad: function() {
if (null != th) {
this.initView();
this.initSeats();
this.initEventHandlers();
}
},
initView: function() {
if (2 == th.socketIOManager.seats.length) {
this.node.getChildByName("left").active = !1;
this.node.getChildByName("right").active = !1;
} else 3 == th.socketIOManager.seats.length && (this.node.getChildByName("up").active = !1);
this.lblRoomId.string = th.socketIOManager.roomId || "------";
this.lblWangfa.string = th.socketIOManager.getWanfa();
for (var e = [ "myself", "right", "up", "left" ], t = 0; t < e.length; t++) if ((2 != t || 3 != th.socketIOManager.seats.length) && (1 != t && 3 != t || 2 != th.socketIOManager.seats.length)) {
var n = this.node.getChildByName(e[t]).getChildByName("Seat").getComponent("MJSeat");
this._seats.push(n);
}
cc.log("MJRoom Seats:", this._seats.length);
this.refreshBtns();
},
initSeats: function() {
for (var e = th.socketIOManager.seats, t = 0; t < e.length; ++t) this.initSingleSeat(e[t]);
},
initSingleSeat: function(e) {
var t = th.socketIOManager.getLocalIndex(e.index);
this._seats[t].setInfo(e.userId, e.name, e.score, e.headImgUrl);
this._seats[t].setFangzhu(e.userId == th.socketIOManager.creator);
this._seats[t].setBanker(e.index == th.socketIOManager.bankerIndex);
this._seats[t].setReady(e.ready);
this._seats[t].setOffline(!e.online);
},
refreshBtns: function() {
var e = 0 == th.socketIOManager.round, t = th.socketIOManager.isFangzhu();
this.btnDissolve.node.active = e && t;
this.btnLeave.node.active = e && !t;
this.btnWechatInvite.node.active = e;
this.btnMenu.node.active = !e;
},
initEventHandlers: function() {
var i = this;
this.node.on("join_push", function(e) {
cc.log("==>MJRoom join_push:", JSON.stringify(e.detail));
i.initSingleSeat(e.detail);
});
this.node.on("leave_push", function(e) {
cc.log("==>MJRoom leave_push:", JSON.stringify(e.detail));
i.initSingleSeat(e.detail);
});
this.node.on("offline_push", function(e) {
cc.log("==>MJRoom offline_push:", JSON.stringify(e.detail));
var t = th.socketIOManager.getSeatIndexById(e.detail.userId), n = th.socketIOManager.getLocalIndex(t);
i._seats[n].setOffline(!0);
});
this.node.on("online_push", function(e) {
cc.log("==>MJRoom online_push:", JSON.stringify(e.detail));
var t = th.socketIOManager.getSeatIndexById(e.detail.userId), n = th.socketIOManager.getLocalIndex(t);
i._seats[n].setOffline(!1);
});
this.node.on("ready_result", function(e) {
var t = e.detail;
i.initSingleSeat(t);
});
this.node.on("ready_push", function(e) {
i.initSingleSeat(e.detail);
});
this.node.on("score_push", function(e) {
i.initSingleSeat(e.detail);
});
this.node.on("begin_push", function(e) {
i.refreshBtns();
i.initSeats();
});
},
onBtnDissolveRequestClicked: function() {
th.alert.show("申请解散房间", "申请解散房间不会退换钻石，是否确定申请解散？", function() {
th.sio.send("dissolve_request");
}, !0);
},
onBtnDissolveClicked: function() {
th.alert.show("解散房间", "解散房间不扣钻石，是否确定解散？", function() {
th.sio.send("dissolve");
}, !0);
},
onBtnLeaveClicked: function() {
th.socketIOManager.isFangzhu() ? th.alert.show("离开房间", "您是房主，不能离开房间。", function() {}) : th.alert.show("离开房间", "您确定要离开房间?", function() {
th.sio.send("leave");
}, !0);
},
onBtnSettingClicked: function() {
this.settingWin.active = !0;
},
onBtnChatClicked: function() {
cc.log("onChatClicked==>");
},
onBtnVoiceClicked: function() {
cc.log("onVoiceClicked==>");
},
onBtnReadyClicked: function() {
cc.log("onBtnReadyClicked==>");
th.sio.send("ready");
},
onBtnWechatInviteClicked: function() {
cc.log("onBtnWechatInviteClicked==>");
}
});
cc._RF.pop();
}, {} ],
MJSeat: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "f9241Gbzr5PTpX4P6axZTjN", "MJSeat");
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
_isOffline: !1,
_isReady: !1,
_isFangzhu: !1,
_isbanker: !1,
_lastChatTime: -1
},
onLoad: function() {
this.chat && (this.chat.node.active = !1);
this.emoji && (this.emoji.node.active = !1);
this.refresh();
},
refresh: function() {
this._userName && (this.lblName.string = this._userName);
if (this._score) if (0 <= this._score) {
this.lblWinScore.string = this._score;
this.lblWinScore.node.active = !0;
this.lblLoseScore.node.active = !1;
} else {
this.lblLoseScore.string = this._score;
this.lblLoseScore.node.active = !0;
this.lblWinScore.node.active = !1;
}
this.offline && (this.offline.node.active = this._isOffline && null != this._userId);
this.ready && (this.ready.node.active = this._isReady && "idle" == th.socketIOManager.status);
this.fangzhu && (this.fangzhu.node.active = this._isFangzhu);
this.banker && (this.banker.node.active = this._isbanker);
},
setUserID: function(e) {
this._userId = e;
},
setUserName: function(e) {
this._userName = e;
this.lblName && (this.lblName.string = this._userName);
},
setSex: function(e) {
this._sex = e;
},
setHeadImgUrl: function(e) {
var i = this;
this._headImgUrl = e;
if (this._headImgUrl && this.headImg) {
this.headwho.node.active = !1;
this.headImg.node.active = !0;
cc.loader.load({
url: this._headImgUrl,
type: "jpg"
}, function(e, t) {
if (!e) {
var n = new cc.SpriteFrame(t, cc.Rect(0, 0, t.width, t.height));
i.headImg.spriteFrame = n;
i.headImg.node.setScale(2 - t.width / 94);
}
});
} else if (!this._headImgUrl && i.headImg) {
this.headwho.node.active = !0;
this.headImg.node.active = !1;
}
},
setScore: function(e) {
this._score = e;
if (this.lblLoseScore && this.lblWinScore) if (0 <= this._score) {
this.lblWinScore.string = this._score;
this.lblWinScore.node.active = !0;
this.lblLoseScore.node.active = !1;
} else {
this.lblLoseScore.string = this._score;
this.lblLoseScore.node.active = !0;
this.lblWinScore.node.active = !1;
}
},
setFangzhu: function(e) {
this._isFangzhu = e;
this.fangzhu && (this.fangzhu.node.active = this._isFangzhu);
},
setReady: function(e) {
this._isReady = e;
this.ready && (this.ready.node.active = this._isReady && "idle" == th.socketIOManager.status);
},
setBanker: function(e) {
this._isbanker = e;
this.banker && (this.banker.node.active = this._isbanker);
},
setOffline: function(e) {
this._isOffline = e;
this.offline && (this.offline.node.active = this._isOffline && null != this._userId);
},
setChat: function(e) {
if (this.chat) {
this.emoji.node.active = !1;
this.chat.node.active = !0;
this.chat.getComponent(cc.Label).string = e;
this.chat.getChildByName("chat_msg").getComponent(cc.Label).string = e;
this._lastChatTime = 3;
}
},
setEmoji: function(e) {
if (this.emoji) {
this.chat.node.active = !1;
this.emoji.node.active = !0;
this._lastChatTime = 3;
}
},
setInfo: function(e, t, n, i) {
this.setUserID(e);
if (e) {
this.setUserName(t);
this.setScore(n);
this.setHeadImgUrl(i);
} else {
this.setUserName("--");
this.setScore("--");
this.setHeadImgUrl(null);
}
},
update: function(e) {
if (0 < this._lastChatTime) {
this._lastChatTime -= e;
if (this._lastChatTime < 0) {
this.chat.node.active = !1;
this.emoji.node.active = !1;
}
}
}
});
cc._RF.pop();
}, {} ],
MJStatus: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "eff0a4aOXBIibpfEIluCAoO", "MJStatus");
cc.Class({
extends: cc.Component,
properties: {
time: cc.Label,
delay: cc.Label,
battery: cc.ProgressBar,
_updateInterval: 1e3,
_lastUpdateTime: 0,
_red: new cc.Color(205, 0, 0),
_yellow: new cc.Color(255, 200, 0),
_green: new cc.Color(0, 205, 0)
},
onLoad: function() {},
update: function(e) {
if (Date.now() - this._lastUpdateTime > this._updateInterval) {
this.delay.string = th.sio.delay + "ms";
this._lastUpdateTime = Date.now();
800 < th.sio.delay ? this.delay.node.color = this._red : 300 < th.sio.delay ? this.delay.node.color = this._yellow : this.delay.node.color = this._green;
var t = new Date(), n = t.getHours(), i = t.getMinutes();
n = n < 10 ? "0" + n : n;
i = i < 10 ? "0" + i : i;
this.time.string = n + ":" + i;
this.battery.progress = th.anysdkManager.getBatteryPercent();
}
}
});
cc._RF.pop();
}, {} ],
MJTimePointer: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "91966JzykBMnaossS5P+TJS", "MJTimePointer");
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
_isPlay: !0
},
onLoad: function() {
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
this.topPointer.node.active = !1;
} else if (2 == th.socketIOManager.seats.length) {
this._pointers.push(this.bottomPointer);
this._pointers.push(this.topPointer);
this.rightPointer.node.active = !1;
this.leftPointer.node.active = !1;
}
this.initPointer();
this.initEventHandlers();
},
initPointer: function() {
if (null != th) {
this._isPlay = !0;
for (var e = th.socketIOManager.turn, t = th.socketIOManager.getLocalIndex(e), n = 0; n < this._pointers.length; ++n) {
var i = n == t;
this._pointers[n].node.active = i;
}
}
},
initEventHandlers: function() {
var t = this;
this.node.on("begin_push", function(e) {
t.initPointer();
});
this.node.on("chupai_push", function(e) {
t.initPointer();
t._countdownEndTime = Date.now() + 1e4;
t._alertStartTime = Date.now() + 7e3;
t._isPlay = !1;
});
},
update: function(e) {
var t = Date.now();
if (this._countdownEndTime > t) {
var n = Math.ceil((this._countdownEndTime - t) / 1e3) - 1;
this.lblTime.string = n;
}
if (this._alertStartTime < t && !this._isPlay) {
this._isPlay = !0;
th.audioManager.playSFX("timeup_alarm.mp3");
}
}
});
cc._RF.pop();
}, {} ],
MahjongManger: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "baa6diT1/ZD/rHD/igYzXco", "MahjongManger");
var i = [];
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
onLoad: function() {
if (null != th) {
th.mahjongManager = this;
var e = th.socketIOManager.seats.length;
cc.log("==>MahjongManger seatSzie:", e);
if (4 == e) {
this._sides = [ "myself", "right", "up", "left" ];
this._pres = [ "M_", "R_", "B_", "L_" ];
this._foldPres = [ "B_", "R_", "B_", "L_" ];
} else if (3 == e) {
this._sides = [ "myself", "right", "left" ];
this._pres = [ "M_", "R_", "L_" ];
this._foldPres = [ "B_", "R_", "L_" ];
} else if (2 == e) {
this._sides = [ "myself", "up" ];
this._pres = [ "M_", "B_" ];
this._foldPres = [ "B_", "B_" ];
}
for (var t = 1; t < 10; ++t) i.push("character_" + t);
for (t = 1; t < 10; ++t) i.push("bamboo_" + t);
for (t = 1; t < 10; ++t) i.push("dot_" + t);
for (t = 1; t < 8; ++t) i.push("wind_" + t);
}
},
getMahjongSpriteByID: function(e) {
return i[e];
},
getMahjongType: function(e) {
return 0 <= e && e <= 8 ? 0 : 9 <= e && e <= 17 ? 1 : 18 <= e && e <= 16 ? 2 : 27 <= e && e <= 33 ? 3 : void 0;
},
getSpriteFrameByMJID: function(e, t) {
var n = this.getMahjongSpriteByID(t);
n = e + n;
return "M_" == e ? this.bottomAtlas.getSpriteFrame(n) : "B_" == e ? this.bottomFoldAtlas.getSpriteFrame(n) : "L_" == e ? this.leftAtlas.getSpriteFrame(n) : "R_" == e ? this.rightAtlas.getSpriteFrame(n) : void 0;
},
getAudioURLByMJID: function(e) {
var t = 0;
0 <= e && e <= 8 ? t = e + 11 : 9 <= e && e <= 17 ? t = e - 8 : 18 <= e && e <= 26 ? t = e + 3 : 27 <= e && e <= 33 && (t = e + 4);
return "nv/" + t + ".mp3";
},
getEmptySpriteFrame: function(e) {
return "up" == e ? this.emptyAtlas.getSpriteFrame("e_mj_b_bottom") : "myself" == e ? this.emptyAtlas.getSpriteFrame("e_mj_b_bottom") : "left" == e ? this.emptyAtlas.getSpriteFrame("e_mj_b_left") : "right" == e ? this.emptyAtlas.getSpriteFrame("e_mj_b_right") : void 0;
},
getHoldsEmptySpriteFrame: function(e) {
return "up" == e ? this.emptyAtlas.getSpriteFrame("e_mj_up") : "myself" == e ? null : "left" == e ? this.emptyAtlas.getSpriteFrame("e_mj_left") : "right" == e ? this.emptyAtlas.getSpriteFrame("e_mj_right") : void 0;
},
sortHolds: function(e) {
if (null == e) return e;
e.sort(function(e, t) {
var n = e, i = t;
n == th.socketIOManager.caishen ? n -= 100 : 33 == n && th.socketIOManager.caishen < 27 && (n = th.socketIOManager.caishen);
i == th.socketIOManager.caishen ? i -= 100 : 33 == i && th.socketIOManager.caishen < 27 && (i = th.socketIOManager.caishen);
return n - i;
});
return e;
},
sortMJ: function(e, a) {
var o = this;
e.sort(function(e, t) {
if (0 <= a) {
var n = o.getMahjongType(e), i = o.getMahjongType(t);
if (n != i) {
if (a == n) return 1;
if (a == i) return -1;
}
}
return e - t;
});
},
getSide: function(e) {
return this._sides[e];
},
getPre: function(e) {
return this._pres[e];
},
getFoldPre: function(e) {
return this._foldPres[e];
}
});
cc._RF.pop();
}, {} ],
Setting: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "6a0fbUIvs9N64QfYQsH2Pec", "Setting");
cc.Class({
extends: cc.Component,
properties: {
effectSlider: cc.Slider,
musicSlider: cc.Slider
},
onLoad: function() {},
onEnable: function() {
var e = cc.sys.localStorage.getItem("bgmVolume");
if (e) {
th.audioManager.setBGMVolume(parseFloat(e));
this.musicSlider.progress = parseFloat(e);
}
var t = cc.sys.localStorage.getItem("sfxVolume");
if (t) {
th.audioManager.setSFXVolume(parseFloat(t));
this.effectSlider.progress = parseFloat(t);
}
cc.log("bgm:", e, "sfx:", t);
},
onCloseClicked: function() {
this.node.active = !1;
},
onEffectSlide: function(e) {
th.audioManager.setSFXVolume(e.progress);
},
onMusicSlide: function(e) {
th.audioManager.setBGMVolume(e.progress);
}
});
cc._RF.pop();
}, {} ],
SocketIOManager: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "f3060chRz9FU6rQ3OvSu7my", "SocketIOManager");
cc.Class({
extends: cc.Component,
properties: {
dataEventHandler: null,
isRepeatLogin: !1,
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
needCheckIp: !1,
status: "idle",
actions: null,
isOver: !1
},
onLoad: function() {},
resetGame: function() {
this.resetRound();
th.userManager.roomId = null;
this.isRepeatLogin = !1;
this.config = null;
this.seats = null;
this.creator = null;
this.isOver = !0, this.seatIndex = -1;
},
resetRound: function() {
this.chupai = -1;
this.caishen = null;
this.bankerIndex = -1;
this.turn = -1;
this.mjsy = 0;
this.needCheckIp = !1;
this.status = "idle";
this.actions = null;
for (var e = 0; e < this.seats.length; e++) {
this.seats[e].holds = [];
this.seats[e].folds = [];
this.seats[e].chis = [];
this.seats[e].pengs = [];
this.seats[e].angangs = [];
this.seats[e].diangangs = [];
this.seats[e].bugangs = [];
this.seats[e].ready = !1;
this.seats[e].isHu = !1;
}
},
dispatchEvent: function(e, t) {
this.dataEventHandler && this.dataEventHandler.emit(e, t);
},
initHandlers: function() {
var a = this;
th.sio.addHandler("init_room", function(e) {
cc.log("==>SocketIOManager init_room:", JSON.stringify(e));
a.roomId = e.roomId;
a.config = e.config;
a.seats = e.seats;
a.round = e.round;
a.creator = e.creator;
a.isRepeatLogin = !1;
a.seatIndex = a.getSeatIndexById(th.userManager.userId);
a.dispatchEvent("init_room", e);
});
th.sio.addHandler("join_push", function(e) {
cc.log("==>SocketIOManager join_push:", JSON.stringify(e));
var t = e.index;
if (a.seats[t].userId) {
a.seats[t].online = !0;
if (a.seats[t].ip != e.ip) {
a.seats[t].ip = e.ip;
a.needCheckIp = !0;
}
} else {
a.seats[t] = e;
a.needCheckIp = !0;
}
a.dispatchEvent("join_push", a.seats[t]);
a.needCheckIp && a.dispatchEvent("check_ip", a.seats[t]);
});
th.sio.addHandler("leave_result", function(e) {
a.roomId = null;
a.resetGame();
});
th.sio.addHandler("sync_push", function(e) {
cc.log("==>SocketIOManager sync_push:", JSON.stringify(e));
a.mjsy = e.mjsy;
a.status = e.status;
a.turn = e.turn;
a.bankerIndex = e.bankerIndex;
a.chupai = e.chupai;
a.caishen = e.caishen;
for (var t = 0; t < e.seats.length; t++) {
var n = a.seats[t], i = e.seats[t];
n.holds = i.holds;
n.folds = i.folds;
n.angangs = i.angangs;
n.diangangs = i.diangangs;
n.bugangs = i.bugangs;
n.pengs = i.pengs;
n.chis = i.chis;
n.ready = i.ready;
}
a.dispatchEvent("sync_push");
a.dispatchEvent("mjsy_push");
a.dispatchEvent("caishen_push");
});
th.sio.addHandler("leave_push", function(e) {
cc.log("==>SocketIOManager leave_push:", JSON.stringify(e));
var t = e.userId, n = a.getSeatByUserId(t);
cc.log("leave:", n);
if (n) {
n.userId = null;
n.name = null;
n.headImgUrl = null;
n.sex = null;
n.score = 0;
n.ready = !1;
n.online = !1;
}
a.dispatchEvent("leave_push", n);
});
th.sio.addHandler("dissolve_push", function(e) {
a.roomId = null;
a.resetGame();
cc.log("==>SocketIOManager dissolve_push:", JSON.stringify(e));
});
th.sio.addHandler("offline_push", function(e) {
cc.log("==>SocketIOManager offline_push:", JSON.stringify(e));
null == a.roomId || a.isOver || a.dispatchEvent("offline_push", e);
});
th.sio.addHandler("online_push", function(e) {
cc.log("==>SocketIOManager online_push:", JSON.stringify(e));
a.dispatchEvent("online_push", e);
});
th.sio.addHandler("ready_result", function(e) {
cc.log("==>SocketIOManager ready_result:", JSON.stringify(e));
var t = a.getSeatByUserId(th.userManager.userId);
t.ready = !0;
a.dispatchEvent("ready_result", t);
});
th.sio.addHandler("ready_push", function(e) {
cc.log("==>SocketIOManager ready_push:", JSON.stringify(e));
var t = a.getSeatByUserId(e.userId);
t.ready = !0;
a.dispatchEvent("ready_push", t);
});
th.sio.addHandler("holds_push", function(e) {
cc.log("==>SocketIOManager holds_push:", JSON.stringify(e));
a.seats[a.seatIndex].holds = e;
for (var t = 0; t < a.seats.length; ++t) {
var n = a.seats[t];
null == n.folds && (n.folds = []);
null == n.angangs && (n.angangs = []);
null == n.diangangs && (n.diangangs = []);
null == n.bugangs && (n.bugangs = []);
null == n.pengs && (n.pengs = []);
null == n.chis && (n.chis = []);
n.ready = !1;
}
a.dispatchEvent("holds_push");
});
th.sio.addHandler("mjsy_push", function(e) {
cc.log("==>SocketIOManager mjsy_push:", e);
a.mjsy = e;
a.dispatchEvent("mjsy_push");
});
th.sio.addHandler("round_push", function(e) {
cc.log("==>SocketIOManager round_push:", e);
a.round = e;
a.dispatchEvent("round_push");
});
th.sio.addHandler("caishen_push", function(e) {
cc.log("==>SocketIOManager caishen_push:", e);
a.caishen = e;
a.dispatchEvent("caishen_push");
});
th.sio.addHandler("begin_push", function(e) {
cc.log("==>SocketIOManager begin_push:", e);
a.bankerIndex = e;
a.turn = a.bankerIndex;
a.status = "begin";
a.dispatchEvent("begin_push");
});
th.sio.addHandler("chupai_push", function(e) {
cc.log("==>SocketIOManager chupai_push:", JSON.stringify(e));
var t = e, n = a.getSeatIndexById(t);
a.doTurnChange(n);
});
th.sio.addHandler("action_push", function(e) {
cc.log("==>SocketIOManager action_push:", JSON.stringify(e));
a.actions = e;
a.dispatchEvent("action_push", e);
});
th.sio.addHandler("guo_result", function(e) {
a.dispatchEvent("guo_result");
});
th.sio.addHandler("guo_notify_push", function(e) {
var t = e.userId, n = (e.pai, a.getSeatIndexById(t));
a.doGuo(n, e.pai);
});
th.sio.addHandler("chi_notify_push", function(e) {
var t = e.userId, n = e.pai, i = a.getSeatIndexById(t);
a.doChi(i, e.info, n);
});
th.sio.addHandler("peng_notify_push", function(e) {
var t = e.userId, n = (e.pai, a.getSeatIndexById(t));
a.doPeng(n, e.info);
});
th.sio.addHandler("hangang_notify_push", function(e) {
a.dispatchEvent("hangang_notify_push", e);
});
th.sio.addHandler("gang_notify_push", function(e) {
cc.log("socketIOManager gang_notify_push:", e);
var t = e.userId, n = (e.pai, a.getSeatIndexById(t));
a.doGang(n, e.info, e.gangType);
});
th.sio.addHandler("chupai_notify_push", function(e) {
var t = e.userId, n = e.pai, i = a.getSeatIndexById(t);
a.doChupai(i, n);
});
th.sio.addHandler("mopai_push", function(e) {
a.doMopai(a.seatIndex, e);
});
th.sio.addHandler("hu_push", function(e) {
cc.log("socketIOManager hu_push:", e);
a.doHu(e);
});
th.sio.addHandler("hu_notify_push", function(e) {
a.doHu(e);
});
th.sio.addHandler("game_over_push", function(e) {
for (var t = e.results, n = 0; n < a.seats.length; n++) a.seats[n].score = 0 == t.length ? 0 : t[n].totalScore;
for (n = 0; n < a.seats.length; ++n) a.dispatchEvent("score_push", a.seats[n]);
a.dispatchEvent("game_over", t);
if (e.endInfo) {
a.isOver = !0;
a.dispatchEvent("game_end", e.endInfo);
a.resetGame();
} else {
a.resetRound();
a.dispatchEvent("clean_push");
}
});
th.sio.addHandler("repeat_login", function(e) {
a.resetGame();
a.isRepeatLogin = !0;
a.dispatchEvent("repeat_login");
});
th.sio.addHandler("disconnect", function(e) {
if (a.isRepeatLogin) {
cc.log("disconnect==>>self.isRepeatLogin");
a.isRepeatLogin = !0;
th.alert.show("提示", "您的账号已在别处登录！", function() {
th.wc.show("正在返回登录场景");
cc.director.loadScene("login");
}, !1);
} else if (null == a.roomId) {
cc.log("disconnect==>>self.roomId == null");
th.userManager.roomId = null;
th.wc.show("正在返回游戏大厅");
cc.director.loadScene("hall");
} else if (0 == a.isOver) {
cc.log("disconnect==>>self.isOver == false");
th.userManager.roomId = a.roomId;
a.dispatchEvent("disconnect");
} else {
th.userManager.roomId = null;
a.roomId = null;
a.config = null;
a.seats = null;
a.round = null;
a.seatIndex = -1;
}
});
},
getGangType: function(e, t) {
for (var n = -1, i = 0; i < e.pengs.length; i++) if (e.pengs[i].mjid == t) {
n = i;
break;
}
if (-1 != n) return "bugang";
var a = 0;
for (i = 0; i < e.holds.length; ++i) e.holds[i] == t && a++;
return 3 == a ? "diangang" : "angang";
},
doGuo: function(e, t) {
var n = this.seats[e];
n.folds.push(t.mjid);
this.dispatchEvent("guo_notify_push", n);
},
doChi: function(e, t, n) {
var i = this.seats[e];
if (i.holds) for (var a = 0; a < t.mjids.length; ++a) if (t.mjids[a] != n) {
var o = i.holds.indexOf(t.mjids[a]);
i.holds.splice(o, 1);
}
i.chis.push(t);
this.dispatchEvent("chi_notify_push", i);
},
doPeng: function(e, t) {
var n = this.seats[e];
if (n.holds) for (var i = 0; i < 2; ++i) {
var a = n.holds.indexOf(t.mjid);
n.holds.splice(a, 1);
}
n.pengs.push(t);
this.dispatchEvent("peng_notify_push", n);
},
doGang: function(e, t, n) {
cc.log("gangType", n, " info:", t);
var i = this.seats[e], a = t.mjid;
n || (n = this.getGangType(i, a));
if ("bugang" == n) {
for (var o = -1, s = 0; s < i.pengs.length; s++) if (i.pengs[s].mjid == a) {
o = s;
break;
}
-1 != o && i.pengs.splice(o, 1);
i.bugangs.push(t);
}
if (i.holds) for (s = 0; s <= 4; ++s) {
if (-1 == (o = i.holds.indexOf(a))) break;
i.holds.splice(o, 1);
}
"angang" == n ? i.angangs.push(t) : "diangang" == n && i.diangangs.push(t);
this.dispatchEvent("gang_notify_push", i);
},
doChupai: function(e, t) {
this.chupai = t;
var n = this.seats[e];
if (n.holds) {
var i = n.holds.indexOf(t);
n.holds.splice(i, 1);
}
this.dispatchEvent("chupai_notify_push", {
seatData: n,
pai: t
});
},
doMopai: function(e, t) {
var n = this.seats[e];
if (n.holds) {
n.holds.push(t);
this.dispatchEvent("mopai_push", {
seatIndex: e,
pai: t
});
}
},
doHu: function(e) {
this.dispatchEvent("hu_push", e);
},
doTurnChange: function(e) {
var t = {
last: this.turn,
turn: e
};
this.turn = e;
this.dispatchEvent("chupai_push", t);
},
getSeatIndexById: function(e) {
for (var t = 0; t < this.seats.length; t++) if (this.seats[t].userId == parseInt(e)) return t;
return -1;
},
getLocalIndex: function(e) {
var t = this.seats.length;
return (e - this.seatIndex + t) % t;
},
getSeatByUserId: function(e) {
var t = this.getSeatIndexById(e);
return this.seats[t];
},
getWanfa: function() {
var e = [];
e.push("封顶");
e.push(this.config.fengding);
e.push("，");
e.push(this.config.difen);
e.push("分，");
e.push("QZ" == this.config.zuozhuang ? "抢庄" : "轮庄");
e.push("，");
e.push("FZ" == this.config.payment ? "房主付" : "AA付");
e.push(this.config.ctdsq ? "，吃吐荡三圈" : "");
return e.join("");
},
isFangzhu: function() {
return this.creator == th.userManager.userId;
},
isReady: function(e) {
return this.getSeatByUserId(e).ready;
},
connectServer: function(e) {
var t = this;
th.sio.ip = e.ip;
th.sio.port = e.port;
th.sio.addr = "ws://" + e.ip + ":" + e.port + "?roomId=" + e.roomId + "&token=" + e.token + "&sign=" + e.sign + "&time=" + e.time;
th.sio.connect(function() {
cc.director.loadScene("mjgame", function() {
th.sio.ping();
th.wc.hide();
t.dispatchEvent("connect_success");
});
}, function(e) {
th.wc.hide();
th.alert.show("提示", e, null, !1);
});
}
});
cc._RF.pop();
}, {} ],
SocketIO: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "1e1fa6Pq4tHoqqg23GKLerB", "SocketIO");
var i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
return typeof e;
} : function(e) {
return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
};
cc.Class({
extends: cc.Component,
statics: {
ip: null,
port: null,
addr: null,
sio: null,
handlers: {},
fnDisconnect: null,
isPinging: !1,
lastSendTime: 0,
lastRecieveTime: 0,
delay: 0,
addHandler: function(t, n) {
if (this.handlers[t]) cc.log("event:" + t + "' handler has been registered."); else {
var e = function(e) {
"disconnect" != t && "string" == typeof e && (e = JSON.parse(e));
n(e);
};
this.handlers[t] = e;
if (this.sio) {
cc.log("register event: " + t);
this.sio.on(t, e);
}
}
},
connect: function(t, n) {
var i = this;
cc.log("connect to : " + this.addr);
this.sio = window.io.connect(this.addr, {
reconnection: !1,
"force new connection": !0,
transports: [ "websocket", "polling" ]
});
this.sio.on("connect", function(e) {
i.sio.connected = !0;
t(e);
});
this.sio.on("disconnect", function(e) {
cc.log("disconnect");
i.sio.connected = !1;
i.close();
});
this.sio.on("reconnect", function() {
cc.log("reconnect");
});
this.sio.on("connect_error", function() {
cc.log("connect_error");
});
this.sio.on("connect_timeout", function(e) {
cc.log("connect_timeout");
});
this.sio.on("reconnect_error", function(e) {
cc.log("reconnect_error");
});
this.sio.on("reconnect_failed", function(e) {
cc.log("reconnect_failed");
});
this.sio.on("error", function(e) {
cc.log("error");
n(e);
});
for (var e in this.handlers) {
var a = this.handlers[e];
if ("function" == typeof a) if ("disconnect" == e) this.fnDisconnect = a; else {
cc.log("register event: " + e);
this.sio.on(e, a);
}
}
this.heartbeat();
},
heartbeat: function() {
var e = this;
this.lastRecieveTime = Date.now();
this.sio.on("th-pong", function() {
cc.log("th-pong");
e.lastRecieveTime = Date.now();
e.delay = e.lastRecieveTime - e.lastSendTime;
});
if (!e.isPinging) {
e.isPinging = !0;
cc.game.on(cc.game.EVENT_HIDE, function() {
e.ping();
});
setInterval(function() {
e.sio && e.ping();
}.bind(this), 5e3);
setInterval(function() {
e.sio && 1e4 < Date.now() - e.lastRecieveTime && e.close();
}.bind(this), 500);
}
},
close: function() {
if (this.sio && this.sio.connected) {
this.sio.connected = !1;
this.sio.disconnect();
}
this.sio = null;
if (this.fnDisconnect) {
this.fnDisconnect();
this.fnDisconnect = null;
}
},
send: function(e, t) {
if (this.sio && this.sio.connected) {
t && "object" == ("undefined" == typeof t ? "undefined" : i(t)) && JSON.stringify(t);
this.sio.emit(e, t);
}
},
ping: function() {
if (this.sio) {
this.lastSendTime = Date.now();
this.send("th-ping");
}
},
test: function(n) {
var e = {
account: th.userManager.account,
sign: th.userManager.sign,
ip: this.ip,
port: this.port
};
cc.log("test:", e, this.addr);
th.http.get("/is_server_online", e, function(e, t) {
cc.log(t);
n(e, t);
});
}
}
});
cc._RF.pop();
}, {} ],
UserManager: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "c6fb334U8hIn79b0A8Adc+k", "UserManager");
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
onLoad: function() {},
lingshiAuth: function(e) {
th.http.get("/lingshi_auth", {
account: e
}, this.onAuth);
},
onAuth: function(e, t) {
if (e) {
cc.log("登录错误================》");
cc.log(e);
} else {
var n = th.userManager;
n.account = t.account;
n.sign = t.sign;
th.http.baseURL = "http://" + t.hallAddr;
cc.log(th.http.baseURL);
n.login();
}
},
login: function() {
var n = this;
th.http.get("/login", {
account: n.account,
sign: n.sign
}, function(e, t) {
if (e || t.errcode) cc.log(e, t.errmsg); else {
n.sex = t.sex;
n.userId = t.id;
n.account = t.account;
n.balance = t.balance;
n.userName = t.name;
n.headImgUrl = t.headImgUrl;
n.roomId = t.roomId;
cc.director.loadScene("hall", function() {
th.wc.hide();
});
}
});
},
logout: function() {
th.wc.show("正在退出房间");
var e = this;
cc.director.loadScene("login", function() {
e.sex = null;
e.userId = null;
e.account = null;
e.balance = null;
e.userName = null;
e.headImgUrl = null;
e.roomId = null;
th.wc.hide();
});
},
createRoom: function(e) {
var t = {
account: th.userManager.account,
sign: th.userManager.sign,
config: JSON.stringify(e)
};
th.wc.show("正在创建房间");
th.http.get("/create_private_room", t, function(e, t) {
if (e || t.errcode) {
th.wc.hide();
th.alert.show("提示", t.errmsg, null, !1);
} else {
cc.log("create room data:" + JSON.stringify(t));
th.wc.show("正在进入房间");
th.socketIOManager.connectServer(t);
}
});
},
joinRoom: function(e, n) {
var t = {
account: th.userManager.account,
sign: th.userManager.sign,
roomId: e
};
th.wc.show("正在加入房间");
th.http.get("/join_private_room", t, function(e, t) {
if (e || t.errcode) {
th.wc.hide();
null != n && n(t);
} else {
cc.log("join room data:" + JSON.stringify(t));
null != n && n(t);
th.socketIOManager.connectServer(t);
}
});
}
});
cc._RF.pop();
}, {} ],
Utils: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "b73c4UBdqFO/bi0FH4AbkeD", "Utils");
cc.Class({
extends: cc.Component,
properties: {},
addClickEvent: function(e, t, n, i) {
cc.log(n + ":" + i);
var a = new cc.Component.EventHandler();
a.target = t;
a.component = n;
a.handler = i;
e.getComponent(cc.Button).clickEvents.push(a);
},
addSlideEvent: function(e, t, n, i) {
var a = new cc.Component.EventHandler();
a.target = t;
a.component = n;
a.handler = i;
e.getComponent(cc.Slider).slideEvents.push(a);
},
addEscEvent: function(e) {
cc.eventManager.addListener({
event: cc.EventListener.KEYBOARD,
onKeyPressed: function(e, t) {},
onKeyReleased: function(e, t) {
e == cc.KEY.back && cc.vv.alert.show("提示", "确定要退出游戏吗？", function() {
cc.game.end();
}, !0);
}
}, e);
}
});
cc._RF.pop();
}, {} ],
WaitingConnection: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "c9213QZp3ROI7Fd7AOxsnlH", "WaitingConnection");
cc.Class({
extends: cc.Component,
properties: {
target: cc.Node,
lblContent: cc.Label
},
onLoad: function() {
cc.log("WaitingConnection====>onload");
if (null == th) return null;
(th.wc = this).node.active = !1;
},
update: function(e) {
this.target.rotation = this.target.rotation - 90 * e;
},
show: function(e) {
this.node && (this.node.active = !0);
this.lblContent && (this.lblContent.string = e || "");
},
hide: function() {
this.node && (this.node.active = !1);
},
onDestory: function() {
th && (th.wc = null);
}
});
cc._RF.pop();
}, {} ]
}, {}, [ "AnysdkManager", "AudioManager", "Http", "SocketIO", "SocketIOManager", "UserManager", "Utils", "Alert", "AppStart", "GameScrollBar", "Hall", "JoinRoom", "MJChiPengGangs", "MJCreateRoom", "MJFolds", "MJGame", "MJGameOver", "MJGameResult", "MJReConnect", "MJRoom", "MJSeat", "MJStatus", "MJTimePointer", "MahjongManger", "Setting", "WaitingConnection" ]);