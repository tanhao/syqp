cc.Class({
    extends: cc.Component,

    properties: {
        lblMjCount:cc.Label,
        lblRoundCount:cc.Label,
        spriteCaishen:cc.Sprite,
        btnReady:cc.Button,
        btnGang:cc.Button,
        btnPeng:cc.Button,
        btnChi:cc.Button,
        btnHu:cc.Button,
        btnGuo:cc.Button,
        chupaidian:cc.Sprite,
        settingWin:cc.Node,
        optionsWin:cc.Node,    ///所有可以做的操作节点
        nodePrepare:cc.Node,
        nodeGameInfo:cc.Node,
        nodeCaishen:cc.Node,

        _mymjs:[],   //自己手上的牌Sprite结合
        _effects:[], //每个座位动画节点（Animation）
        _chupais:[], //每个座位出牌节点（Sprite）
    },

    onLoad () {
        if(th==null){ return; }
        this.addComponent("MJFolds");
        this.initView();
        this.initEventHandlers();

        this.nodePrepare.active=true;
        this.nodeCaishen.active=false;
        this.nodeGameInfo.active=false;

        this.onGameBegin();
        th.audioManager.playBGM("bg_fight.mp3");
    },

    initView:function(){
        //把自己的牌都设置为null
        var holds = this.node.getChildByName('myself').getChildByName('Holds');
        for(var j=0;j<holds.children.length;j++){
                var sprite = holds.children[j].getComponent(cc.Sprite);
                sprite.node.active=false;
                this._mymjs.push(sprite);
                sprite.spriteFrame = null;
        }
        
        var seatNames = ["myself","right","up","left"];
        //隐藏其他玩家手上的牌
        for(var i=1;i<seatNames.length;i++){
            var mjs=this.node.getChildByName(seatNames[i]).getChildByName('Holds').children;
            for(var j=0;j<mjs.length;j++){
                var sprite = mjs[j].getComponent(cc.Sprite);
                sprite.node.active=false;
            }
        }
        for(var i=0;i<seatNames.length;i++){
            if((i==2&&th.socketIOManager.seats.length==3)||((i==1||i==3)&&th.socketIOManager.seats.length==2)){
                continue;
            }
            var seatNode=this.node.getChildByName(seatNames[i]);
            var animation=seatNode.getChildByName('Effect').getComponent(cc.Animation);
            this._effects.push(animation);
            
        }
        for(var i=0;i<seatNames.length;i++){
            var seatNode=this.node.getChildByName(seatNames[i]);
            var sprite=seatNode.getChildByName('Chupai').getComponent(cc.Sprite);
            sprite.node.active=false;
            sprite.spriteFrame = null;
            this._chupais.push(sprite);
        }
        this.hideOptions();
    },

    initEventHandlers:function(){
        var self=this;
        th.socketIOManager.dataEventHandler=this.node;
        
        //检查IP
        this.node.on('check_ip', function (target) {
            console.log('==>MJGame check_ip:',JSON.stringify(target.detail));
        });
        //自己准备返回
        this.node.on("ready_result",function(target){
            console.log('==>Gmae ready_result:',JSON.stringify(target.detail));
            var seat=target.detail;
            self.btnReady.node.active = th.socketIOManager.round==0&&!seat.ready;
        })

        //玩家手上的牌
        this.node.on("holds_push",function(target){
            console.log('==>Gmae holds_push:',JSON.stringify(target.detail));
            self.initMahjongs();
        })
        //开始游戏，出头的人
        this.node.on("begin_push",function(target){
            console.log('==>Gmae begin_push:',JSON.stringify(target.detail));
            self.onGameBegin();
             //第一把开局，要检查IP
            if(th.socketIOManager.round == 1){
                cc.log("check ip ....");    
            }
        })
        //断线
        this.node.on('disconnect', function (target) {
            console.log('==>Gmae disconnect:',JSON.stringify(target.detail));
        });
        
        //通知还剩多少张牌
         this.node.on("mjsy_push",function(target){
            console.log('==>Gmae mjsy_push:',JSON.stringify(target.detail));
            self.lblMjCount.string="剩余 "+th.socketIOManager.mjsy+" 张";
        })

        //通知当前是第几局
        this.node.on("round_push",function(target){
            console.log('==>Gmae round_push:',JSON.stringify(target.detail));
            self.lblRoundCount.string="剩余 "+(th.socketIOManager.config.round-th.socketIOManager.round)+" 局";
        })


        this.node.on('begin_push',function(data){
            console.log('==>Gmae begin_push:',JSON.stringify(target.detail));
            self.onGameBegin();
            cc.log("check ip ....");    
        });
        
        this.node.on('chupai_push',function(data){
            console.log('==>Gmae chupai_push:',JSON.stringify(target.detail));
            self.hideChupai();
        });

        this.node.on('action_push',function(data){
            console.log('==>Gmae action_push:',JSON.stringify(target.detail));
            self.showAction(data.detail);
        });

    },
    onGameBegin:function(){
        /*
        this.hideOptions();
        //显示手上的牌
        var seatNames = ["right","up","left"];
        for(var i=0;i<seatNames.length;i++){
            var mjs=this.node.getChildByName(seatNames[i]).getChildByName('Holds').children;
            for(var j=0;j<mjs.length;j++){
                var mj=mjs[j];
                mj.active=false;
                var sprite = mj.getComponent(cc.Sprite);
                sprite.spriteFFrame = null;
                this._folds[name].push(sprite);  
            }
        }
        */
    },
    hideChupai:function(){
        for(var i = 0; i < this._chupais.length;i++){
            this._chupais[i].node.active = false;
        }     
    },
    showChupai:function(){
        var pai = th.socketIOManager.chupai; 
        if( pai !=chupai){
            var localIndex = this.getLocalIndex(th.socketIOManager.turn);
            var sprite = this._chupais[localIndex];
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_",pai);
            sprite.node.active = true;   
        }
    },
    showAction:function(data){
        if(this.optionsWin.active){
            this.hideOptions();
        }
        if(data && (data.hu || data.gang || data.peng || data.chi)){
            this._options.active = true;
            if(data.hu){
                this.btnHu.node.active=true;
            }
            if(data.peng){
                this.btnChi.node.active=true;
            }
            if(data.chi){
                this.btnHu.node.active=true;
            }
            if(data.gang){
                for(var i = 0; i < data.gangpai.length;++i){
                    var gp = data.gangpai[i];
                    this.addOption("btnGang",gp);
                }
            }   
        }
    },
    initMahjongs:function(){
        var seats=th.socketIOManager.seats;
        var seat=seats[th.socketIOManager.seatIndex];
        var holds=seat.holds;
        cc.log("initPokers:",holds);
        //排序
        holds.sort(function(a,b){return a-b});
        for(var i=0;i<holds.length;i++){
            var pokerId=holds[i];
            var sprite=this._myHoldPokers[i];
            sprite.node.pokerId = pokerId;
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByPokerId(pokerId);
            sprite.node.active = true;
        }
        for(var i=0;i<seats.length;i++){
            this._seat[i].setRestCard(holds.length);
        }
    },
    
    /*
    update (dt) {
    },
    */

    hideOptions:function(data){
        this.optionsWin.active=false;
        var activeReadyBtn=th.socketIOManager.round==0&&!th.socketIOManager.isReady(th.userManager.userId)
        this.btnReady.node.active = activeReadyBtn;
        this.btnGang.node.active=false;
        this.btnPeng.node.active=false;
        this.btnChi.node.active=false;
        this.btnHu.node.active=false;
        this.btnGuo.node.active=false;
    },
  

});
