(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/SocketIO.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '1e1fa6Pq4tHoqqg23GKLerB', 'SocketIO', __filename);
// scripts/SocketIO.js

"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
if(window.io == null){
    window.io = require("socket.io");
}
*/
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
        //fnDisconnect:null,
        addHandler: function addHandler(event, fn) {
            if (this.handlers[event]) {
                cc.log("event:" + event + "' handler has been registered.");
                return;
            }
            var handler = function handler(data) {
                if (event != "disconnect" && typeof data == "string") {
                    data = JSON.parse(data);
                }
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
                'reconnection': false,
                'force new connection': true,
                'transports': ['websocket', 'polling']
            };
            this.sio = window.io.connect(this.addr, opts);
            this.sio.on('connect', function (data) {
                self.sio.connected = true;
                fnConnect(data);
            });
            this.sio.on('disconnect', function (data) {
                cc.log("disconnect");
                self.sio.connected = false;
                self.close();
            });
            this.sio.on('reconnect', function () {
                cc.log('reconnect');
            });
            this.sio.on('connect_error', function () {
                cc.log('connect_error');
            });
            this.sio.on('connect_timeout', function (timeout) {
                cc.log('connect_timeout');
            });
            this.sio.on('reconnect_error', function (error) {
                cc.log('reconnect_error');
            });
            this.sio.on('reconnect_failed', function (error) {
                cc.log('reconnect_failed');
            });
            this.sio.on('error', function (error) {
                cc.log('error');
                fnError(error);
            });

            for (var key in this.handlers) {
                var handler = this.handlers[key];
                if (typeof handler == "function") {
                    if (key == 'disconnect') {
                        this.fnDisconnect = handler;
                    } else {
                        cc.log("register event: " + key);
                        this.sio.on(key, handler);
                    }
                }
            }

            this.heartbeat();
        },
        heartbeat: function heartbeat() {
            var self = this;
            this.lastRecieveTime = Date.now();
            this.sio.on('th-pong', function () {
                cc.log("th-pong");
                self.lastRecieveTime = Date.now();
                self.delay = self.lastRecieveTime - self.lastSendTime;
                //cc.log('th-pong:',self.delay,self==th.sio);
            });
            if (!self.isPinging) {
                self.isPinging = true;
                cc.game.on(cc.game.EVENT_HIDE, function () {
                    self.ping();
                });
                //每5秒ping一下服务器
                setInterval(function () {
                    if (self.sio) {
                        self.ping();
                    }
                }.bind(this), 5000);
                //每1000毫秒检查一次最后收到消息时间，如果大于10秒就是断开
                setInterval(function () {
                    if (self.sio) {
                        if (Date.now() - self.lastRecieveTime > 10000) {
                            self.close();
                        }
                    }
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
                if (data && (typeof data === "undefined" ? "undefined" : _typeof(data)) == 'object') {
                    data == JSON.stringify(data);
                }
                this.sio.emit(event, data);
            }
        },
        ping: function ping() {
            if (this.sio) {
                this.lastSendTime = Date.now();
                this.send('th-ping');
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
            th.http.get('/is_server_online', params, function (err, data) {
                cc.log(data);
                fnResult(err, data);
            });
            /*
            setTimeout(function(){
                if(xhr){
                    xhr.abort();
                    fnResult(false);                    
                }
            },1500);
            */
        }

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
        //# sourceMappingURL=SocketIO.js.map
        