/*
if(window.io == null){
    window.io = require("socket.io");
}
*/
var SIO=cc.Class({
    extends: cc.Component,

    statics:{
        addr:null,
        sio:null,
        handlers:{},
        fnDisconnect:null,
        isPinging:false,
        lastSendTime:0,
        lastRecieveTime:0,
        delay:0,
        //fnDisconnect:null,
        addHandler:function(event,fn){
            if(this.handlers[event]){
                console.log("event:" + event + "' handler has been registered.");
                return;
            }
            var handler = function(data){
                if(event != "disconnect" && typeof(data) == "string"){
                    data = JSON.parse(data);
                }
                fn(data);
            };
            this.handlers[event] = handler; 
            if(this.sio){
                console.log("register event: " + event);
                this.sio.on(event,handler);
            }
        },
        connect:function(fnConnect,fnError){
            var self=this;
            cc.log("connect to : "+this.addr);
            var opts = {
                'reconnection':false,
                'force new connection': true,
                'transports':['websocket', 'polling']
            }
            this.sio = window.io.connect(this.addr,opts);
            this.sio.on('connect',function(data){
                self.sio.connected = true;
                fnConnect(data);
            });
            this.sio.on('disconnect',function(data){
                console.log("disconnect");
                self.sio.connected = false;
                self.close();
            });
            this.sio.on('reconnect',function(){
                console.log('reconnect');
            });
            this.sio.on('connect_error',function (){
                console.log('connect_error');
            });
            this.sio.on('connect_timeout', (timeout) => {
                console.log('connect_timeout');
            });
            this.sio.on('reconnect_error', (error) => {
                console.log('reconnect_error');
            });
            this.sio.on('reconnect_failed', (error) => {
                console.log('reconnect_failed');
            });
            this.sio.on('error', (error) => {
                console.log('error');
                fnError(error);
            });

            for(var key in this.handlers){
                var handler = this.handlers[key];
                if(typeof(handler) == "function"){
                    if(key == 'disconnect'){
                        this.fnDisconnect = handler;
                    }else{
                        console.log("register event: " + key);
                        this.sio.on(key,handler);         
                    }
                }
            }

            this.heartbeat();
        },
        heartbeat:function(){
            var self=this;
            this.sio.on('th-pong',function(){
                self.lastRecieveTime = Date.now();
                self.delay = self.lastRecieveTime - self.lastSendTime;
                //console.log('th-pong:',self.delay,self==th.sio);
            });
            if(!self.isPinging){
                cc.game.on(cc.game.EVENT_HIDE,function(){
                    self.ping();
                });
                //每5秒ping一下服务器
                setInterval(function(){
                    if(self.sio){
                        self.ping();                
                    }
                }.bind(this),5000);
                /*
                //每500毫秒检查一次最后收到消息时间，如果大于10秒就是断开
                setInterval(function(){
                    if(self.sio){
                        if(Date.now() - self.lastRecieveTime > 10000){
                            self.close();
                        }         
                    }
                }.bind(this),500);
                */
            }   
        },
        close:function(){
            if(this.sio && this.sio.connected){
                this.sio.connected = false;
                this.sio.disconnect();
            }
            this.sio = null;
            if(this.fnDisconnect){
                this.fnDisconnect();
                this.fnDisconnect = null;
            }
        },
        send:function(event,data){
            if(this.sio&&this.sio.connected){
                if(data&&typeof(data)=='object'){
                    data==JSON.stringify(data);
                }
                this.sio.emit(event,data);
            }
        },
        ping:function(){
            if(this.sio){
                this.lastSendTime=Date.now();
                this.send('th-ping');
            }
        }

    }
});