cc.Class({
    extends: cc.Component,

    properties: {
        nums:{
            default:[],
            type:[cc.Label]
        },
        _inputIndex:0
    },

    onLoad: function () {
        
    },

    // update: function (dt) {

    // },
    
    onEnable:function(){
        this.onResetClicked();
    },

    onResetClicked:function(){
        th.audioManager.playSFX("click.mp3");
        for(var i = 0; i < this.nums.length; ++i){
            this.nums[i].string = "";
        }
        this._inputIndex = 0;
    },
    onDelClicked:function(){
        th.audioManager.playSFX("click.mp3");
        if(this._inputIndex > 0){
            this._inputIndex -= 1;
            this.nums[this._inputIndex].string = "";
        }
    },
    onCloseClicked:function(){
        th.audioManager.playSFX("click.mp3");
        this.node.active = false;
    },


    parseRoomID:function(){
        var str = "";
        for(var i = 0; i < this.nums.length; ++i){
            str += this.nums[i].string;
        }
        return parseInt(str);
    },

    onInput:function(target,num){
        th.audioManager.playSFX("click.mp3");
        if(this._inputIndex >= this.nums.length){
            return;
        }
        this.nums[this._inputIndex].string = num;
        this._inputIndex += 1;
        
        if(this._inputIndex == this.nums.length){
            var roomId = this.parseRoomID();
            cc.log("ok:" + roomId);
            this.onInputFinished(roomId);
        }
    },

    onInputFinished:function(roomId){
        th.userManager.joinRoom(roomId,function(data){
            if(data.errcode==0){
                this.node.active = false;
            }else{
                th.alert.show('提示',data.errmsg,null,false);
                this.onResetClicked();
            }
        }.bind(this));
    },

});
