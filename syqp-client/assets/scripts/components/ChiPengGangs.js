cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    onLoad: function () {
        if(th==null){
            return;
        }
        var self = this;
        var myself = this.node.getChildByName("myself");
        var nodeChiPengGang = myself.getChildByName("ChiPengGang");
        var realwidth = cc.director.getVisibleSize().width;
        var scale = realwidth / 1280;
        nodeChiPengGang.scaleX *= scale;
        nodeChiPengGang.scaleY *= scale;

        this.node.on('chi_notify',function(data){
            console.log("chi_notify",data.detail);
            var data = data.detail;
            self.onChiPengGangChanged(data);
        });

        this.node.on('peng_notify',function(data){
            console.log("peng_notify",data.detail);
            var data = data.detail;
            self.onChiPengGangChanged(data);
        });
        
        this.node.on('gang_notify',function(data){
            console.log("gang_notify",data.detail);
            var data = data.detail;
            self.onChiPengGangChanged(data.seatData);
        });

        this.node.on('game_begin',function(data){
            self.onGameBegin();
        });

        var seats = th.socketIOManager.seats;
        for(var i in seats){
            this.onChiPengGangChanged(seats[i]);
        }
    },
    onGameBegin:function(){
        this.hideSide("myself");
        this.hideSide("right");
        this.hideSide("up");
        this.hideSide("left");
    },
    hideSide:function(side){
        var nodeSide = this.node.getChildByName(side);
        var nodeChiPengGang = nodeSide.getChildByName("ChiPengGang");
        if(nodeChiPengGang){
            for(var i = 0; i < nodeChiPengGang.childrenCount; ++i){
                nodeChiPengGang.children[i].active = false;
            }            
        }
    },
    onChiPengGangChanged:function(seatData){
        //(seatData.pengs seatData.angangs seatData.diangangs seatData.bugangs seatData.chis
        if(seatData.pengs == null && seatData.angangs == null && seatData.diangangs == null && seatData.bugangs == null && seatData.chis == null){
            return;
        }
        var localIndex = th.socketIOManager.getLocalIndex(seatData.seatindex);
        var side = th.mahjongManager.getSide(localIndex);
        var pre = th.mahjongManager.getFoldPre(localIndex);
        var nodeSide = this.node.getChildByName(side);
        var nodeChiPengGang = nodeSide.getChildByName("ChiPengGang");
        for(var i = 0; i < nodeChiPengGang.childrenCount; ++i){
            nodeChiPengGang.children[i].active = false;
        }
        //初始化杠牌
        var index = 0;
        var gangs = seatData.angangs;
        for(var i = 0; i < gangs.length; ++i){
            var mjid = gangs[i];
            this.initChiPengAndGangs(nodeChiPengGang,side,pre,index,mjid,"angang");
            index++;    
        } 
        gangs = seatData.diangangs;
        for(var i = 0; i < gangs.length; ++i){
            var mjid = gangs[i];
            this.initChiPengAndGangs(nodeChiPengGang,side,pre,index,mjid,"diangang");
            index++;    
        }
        gangs = seatData.bugangs;
        for(var i = 0; i < gangs.length; ++i){
            var mjid = gangs[i];
            this.initChiPengAndGangs(nodeChiPengGang,side,pre,index,mjid,"bugang");
            index++;    
        }
        //初始化碰牌
        var pengs = seatData.pengs
        if(pengs){
            for(var i = 0; i < pengs.length; ++i){
                var mjid = pengs[i];
                this.initChiPengAndGangs(nodeChiPengGang,side,pre,index,mjid,"peng");
                index++;    
            }    
        }  
        //初始化吃的牌
        var chis = seatData.pengs
        if(chis){
            for(var i = 0; i < chis.length; ++i){
                var mjid = chis[i];
                this.initChiPengAndGangs(nodeChiPengGang,side,pre,index,mjid,"chi");
                index++;    
            }    
        }
    },
    initChiPengAndGangs:function(nodeChiPengGang,side,pre,index,info,flag){
        var nodeCPG = null;
        if(nodeChiPengGang.childrenCount <= index){
            if(side == "left" || side == "right"){
                nodeCPG = cc.instantiate(th.mahjongManager.pengPrefabLeft);
            }
            else{
                nodeCPG = cc.instantiate(th.mahjongManager.pengPrefabSelf);
            }
        }else{
            nodeCPG = nodeChiPengGang.children[index];
            nodeCPG.active = true;
        }

        if(side == "left"){
            nodeCPG.y = -(index * 25 * 3);                    
        }else if(side == "right"){
            nodeCPG.y = (index * 25 * 3);
            nodeCPG.setLocalZOrder(-index);
        }else if(side == "myself"){
            nodeCPG.x = index * 55 * 3 + index * 10;                    
        }else{
            nodeCPG.x = -(index * 55*3);
        }

        var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        if(flag=="angang"){
            for(var i = 0; i < sprites.length; i++){
                sprite.node.active = true;
                sprite.spriteFrame = th.mahjongManager.getEmptySpriteFrame(side);
            }
        }else if(flag=="diangang"||flag=="bugang"){
            for(var i = 0; i < sprites.length; i++){
                sprite.node.active = true;
                sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre,info.mjid);    
            }
        }else if(flag=="peng"){
            for(var i = 0; i < sprites.length; i++){
                if(sprite.node.name == "gang"){
                    sprite.node.active = false;
                }else{
                    sprite.node.active = true;
                    sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre,info.mjid);    
                }
            }
        }else if(flag=="chi"){
            var idx=0;
            for(var i = 0; i < sprites.length; i++){
                if(sprite.node.name == "gang"){
                    sprite.node.active = false;
                }else{
                    sprite.node.active = true;
                    sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre,info.mjids[idx]);    
                    idx+=1;
                }
            }
        }
    }

    // update: function (dt) {

    // },
    
});
