cc.Class({
    extends: cc.Component,

    properties: {
       lblTime:cc.Label,
       bottomPointer:cc.Sprite,
       rightPointer:cc.Sprite,
       topPointer:cc.Sprite,
       leftPointer:cc.Sprite,
       _pointers:[],
       _countdownEndTime:0,
       _alertStartTime:0,
       _isPlay:true,
    },

    onLoad () {
        cc.log("TimePointer load ....");
        if(th.socketIOManager.seats.length==4){
            this._pointers.push(this.bottomPointer);
            this._pointers.push(this.rightPointer);
            this._pointers.push(this.topPointer);
            this._pointers.push(this.leftPointer);
        }else if(th.socketIOManager.seats.length==3){
            this._pointers.push(this.bottomPointer);
            this._pointers.push(this.rightPointer);
            this._pointers.push(this.leftPointer);
            this.topPointer.node.active=false;
        }else if(th.socketIOManager.seats.length==2){
            this._pointers.push(this.bottomPointer);
            this._pointers.push(this.topPointer);
            this.rightPointer.node.active=false;
            this.leftPointer.node.active=false;
        }
        this.initPointer();
        this.initEventHandlers();
    },

    initPointer:function(){
        if(th==null) return;
        this._isPlay=true;
        var turn=th.socketIOManager.turn;
        var localIndex=th.socketIOManager.getLocalIndex(turn);
        for(var i = 0; i < this._pointers.length; ++i){
            var isAcitve=(i == localIndex);
            this._pointers[i].node.active = isAcitve;
        }
    },

    initEventHandlers:function(){
        var self=this;
        this.node.on('begin_push',function(data){
            self.initPointer();
        });
        
        this.node.on('chupai_push',function(data){
            self.initPointer();
            self._countdownEndTime=Date.now()+10*1000;
            self._alertStartTime=Date.now()+7*1000;
            self._isPlay=false;
        });
    },

    update (dt) {
        var now=Date.now();
        if(this._countdownEndTime > now){
            var miao=Math.ceil((this._countdownEndTime-now)/1000)-1;
            this.lblTime.string=miao;
        }
        if(this._alertStartTime<now&&!this._isPlay){
            this._isPlay=true;
            th.audioManager.playSFX("timeup_alarm.mp3");
        }
    },



  

});
