cc.Class({
    extends: cc.Component,

    properties: {
        _nodeDissolve:cc.Node,
        _lblInfo:cc.Label,
        _btnAgree:cc.Button,
        _btnReject:cc.Button,
        _btnClose:cc.Button,
        _endTime:-1,
        _extraInfo:null,
    },

    // use this for initialization
    onLoad: function () {
        if(th == null){
            return;
        }
        this._nodeDissolve = cc.find("Canvas/dissolve");
        this._btnAgree = cc.find("Canvas/dissolve/btn_agree");
        this._btnReject = cc.find("Canvas/dissolve/btn_reject");
        this._btnClose = cc.find("Canvas/dissolve/btn_close");
        this._lblInfo = cc.find("Canvas/dissolve/lbl_info").getComponent(cc.Label);
        if(this._btnAgree){
            th.utils.addClickEvent(this._btnAgree ,this.node,"Dissolve","onBtnAgreeClicked");
        }
        if(this._btnReject){
            th.utils.addClickEvent(this._btnReject ,this.node,"Dissolve","onBtnRejectClicked");
        }
        if(this._btnClose){
            th.utils.addClickEvent(this._btnClose ,this.node,"Dissolve","onBtnCloseClicked");
        }
        var self=this;
        this.node.on('dissolve_notice_push',function(event){
            var data = event.detail;
            cc.log("Dissolve dissolve_notice_push",data);
            self.showDissolveNotice(data);
        });
        
        this.node.on('dissolve_cancel_push',function(event){
            self._nodeDissolve.active=false;
        });
    },
    
    onBtnCloseClicked:function(){
        th.audioManager.playSFX("click.mp3");
        this._nodeDissolve.active=false;
    },

    onBtnAgreeClicked:function(target,idx){
        th.audioManager.playSFX("click.mp3");
        th.sio.send("dissolve_agree");
    },
    onBtnRejectClicked:function(target,idx){
        th.audioManager.playSFX("click.mp3");
        th.sio.send("dissolve_reject");
    },

    showDissolveNotice:function(data){
        this._endTime = Date.now()/1000 + data.time;
        this._extraInfo = "";
        var selfIsSelected=false;
        var numOfSelected=0;
        for(var i = 0; i < data.states.length; ++i){
            var b = data.states[i];
            var name = th.socketIOManager.seats[i].name;
            if(b){
                numOfSelected+=1;
                this._extraInfo += "\n[已同意] "+ name;
            }else{
                this._extraInfo += "\n[待确认] "+ name;
            }
            if(i==th.socketIOManager.seatIndex && b){
                selfIsSelected=true;
            }
        }
        if(selfIsSelected){
            this._btnAgree.active=false;
            this._btnReject.active=false;
        }else{
            this._btnAgree.active=true;
            this._btnReject.active=true;
        }
        if(numOfSelected==data.states.length){
            this._nodeDissolve.active=false;
        }else{
            this._nodeDissolve.active=true;
        }
        
    },
    update: function (dt) {
        if(this._endTime > 0){
            var lastTime = this._endTime - Date.now() / 1000;
            if(lastTime < 0){
                this._endTime = -1;
            }
            
            var m = Math.floor(lastTime / 60);
            var s = Math.ceil(lastTime - m*60);
            
            var str = "";
            if(m > 0){
                str += m + "分"; 
            }
            var msg=str + s + "秒后房间将自动解散" + this._extraInfo;
            this._lblInfo.string = msg;
        }
    },
});
