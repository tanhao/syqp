cc.Class({
    extends: cc.Component,

    properties: {
        pointerSprite:cc.Sprite,
        rewardSprite:cc.Sprite,
        turnSprite:cc.Sprite,
        nodeResult:cc.Node,
        _isRunning:false,
    },

    onLoad () {
        if(th==null){ return; }
        this.nodeResult.active=false;
        this.rewardSprite.node.active=false;
        this.turnSprite.node.active=false;
    },
    onLuckGameCloseClicked : function(){
        th.audioManager.playSFX("click.mp3");
        this.pointerSprite.node.stopAllActions();
        this.pointerSprite.node.rotation=0;
        this.rewardSprite.node.active=false;
        this.nodeResult.active=false;
        this.node.active=false;
        this.turnSprite.node.active=false;
        this._isRunning=false;
    },
    onGoLotteryClicked : function(){
        //th.audioManager.playSFX("click.mp3");
        //var idx=Math.floor(Math.random()*10);
        //this.trun(idx)
    },
    trun:function(reward){
        if(this._isRunning){
            return;
        }
        var self=this;
        var angle=this.getRandomAngle(reward);
        var rotate=cc.rotateTo(3.0,360*8.0+angle);
        th.audioManager.playSFX("lottery/lottery_begin.mp3");
        this._isRunning=true;
        this.rewardSprite.node.active=false;
        this.turnSprite.node.active=true;
        this.nodeResult.active=false;
        this.pointerSprite.node.runAction(cc.sequence(rotate.easing(cc.easeSineOut()),cc.callFunc(function(){
            th.audioManager.playSFX("lottery/lottery_ten.mp3");
            th.audioManager.playSFX("lottery/lottery_reward.mp3");
            self._isRunning=false;
            self.turnSprite.node.active=false;
            self.rewardSprite.node.rotation=reward*36;
            self.rewardSprite.node.active=true;
            self.nodeResult.active=true;
        },this)));
    },
    getRandomAngle:function(reward){
        var bx=3;
        if(reward==0){
            var angle=Math.floor(Math.random()*18)-bx;
            return Math.random()>0.5?angle:angle*-1;
        }else{
            var min=(reward-1)*36+18+bx;
            var max=reward*36+18-bx;
            var angle=Math.floor(min+Math.random()*(max-min));
            return angle;
        }
    },
    update (dt) {
        
    },

  
});
