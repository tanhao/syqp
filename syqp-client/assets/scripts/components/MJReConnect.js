cc.Class({
    extends: cc.Component,

    properties: {
        _reconnect: null,
        _lblTip: null,
        _loading_image: null,
        _lastPing: 0,
    },

    // use this for initialization
    onLoad: function () {
        cc.log("MJReconnect onload");
        this._reconnect = cc.find("Canvas/ReConnect");
        this._loading_image = this._reconnect.getChildByName("loading_image");
        var self = this;

        var fnTestServerOn = function () {
            th.sio.test(function(err,data){
                cc.log("MJReConnect fnTestServerOn:",data);
                if(err||data.errcode||data.isOnline==false){
                    setTimeout(fnTestServerOn, 3000);
                }else{
                    var roomId=th.userManager.roomId;
                    th.socketIOManager.resetRound();
                    if (roomId != null) {
                        th.userManager.roomId=null;
                        th.userManager.joinRoom(roomId,function(data){
                            if(data.errcode!=0){
                                th.socketIOManager.roomId=null;
                                cc.director.loadScene('hall');
                            }
                        });
                    }
                }
            });
        }

        var fn = function (data) {
            self.node.off('disconnect', fn);
            self._reconnect.active = true;
            cc.log("MJREConnect disconnect");
            fnTestServerOn();
        };
        /*
        cc.game.on(cc.game.EVENT_HIDE, function () {
            cc.log("MJREConnect EVENT_HIDE");
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            cc.log("MJREConnect EVENT_SHOW");
        });
        */
       
        this.node.on('connect_success', function () {
            self._reconnect.active = false;
            self.node.on('disconnect', fn);
        });
        

        this.node.on('disconnect', fn);
    },
    update: function (dt) {
        if (this._reconnect.active) {
            this._loading_image.rotation = this._loading_image.rotation - dt * 45;
        }
    },
});
