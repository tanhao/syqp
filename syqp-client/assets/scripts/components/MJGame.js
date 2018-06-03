cc.Class({
    extends: cc.Component,
    properties: {
        lblMjCount:cc.Label,
        lblFontMjCount:cc.Label,
        lblRoundCount:cc.Label,
        spriteCaishen:cc.Sprite,
        btnReady:cc.Button,
        chupaidian:cc.Sprite,
        settingWin:cc.Node,
        optionsWin:cc.Node,    ///所有可以做的操作节点
        nodePrepare:cc.Node,
        nodeGameInfo:cc.Node,

        _mymjs:[],      //自己手上的牌Sprite结合
        _effects:[],    //每个座位动画节点（Animation）
        _chupais:[],    //每个座位出牌节点（Sprite）
        _hupaiTips:[],  //每个座位胡牌提示节点:自摸，胡（抢杠胡）
    },
    onLoad () {
        if(th==null){ return; }
        this.addComponent("MJFolds");
        this.addComponent("MJChiPengGangs");
        this.addComponent("MJGameOver");
        this.addComponent("MJGameResult");
        this.addComponent("MJReConnect");
        this.initView();
        this.initEventHandlers();

        this.nodePrepare.active=true;
        this.nodeGameInfo.active=false;

        this.onGameBegin();
        th.audioManager.playBGM("bg_fight.mp3");
    },
    initView:function(){
        //把自己的牌都设置为null
        this.chupaidian.node.active=false;
        var myHolds = this.node.getChildByName('myself').getChildByName('Holds');
        for(var j=0;j<myHolds.children.length;j++){
                var sprite = myHolds.children[j].getComponent(cc.Sprite);
                sprite.node.active=false;
                this._mymjs.push(sprite);
                sprite.spriteFrame = null;
                //todo添加拖动效果
                this.initDragStuffs(sprite.node);
        }

        var realwidth = cc.director.getVisibleSize().width;
        myHolds.scaleX *= realwidth/1280;
        myHolds.scaleY *= realwidth/1280;  
        
        var sides = ["myself","right","up","left"];
        //隐藏其他玩家手上的牌
        for(var i=1;i<sides.length;i++){
            var mjs=this.node.getChildByName(sides[i]).getChildByName('Holds').children;
            for(var j=0;j<mjs.length;j++){
                var sprite = mjs[j].getComponent(cc.Sprite);
                sprite.node.active=false;
            }
        }
        for(var i=0;i<sides.length;i++){
            var seatNode=this.node.getChildByName(sides[i]);
            //出牌
            var spriteChupai=seatNode.getChildByName('Chupai').getComponent(cc.Sprite);
            spriteChupai.node.active=false;
            spriteChupai.spriteFrame = null;
            //胡牌NODE
            var nodeHupai=seatNode.getChildByName('Hupai');
            nodeHupai.active=false;
            if((i==2&&th.socketIOManager.seats.length==3)||((i==1||i==3)&&th.socketIOManager.seats.length==2)){
                continue;
            }
            //操作效果
            var animation=seatNode.getChildByName('Effect').getComponent(cc.Animation);
            this._effects.push(animation);
            this._chupais.push(spriteChupai);

            this._hupaiTips.push(nodeHupai);
            
        }
        this.hideOptions();
    },
    initEventHandlers:function(){
        var self=this;
        th.socketIOManager.dataEventHandler=this.node;
        //检查IP
        this.node.on('check_ip', function (data) {
            cc.log('==>MJGame check_ip:',JSON.stringify(data.detail));
            self.checkIp();
        });
        this.node.on('sync_push',function(data){
            self.onGameBegin();
            self.checkIp();
        });
        //自己准备返回
        this.node.on("ready_result",function(data){
            cc.log('==>Gmae ready_result:',JSON.stringify(data.detail));
            var seat=data.detail;
            self.btnReady.node.active = th.socketIOManager.round==0&&!seat.ready;
        })
        //玩家手上的牌
        this.node.on("holds_push",function(data){
            cc.log('==>Gmae holds_push:',JSON.stringify(data.detail));
            self.initMahjongs();
        })
        //开始游戏，出头的人
        this.node.on("begin_push",function(data){
            cc.log('==>Gmae begin_push:',JSON.stringify(data.detail));
            self.onGameBegin();
             //第一把开局，要检查IP
            if(th.socketIOManager.round == 1){
                cc.log("check ip ....");    
                //todo
            }
        })
        //断线
        this.node.on('disconnect', function (data) {
            cc.log('==>Gmae disconnect:',JSON.stringify(data.detail));
        });
        //通知还剩多少张牌
         this.node.on("mjsy_push",function(target){
            //cc.log('==>Gmae mjsy_push:',JSON.stringify(target.detail));
            self.lblMjCount.string="剩余 "+th.socketIOManager.mjsy+" 张";
            self.lblFontMjCount.string="x"+th.socketIOManager.mjsy;
        })
        //通知当前是第几局
        this.node.on("round_push",function(data){
            cc.log('==>Gmae round_push:',JSON.stringify(data.detail));
            self.lblRoundCount.string="剩余 "+(th.socketIOManager.config.round-th.socketIOManager.round)+" 局";
        })
        //通知财神是那个
        this.node.on("caishen_push",function(data){
            cc.log('==>Gmae caishen_push:',JSON.stringify(data.detail));
            self.setSpriteFrameByMJID("B_", self.spriteCaishen,th.socketIOManager.caishen);
        })
        this.node.on('begin_push',function(data){
            cc.log('==>Gmae begin_push:',JSON.stringify(data.detail));
            self.onGameBegin();
            //第一把开局，要提示
            if(th.socketIOManager.round == 1){
                cc.log("check ip ....");    
            }
        });
        this.node.on('chupai_push',function(data){
            cc.log('==>Gmae chupai_push:',JSON.stringify(data.detail));
            data = data.detail;
            self.hideChupai();
            if(data.last != th.socketIOManager.seatIndex){
                self.initMopai(data.last,null);   
            }
            //todo 回放
            if( data.turn != th.socketIOManager.seatIndex){
                self.initMopai(data.turn,-1);
            }
            
        });
        this.node.on('action_push',function(data){
            cc.log('==>Gmae action_push:',JSON.stringify(data.detail));
            self.showAction(data.detail);
        });
        //过，自己操做过返回结果
        this.node.on('guo_result',function(data){
            self.hideChupai();
        });
        //过牌，
        this.node.on('guo_notify_push',function(data){
            //cc.log('==>Gmae guo_notify_push:',JSON.stringify(data.detail));
            self.hideChupai();
            self.hideOptions();
            var seatData=data.detail;
            //如果是自己，则刷新手牌
            if(seatData.index ==th.socketIOManager.seatIndex){
                self.initMahjongs();                
            }
            th.audioManager.playSFX("give.mp3");
        });
        //吃牌
        this.node.on('chi_notify_push',function(data){
            cc.log('==>Gmae chi_notify_push:',JSON.stringify(data.detail));
            self.hideChupai();
            var seatData=data.detail;
            if(seatData.index == th.socketIOManager.seatIndex){
                self.initMahjongs();                
            }else{
                self.initOtherMahjongs(seatData);
            }
            var localIndex = th.socketIOManager.getLocalIndex(seatData.index);
            self.playEffect(localIndex,"play_chi");
            th.audioManager.playSFX("nv/chi.mp3");
            self.hideOptions();
        });
        //碰牌
        this.node.on('peng_notify_push',function(data){
            cc.log('==>Gmae peng_notify_push:',JSON.stringify(data.detail));
            self.hideChupai();
            var seatData=data.detail;
            if(seatData.index == th.socketIOManager.seatIndex){
                self.initMahjongs();                
            }else{
                self.initOtherMahjongs(seatData);
            }
            var localIndex = th.socketIOManager.getLocalIndex(seatData.index);
            self.playEffect(localIndex,"play_peng");
            th.audioManager.playSFX("nv/peng.mp3");
            self.hideOptions();
        });
        //杠牌
        this.node.on('gang_notify_push',function(data){
            cc.log('==>Gmae gang_notify_push:',JSON.stringify(data.detail));
            self.hideChupai();
            var seatData=data.detail;
            if(seatData.index == th.socketIOManager.seatIndex){
                self.initMahjongs();                
            }else{
                self.initOtherMahjongs(seatData);
            }
            //var localIndex = th.socketIOManager.getLocalIndex(seatData.index);
            //self.playEffect(localIndex,"play_gang");
            //th.audioManager.playSFX("nv/gang.mp3");
            self.hideOptions();
        });
        //喊杠
        this.node.on('hangang_notify_push',function(data){
            cc.log('==>Gmae hangang_notify_push:',JSON.stringify(data.detail));
            var seatIndex = th.socketIOManager.getSeatIndexById(data.detail.userId);
            var localIndex = th.socketIOManager.getLocalIndex(seatIndex);
            self.playEffect(localIndex,data.detail.gangType=="angang"?"play_angang":"play_gang");
            th.audioManager.playSFX("nv/gang.mp3");
            self.hideOptions();
        });
        //出牌
        this.node.on('chupai_notify_push',function(data){
            //cc.log('==>Gmae chupai_notify_push:',JSON.stringify(data.detail));
            self.hideChupai();
            var seatData = data.detail.seatData;
            if(seatData.index == th.socketIOManager.seatIndex){
                self.initMahjongs();                
            }else{
                self.initOtherMahjongs(seatData);
            }
            self.showChupai();
            var audioUrl = th.mahjongManager.getAudioURLByMJID(data.detail.pai);
            th.audioManager.playSFX(audioUrl);
        });
        //摸牌只有自己才会收到此消息
        this.node.on('mopai_push',function(data){
            self.hideChupai();
            data = data.detail;
            var pai = data.pai;
            var localIndex = th.socketIOManager.getLocalIndex(data.seatIndex);
            if(localIndex == 0){
                var index = 13;
                var sprite=self._mymjs[index];
                sprite.node.mjid = pai;
                self.setSpriteFrameByMJID("M_",sprite,pai);
                var gold_icon=sprite.node.getChildByName("gold_icon");
                gold_icon.active=pai==th.socketIOManager.caishen;

            }else if(false){
                //todo 重放
            }
        });
        //胡牌
        this.node.on('hu_push',function(data){
            cc.log('==>Gmae hu_push:',JSON.stringify(data.detail));

            var data = data.detail;
            var seatIndex = data.seatIndex;
            var localIndex =th.socketIOManager.getLocalIndex(seatIndex);
            var nodeHupai=self._hupaiTips[localIndex];
            nodeHupai.active=true;

            if(localIndex == 0){
                self.hideOptions();
            }
            var seatData = th.socketIOManager.seats[seatIndex];
            seatData.isHu = true;

            nodeHupai.getChildByName("hu").active = !data.isZimo;
            nodeHupai.getChildByName("zimo").active = data.isZimo;
            //todo 回放
            self.playEffect(localIndex,data.isZimo ? "play_zimo":"play_hu");
            th.audioManager.playSFX("nv/hu.mp3");
        });
        this.node.on('clean_push',function(){
            cc.log('==>Gmae clean_push:');
            //隐藏自己牌
            var sides = ["myself","right","up","left"];
            //隐藏其他玩家手上的牌
            for(var i=0;i<sides.length;i++){
                var seatNode=self.node.getChildByName(sides[i]);
                var mjs=seatNode.getChildByName('Holds').children;
                for(var j=0;j<mjs.length;j++){
                    var sprite = mjs[j].getComponent(cc.Sprite);
                    sprite.node.active=false;
                    sprite.spriteFrame = null;
                }

                //出牌
                var spriteChupai=seatNode.getChildByName('Chupai').getComponent(cc.Sprite);
                spriteChupai.node.active=false;
                spriteChupai.spriteFrame = null;
                //胡牌NODE
                var nodeHupai=seatNode.getChildByName('Hupai');
                nodeHupai.active=false;
            }
            self.nodeGameInfo.active=false;
            self.hideChupai();
            self.hideOptions();
        });
        this.node.on('repeat_login',function(){
            th.alert.show("提示","您的账号已在别处登录！",function(){
                th.wc.show('正在返回登录场景');
                cc.director.loadScene("login");
            },false);
        });

    },
    playEffect:function(index,name){
        this._effects[index].node.active = true;
        this._effects[index].play(name);
    },
    initDragStuffs:function(node){
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            
            if (th.socketIOManager.turn != th.socketIOManager.seatIndex) {
                return;
            }
            node.interactable = node.getComponent(cc.Button).interactable;
            if (!node.interactable) {
                return;
            }
            //cc.log("cc.Node.EventType.TOUCH_START");
            this.chupaidian.node.active=false;
            this.chupaidian.spriteFrame=node.getComponent(cc.Sprite).spriteFrame;
            this.chupaidian.node.x = event.getLocationX() - cc.director.getVisibleSize().width / 2;
            this.chupaidian.node.y = event.getLocationY() - cc.director.getVisibleSize().height / 2;

            var gold_icon=this.chupaidian.node.getChildByName("gold_icon");
            gold_icon.active=node.mjid==th.socketIOManager.caishen;

        }.bind(this));
        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (th.socketIOManager.turn != th.socketIOManager.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            if (Math.abs(event.getDeltaX()) + Math.abs(event.getDeltaY()) < 0.5) {
                return;
            }
            //cc.log("cc.Node.EventType.TOUCH_MOVE, Y:",event.getLocationY());
            this.chupaidian.node.active=true;
            node.opacity = 150;
            this.chupaidian.node.opacity = 255;
            this.chupaidian.node.scaleX = 1;
            this.chupaidian.node.scaleY = 1;
            this.chupaidian.node.x = event.getLocationX() - cc.director.getVisibleSize().width / 2;
            this.chupaidian.node.y = event.getLocationY() - cc.director.getVisibleSize().height / 2;
            node.y = 0;
        }.bind(this));
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (th.socketIOManager.turn != th.socketIOManager.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            //cc.log("cc.Node.EventType.TOUCH_END, Y:",event.getLocationY());
            this.chupaidian.node.active=false;
            node.opacity = 255;
            if (event.getLocationY() >= 100) {
                cc.log("chupai :",node.mjid);
                this.shoot(node.mjid);
            }
        }.bind(this));
        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            if (th.socketIOManager.turn != th.socketIOManager.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            //cc.log("cc.Node.EventType.TOUCH_CANCEL, Y:",event.getLocationY());
            if (event.getLocationY() >= 100) {
                this.chupaidian.node.active=false;
                node.opacity = 255;
                cc.log("chupai :",node.mjid);
                this.shoot(node.mjid);
            }else{
                this.chupaidian.node.active=false;
                node.opacity = 255;
            }
        }.bind(this));
        
    },
    onGameBegin:function(){
        //隐藏每个座位上的动画sprite
        for(var i = 0; i < this._effects.length; i++){
            this._effects[i].node.active = false;
        }

        //自摸胡判断
        for(var i = 0; i < th.socketIOManager.seats.length; i++){
            var seatData = th.socketIOManager.seats[i];
            var localIndex = th.socketIOManager.getLocalIndex(i); 
            var nodeHupai = this._hupaiTips[localIndex];
            nodeHupai.active = seatData.isHu;
            if(seatData.isHu){
                nodeHupai.getChildByName("hu").active = !seatData.isZimo;
                nodeHupai.getChildByName("zimo").active = seatData.isZimo;
            }
            //todo 如果有胡牌信息

        }
        //隐藏各座位出牌点
        this.hideChupai();
        //隐藏当前玩家所有操作（吃，碰，杠，胡，弃）
        this.hideOptions();
        
        this.btnReady.node.active = th.socketIOManager.status == "idle" && !th.socketIOManager.seats[th.socketIOManager.seatIndex].ready;
        
        //todo 判断是否回放  //&& cc.vv.replayMgr.isReplay() == false
        if(th.socketIOManager.status == "idle" ){
            return;
        }

        this.setSpriteFrameByMJID("B_", this.spriteCaishen,th.socketIOManager.caishen);
        this.lblRoundCount.string="剩余 "+(th.socketIOManager.config.round-th.socketIOManager.round)+" 局";
        this.lblMjCount.string="剩余 "+th.socketIOManager.mjsy+" 张";
        //初始化其他玩家手上的牌
        var sides = ["right","up","left"];        
        for(var i = 0; i < sides.length; ++i){
            var holds = this.node.getChildByName(sides[i]).getChildByName("Holds");
            for(var j = 0; j < holds.childrenCount; ++j){
                var nc = holds.children[j];
                nc.active = true;
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;
                var sprite = nc.getComponent(cc.Sprite); 
                sprite.spriteFrame =th.mahjongManager.holdsEmpty[i+1];
            }            
        }

        this.nodePrepare.active=false;
        this.nodeGameInfo.active=true;

        this.initMahjongs();

        //初始化其他玩家的牌
        for(var i = 0; i < th.socketIOManager.seats.length; i++){
            var seatData = th.socketIOManager.seats[i];
            var localIndex = th.socketIOManager.getLocalIndex(i);
            if(localIndex != 0){
                this.initOtherMahjongs(seatData);
                if(i == th.socketIOManager.turn){
                    this.initMopai(i,-1);
                }else{
                    this.initMopai(i,null);    
                }
            }
        }
        this.showChupai();
        if(th.socketIOManager.actions != null){
            this.showAction(th.socketIOManager.actions);
            th.socketIOManager.actions = null;
        }

    },
    onMJClicked:function(event){
        th.audioManager.playSFX("click.mp3");
        if(th.socketIOManager.turn != th.socketIOManager.seatIndex){
            return;
        }
        for(var i = 0; i < this._mymjs.length; ++i){
            if(event.target == this._mymjs[i].node){
                //如果是再次点击，则出牌
                if(event.target == this._selectedMJ){
                    cc.log("chupai :",this._selectedMJ.mjid);
                    this.shoot(this._selectedMJ.mjid); 
                    this._selectedMJ.y = 0;
                    this._selectedMJ = null;
                    return;
                }
                if(this._selectedMJ != null){
                    this._selectedMJ.y = 0;
                }
                event.target.y = 15;
                this._selectedMJ = event.target;
                return;
            }
        }
    },
    onOptionClicked:function(event){
        th.audioManager.playSFX("click.mp3");
        if(event.target.name == "btnPeng"){
            th.sio.send("peng");
        }else if(event.target.name == "btnGang"){
            th.sio.send("gang",event.target.pai);
        }else if(event.target.name == "btnHu"){
            th.sio.send("hu");
        }else if(event.target.name == "btnChi"){
            th.sio.send("chi",event.target.pais);
        }else if(event.target.name == "btnGuo"){
            if(th.socketIOManager.turn==th.socketIOManager.seatIndex){
                this.optionsWin.active = false;
            }
            th.sio.send("guo");
        }
    },
    //出牌
    shoot:function(mjid){
        if(mjid == null){
            return;
        }
        th.sio.send('chupai',mjid);
    },
    getMJIndex:function(side,index){
        if(side == "right" || side == "up"){
            return 13 - index;
        }
        return index;
    },
    initMopai:function(seatIndex,pai){
        var localIndex = th.socketIOManager.getLocalIndex(seatIndex);
        var side =th.mahjongManager.getSide(localIndex);
        var pre = th.mahjongManager.getFoldPre(localIndex);
        var holds = this.node.getChildByName(side).getChildByName("Holds");
        var lastIndex = this.getMJIndex(side,13);
        var nc = holds.children[lastIndex];

        nc.scaleX = 1.0;
        nc.scaleY = 1.0;
        if(pai == null){
            nc.active = false;
        }else if(pai >= 0){
            nc.active = true;
            //游戏回放时用到
            if(side == "up"){
                nc.scaleX = 0.73;
                nc.scaleY = 0.73;                    
            }
            var sprite = nc.getComponent(cc.Sprite); 
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre,pai);
        } else if(pai != null){
            nc.active = true;
            //UP方向正常抓牌是-1
            if(side == "up"){
                nc.scaleX = 1.0;
                nc.scaleY = 1.0;                    
            }
            var sprite = nc.getComponent(cc.Sprite); 
            sprite.spriteFrame = th.mahjongManager.getHoldsEmptySpriteFrame(side);
        }
    },
    hideChupai:function(){
        for(var i = 0; i < this._chupais.length;i++){
            this._chupais[i].node.active = false;
        }     
    },
    showChupai:function(){
        var pai = th.socketIOManager.chupai; 
        if( pai >=0){
            var localIndex = th.socketIOManager.getLocalIndex(th.socketIOManager.turn);
            var sprite = this._chupais[localIndex];
            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_",pai);
            sprite.node.active = true;

            var gold_icon=sprite.node.getChildByName("gold_icon");
            gold_icon.active=pai==th.socketIOManager.caishen;
        }
    },
    addOption:function(btnName,pai){
        var options=this.optionsWin.getChildByName('Options');
        for(var i = 0; i < options.childrenCount; i++){
            var option = options.children[i];
            if(option.name=='Option' && option.active==false){
                option.active=true;
                if(btnName!='btnChi'){
                    var sprite = option.getChildByName("opTarget1").getComponent(cc.Sprite);
                    sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_",pai);
                    sprite.node.active=true;
                    var btns=option.getChildByName('btns');
                    var btn = btns.getChildByName(btnName); 
                    btn.active = true;
                    btn.pai = pai;
                }else{
                    var pais=[];
                    for(var i=0;i<pai.length;i++){
                        if(pai[i]!=-1){
                            pais.push(pai[i]);
                            var sprite = option.getChildByName("opTarget"+(3-pais.length)).getComponent(cc.Sprite);
                            sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_",pai[i]);
                            sprite.node.active=true;
                        }
                    }
                    var btns=option.getChildByName('btns');
                    var btn = btns.getChildByName(btnName); 
                    btn.active = true;
                    btn.pais = pai.join(",");
                }
                break;
            }
        }
    },
    showAction:function(data){
        if(this.optionsWin.active){
            this.hideOptions();
        }
        //todo 
        if(data && (data.hu || data.gang || data.peng || data.chi)){
            this.optionsWin.active = true;
            if(data.hu){
                this.addOption("btnHu",data.huPai);
            }
            if(data.peng){
                this.addOption("btnPeng",data.pengPai);
            }
            if(data.chi){
                for(var i = 0; i < data.chiPai.length;++i){
                    var pais = data.chiPai[i];
                    this.addOption("btnChi",pais);
                }
            }
            if(data.gang){
                for(var i = 0; i < data.gangPai.length;++i){
                    var gp = data.gangPai[i];
                    this.addOption("btnGang",gp);
                }
            }   
        }
    },
    initMahjongs:function(){
        //手上麻将
        var seats=th.socketIOManager.seats;
        var seatData=seats[th.socketIOManager.seatIndex];
        var holds=seatData.holds;
        if(holds == null){
            return;
        }
        //排序
        holds=th.mahjongManager.sortHolds(holds);

        var lackingNum = (seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.bugangs.length +seatData.chis.length)*3;
        //初始化手牌
        for(var i=0;i<holds.length;i++){
            var mjid = holds[i];
            var sprite=this._mymjs[lackingNum+i];
            sprite.node.mjid = mjid;
            this.setSpriteFrameByMJID("M_",sprite,mjid);

            var gold_icon=sprite.node.getChildByName("gold_icon");
            gold_icon.active=mjid==th.socketIOManager.caishen;

            sprite.node.y=0;
        }
        for(var i = 0; i < lackingNum; i++){
            var sprite = this._mymjs[i]; 
            sprite.node.mjid = null;
            sprite.spriteFrame = null;
            sprite.node.active = false;
            sprite.node.y=0;
        }
        for(var i = lackingNum + holds.length; i < this._mymjs.length; ++i){
            var sprite = this._mymjs[i]; 
            sprite.node.mjid = null;
            sprite.spriteFrame = null;
            sprite.node.active = false;  
            sprite.node.y=0;          
        }
    },
    initOtherMahjongs:function(seatData){
        var localIndex = th.socketIOManager.getLocalIndex(seatData.index);
        if(localIndex == 0){
            return;
        }
        var side = th.mahjongManager.getSide(localIndex);
        var sideHolds = this.node.getChildByName(side).getChildByName("Holds");
        var lackingNum = (seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.bugangs.length +seatData.chis.length)*3;
        for(var i = 0; i < lackingNum; i++){
            var idx = this.getMJIndex(side,i);
            sideHolds.children[idx].active = false;
        }
        var pre = th.mahjongManager.getFoldPre(localIndex);
        var holds = th.mahjongManager.sortHolds(seatData.holds);
        if(holds != null && holds.length > 0){
            for(var i = 0; i < holds.length; i++){
                var idx = this.getMJIndex(side,i + lackingNum);
                var sprite = sideHolds.children[idx].getComponent(cc.Sprite);
                if(side == "up"){
                    sprite.node.scaleX = 0.73;
                    sprite.node.scaleY = 0.73;                    
                }
                sprite.node.active = true;
                sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre,holds[i]);
            }

            if(holds.length + lackingNum == 13){
                var lasetIdx = this.getMJIndex(side,13);
                sideHolds.children[lasetIdx].active = false;
            }
        }

    },

    setSpriteFrameByMJID:function(pre,sprite,mjid){
        sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID(pre,mjid);
        sprite.node.active = true;
    },
    hideOptions:function(data){
        this.optionsWin.active=false;
        var options=this.optionsWin.getChildByName('Options');
        for(var i = 0; i < options.childrenCount; i++){
            var option = options.children[i];
            if(option.name=='Option'){
                option.active=false;
                option.getChildByName('opTarget1').active=false;
                option.getChildByName('opTarget2').active=false;
                var btns=option.getChildByName('btns');
                btns.getChildByName('btnChi').active=false;
                btns.getChildByName('btnPeng').active=false;
                btns.getChildByName('btnGang').active=false;
                btns.getChildByName('btnHu').active=false;
            }
        }
    },
    checkIp:function(){
        cc.log('==>MJGame check_ip:');
    }
    /*
    update (dt) {
    },
    */
});
