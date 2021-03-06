cc.Class({
    extends: cc.Component,

    properties: {
       time:cc.Label,
       delay:cc.Label,
       battery:cc.ProgressBar,
       _updateInterval:1000,
       _lastUpdateTime:0,
       _updateBatteryInterval:1000*30,
       _lastUpdateBatteryTime:0,
       _red: new cc.Color(205,0,0),
       _yellow: new cc.Color(255,200,0),
       _green: new cc.Color(0,205,0)
    },

    onLoad () {
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
            
            
        }
        if(Date.now()-this._lastUpdateBatteryTime>this._updateBatteryInterval){
            this._lastUpdateBatteryTime=Date.now();
            this.battery.progress=th.anysdkManager.getBatteryPercent();
        }

    },


  

});
