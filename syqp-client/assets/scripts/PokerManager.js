var pokerSprites=[];

cc.Class({
    extends: cc.Component,

    properties: {
        pokerAtlas:{
            default:null,
            type:cc.SpriteAtlas
        }
    },

    onLoad:function(){
        if(th==null) return;
        th.pokerManager=this;
        /*
        
        var flower=['spades','hearts','clubs','diamonds'];
        for(var i=0;i<flower.length;i++){
            for(var j=5;j<=15;j++){

            }
        }
        */
    },
    

    getSpriteFrameByPokerId:function(pokerId){
        var flower=pokerId%10;
        flower=flower==4?"spades":flower==3?"hearts":flower=="2"?"clubs":"diamonds";
        var value=parseInt(pokerId/10);
        return this.pokerAtlas.getSpriteFrame(flower+"_"+value);    
    }




});

