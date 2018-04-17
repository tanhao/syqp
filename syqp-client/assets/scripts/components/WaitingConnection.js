cc.Class({
    extends: cc.Component,

    properties: {
        target:cc.Node,
	    lblContent:cc.Label
    },

    onLoad () {
        cc.log("WaitingConnection====>onload");
        if(th==null){
            return null;
        }
        th.wc=this;
        this.node.active=false;
    },

    update (dt) {
        //cc.log(new Date().getTime());
        this.target.rotation=this.target.rotation-dt*90;
    },

    show (content) {
        if(this.node){
            this.node.active=true;
        }
        if(this.lblContent){
            this.lblContent.string=content||""; 
        }
    },

    hide () {
        if(this.node){
            this.node.active=false;
        }
    },

    onDestory:function(){
        if(th){
            th.wc = null;    
        }
    }
});
