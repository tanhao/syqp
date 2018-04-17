cc.Class({
    extends: cc.Component,

    properties: {
       roomId:cc.Label,
       round:cc.Label,
       time:cc.Label,
       delay:cc.Label,
       battery:cc.ProgressBar,
       _updateInterval:1000,
       _lastUpdateTime:0,
       _red: new cc.Color(205,0,0),
       _yellow: new cc.Color(255,200,0),
       _green: new cc.Color(0,205,0)
    },

    onLoad () {
         this.roomId.string=th.socketIOManager.roomId || '------';
         this.round.string=th.socketIOManager.round==null?'-':(th.socketIOManager.round+'');
         
         this.node.on("begin_push",function(target){
            console.log('==>Status begin_push:',JSON.stringify(target.detail));
            this.round.string=th.socketIOManager.round==null?'-':(th.socketIOManager.round+'');
        })
    },

    


    update (dt) {
        if(Date.now()-this._lastUpdateTime>this._updateInterval){
            this.delay.string=th.sio.delay+"ms";
            this._lastUpdateTime=Date.now();
            if(th.sio.delay > 800){
                this.delay.node.color = this._red;
            }else if(th.sio.delay > 300){
                this.delay.node.color = this._yellow;
            }else{
                this.delay.node.color = this._green;
            }
            var now=new Date();
            var hour=now.getHours();
            var min=now.getMinutes();
            hour=hour<10?('0'+hour):hour;
            min=min<10?('0'+min):min;
            this.time.string=hour+":"+min;
            this.battery.progress=th.anysdkManager.getBatteryPercent();
        }
    },


  

});
