cc.Class({
    extends: cc.Component,

    properties: {
        _nodeRoot:null,
        _nodeVip: null,
    },

    // use this for initialization
    onLoad: function () {
        if(th == null){
            return;
        }
        cc.log("MJVIP onload");
        this._nodeRoot= cc.find("Canvas/Vip");
        this._nodeVip = cc.find("Canvas/Vip/mjs");
        this._nodeRoot.active = false;
        var self = this;

        
       
        this.node.on('vip_mj_push', function (event) {
            var data = event.detail;
            self.initVipMj(data.mjs.reverse());
            self._nodeRoot.active = true;
        });
    },
    initVipMj:function(mjs){
        for(var i = 0; i < this._nodeVip.childrenCount; i++){
            this._nodeVip.children[i].active = false;
        }
        for(var i=0;i<mjs.length;i++){
            var nodeMj = null;
            if(this._nodeVip.childrenCount <= i){
                nodeMj = cc.instantiate(th.mahjongManager.myHoldMahjong);
                this._nodeVip.addChild(nodeMj,mjs.length-1);
                th.utils.addClickEvent(nodeMj ,this.node,"MJVip","onBtnMjClicked");
            }else{
                nodeMj = this._nodeVip.children[i];
                nodeMj.active = true;
            }
            nodeMj.mjid=mjs[i];
            var sprite = nodeMj.getComponent(cc.Sprite);
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_",mjs[i]);

            var gold_icon=sprite.node.getChildByName("gold_icon");
            gold_icon.active=mjs[i]==th.socketIOManager.caishen;

            nodeMj.active = true;
        }
        if(this._nodeRoot){
            th.utils.addClickEvent(this._nodeRoot ,this.node,"MJVip","onBtnCloseClicked");
        }
    },
    onBtnCloseClicked:function(){
        this._nodeRoot.active = false;
    },
    onBtnMjClicked:function(event){
        var mj=parseInt(event.target.mjid);
        th.sio.send("vip",mj); 
        this._nodeRoot.active = false;
    },

    update: function (dt) {
        
    },
});
