cc.Class({
    extends: cc.Component,

    properties: {
        btnConfirm:cc.Button,
        btnCancel:cc.Button,
        title:cc.Label,
        content:cc.Label,
        _fnConfirm:null
    },

    onLoad () {
        cc.log("Alert====>onload");
        if(th==null){
            return null;
        }
        th.alert=this;
        this.node.active=false;
        this._fnConfirm = null;
    },

    /*
    update (dt) {
    },
    */

    show (title,content,fnConfirm,showBtnCancel) {

        cc.log("showBtnCancel:"+showBtnCancel);
        if(this.node){
            this.node.active=true;
        }
        if(this.title){
            this.title.string=title||""; 
        }
        if(this.content){
            this.content.string=content||""; 
        }
        this._fnConfirm=fnConfirm;
        if(showBtnCancel){
            this.btnCancel.node.active=true;
            this.btnCancel.node.x=160;
            this.btnConfirm.node.x=-160;
        }else{
            this.btnCancel.node.active=false;
            this.btnConfirm.node.x=0;
        }
       
    },

    onCancelClicked:function(){
        this.node.active = false;
    },

    onConfirmClicked:function(){
        this.node.active = false;
        if(this._fnConfirm){
            this._fnConfirm();
        }
    },

    hide () {
        if(this.node){
            this.node.active=false;
        }
    },

    onDestory:function(){
        if(th){
            th.alert = null;    
        }
    }

});
