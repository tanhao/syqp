cc.Class({
    extends: cc.Component,

    properties: {
        activityWin:cc.Node,
        noticeWin:cc.Node,
    },

    onLoad () {
        if(th==null){ return; }
        this.activityWin.active=true;
        this.noticeWin.active=false;
    },
  
    onToggleClicked : function(event,data){
        th.audioManager.playSFX("click.mp3");
        if(parseInt(data)==1){
            this.activityWin.active=true;
            this.noticeWin.active=false;
        }else if(parseInt(data)==2){
            this.activityWin.active=false;
            this.noticeWin.active=true;
        }
    },
    
    update (dt) {
        
    },

  
});
