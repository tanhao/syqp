cc.Class({
    extends: cc.Component,

    properties: {
        _folds:null,
    },

    onLoad () {
        this.initView();
        this.initEventHandler();
    },


    update (dt) {
    },

    initView:function(){
        this._folds={};
        this._folds.left=[];
        this._folds.myself=[];
        this._folds.right=[];
        this._folds.up=[];
        var names =['left','myself','right','up'];
        var path = ["Canvas/myself/Folds1",
                    "Canvas/myself/Folds2",
                    "Canvas/right/Folds1/Folds",
                    "Canvas/right/Folds2/Folds",
                    "Canvas/up/Folds1",
                    "Canvas/up/Folds2",
                    "Canvas/left/Folds1",
                    "Canvas/left/Folds2"
                        ];
        for(var i = 0; i < path.length; i++){
            var pokers=cc.find(path[i]).children;
            var name=names[parseInt(i/2)];
            for(var j=0;j<pokers.length;j++){
                var poker=pokers[j];
                poker.active=false;
                var sprite = poker.getComponent(cc.Sprite);
                sprite.spriteFrame = null;
                this._folds[name].push(sprite);  
            }
        }
    },

  
    initEventHandler:function(){
        var self = this;
        this.node.on('game_begin',function(data){
            self.initAllFolds();
        });  
    },

    hideAllFolds:function(){
        cc.log("Folds hideAllFolds.....");
        for(var key in this._folds){
            var pokers = this._folds[key];
            for(var i=0;i<pokers.length;i++){
                pokers[i].node.active = false;
            }
        }
    },

    refreshAllSeat:function(){

    },

    refreshOneSeat:function(){

    }

});
