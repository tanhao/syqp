cc.Class({
    extends: cc.Component,

    properties: {
        _isGameEnd:false,
        _nodeGameOver:null,
        _nodeGameResult:null,
        _nodeSeats:[],
        _btnReady:null,
        _btnConfirm:null,
        _lblWin:null,
        _lblLose:null,
        _lblLiuju:null,
        _seats:[],
    },

    onLoad () {
        if(th == null){
            return;
        }
        this._nodeGameOver=this.node.getChildByName("game_over");
        this._nodeGameResult=this.node.getChildByName("game_result");
        this._lblWin = this._nodeGameOver.getChildByName("win");
        this._lblLose = this._nodeGameOver.getChildByName("lose");
        this._lblLiuju = this._nodeGameOver.getChildByName("liuju");
        var wanfa = this._nodeGameOver.getChildByName("wanfa").getComponent(cc.Label);
        wanfa.string = th.socketIOManager.getWanfa();

        var resustRoot = this._nodeGameOver.getChildByName("result_list");
        for(var i=1;i<=4;i++){
            var name="seat"+i;
            var nodeSeat = resustRoot.getChildByName(name);
            this._nodeSeats.push(nodeSeat);
            var viewData = {};
            viewData.username=nodeSeat.getChildByName('username').getComponent(cc.Label);
            viewData.winscore=nodeSeat.getChildByName('winscore').getComponent(cc.Label);
            viewData.losescore=nodeSeat.getChildByName('losescore').getComponent(cc.Label);
            viewData.reason=nodeSeat.getChildByName('reason').getComponent(cc.Label);
            viewData.zhuang = nodeSeat.getChildByName('zhuang');
            viewData.headImg= nodeSeat.getChildByName('head_clip').getChildByName('head_img').getComponent(cc.Sprite);
            viewData.mahjongs = nodeSeat.getChildByName('pai');
            viewData.chipenggang=nodeSeat.getChildByName("chipenggang");
            this._seats.push(viewData);
        }

        this._btnReady = cc.find("Canvas/game_over/btn_ready");
        if(this._btnReady){
            th.utils.addClickEvent(this._btnReady ,this.node,"MJGameOver","onBtnReadyClicked");
        }
        this._btnConfirm = cc.find("Canvas/game_over/btn_confirm");
        if(this._btnConfirm){
            th.utils.addClickEvent(this._btnConfirm,this.node,"MJGameOver","onBtnReadyClicked");
        }
        this._btnReady.active=true;
        this._btnConfirm.active=false;
        
        

        //初始化网络事件监听器
        var self = this;
        this.node.on('game_over',function(data){
            console.log("==>MJGameOver game_over",data.detail);
            self.onGameOver(data.detail);
        });

        this.node.on('game_end',function(data){  
            console.log("==>MJGameOver game_end",data.detail);
            self._isGameEnd = true;
            self._btnReady.active=false;
            self._btnConfirm.active=true;
        });
    },
    onGameOver(data){
        if(data.length == 0){
            this._nodeGameResult.active = true;
            return;
        }
        this._nodeGameOver.active = true;
        this._lblWin.active = false;
        this._lblLose.active = false;
        this._lblLiuju.active = false;

        var myScore=data[th.socketIOManager.seatIndex].score;
        if(myScore > 0){
            this._lblWin.active = true;
        }else if(myScore < 0){
            this._lblLose.active = true;
        }else{
            this._lblLiuju.active = true;
        }
        //显示玩家信息
        for(var i=0;i<4;i++){
            if(i>data.length-1){
                this._nodeSeats[i].active=false;
                continue;
            }
            this._nodeSeats[i].active=true;
            var seatView = this._seats[i];
            var userData = data[i];
            var actionArr = [];

            if(userData.isHu){
                var huInfo=userData.huInfo;
                var paixing=huInfo.paixing;
                if(paixing==1){
                    actionArr.push("正规七风13幺");
                }else if(paixing==2){
                    actionArr.push("正规13幺");
                }else if(paixing==3){
                    actionArr.push("非正规七风13幺");
                }else if(paixing==4){
                    actionArr.push("非正规13幺");
                }else if(paixing==5){
                    actionArr.push("7对");
                }else if(paixing==6){
                    actionArr.push("碰碰胡");
                }else if(paixing==7){
                    actionArr.push("平湖");
                }else if(paixing==8){
                    actionArr.push("三财神");
                }

                var action=huInfo.action;
                if(action==1){
                    actionArr.push("抢杠胡");
                }else if(action==2){
                    actionArr.push("杠上花");
                }else if(action==3){
                    actionArr.push("自摸");
                }

                if(huInfo.isDangDiao){
                    actionArr.push("单吊");
                }
                if(huInfo.isSanCaiShen){
                    actionArr.push("三财神");
                }
                if(huInfo.isCaiShenTou){
                    actionArr.push("财神头");
                }

                if(huInfo.isZiYiSe){
                    actionArr.push("字一色");
                }else if(huInfo.isQingYiSe){
                    actionArr.push("清一色");
                }else if(huInfo.isHunYiSe){
                    actionArr.push("混一色");
                }
            }

            seatView.username.string=th.socketIOManager.seats[i].name;
            seatView.reason.string=actionArr.join("、");
            seatView.zhuang.active = th.socketIOManager.bankerIndex==i;
            //seatView.headImg= nodeSeat.getChildByName('head_clip').getChildByName('head_img');
            var headImgUrl=th.socketIOManager.seats[i].headImgUrl;
            (function(seatView,headImgUrl){
                cc.loader.load({url: headImgUrl, type: 'jpg'}, function (err, texture) {
                    if(!err){
                        var headSpriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                        seatView.headImg.spriteFrame=headSpriteFrame;
                        seatView.headImg.node.setScale(2-(texture.width/94));
                    }
                });
            })(seatView,headImgUrl);
            if(userData.score>=0){
                seatView.winscore.string="+"+userData.score;
                seatView.winscore.node.active=true;
                seatView.losescore.node.active=false;
            }else{
                seatView.losescore.string=userData.score;
                seatView.losescore.node.active=true;
                seatView.winscore.node.active=false;
            }
            this.sortHolds(userData.holds);
            //隐藏所有牌
            for(var k = 0; k < seatView.mahjongs.childrenCount; k++){
                var mahjong = seatView.mahjongs.children[k];
                mahjong.active = false;
            }
            var lackingNum = (userData.pengs.length + userData.angangs.length + userData.diangangs.length + userData.bugangs.length +userData.chis.length)*3;
            //显示相关的牌
            if(userData.isHu){
                userData.holds.push(userData.huInfo.pai);
            }
            for(var k = 0; k < userData.holds.length; k++){
                var pai = userData.holds[k];
                var mahjong = seatView.mahjongs.children[k + lackingNum];
                mahjong.active = true;
                var sprite = mahjong.getComponent(cc.Sprite);
                sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("M_",pai);

                var gold_icon=sprite.node.getChildByName("gold_icon");
                gold_icon.active=pai==th.socketIOManager.caishen;
            }
            //隐藏吃碰杠
            for(var i=0;i<seatView.chipenggang.childrenCount;i++){
                seatView.chipenggang.children[i].active=false;
            }

            //初始化杠牌
            var index = 0;
            var gangs = userData.angangs;
            for(var k = 0; k < gangs.length; ++k){
                var info = gangs[k];
                this.initChiPengGang(seatView,index,info,"angang");
                index++;    
            }
            var gangs = userData.diangangs;
            for(var k = 0; k < gangs.length; ++k){
                var info = gangs[k];
                this.initChiPengGang(seatView,index,info,"diangang");
                index++;    
            }
            var gangs = userData.bugangs;
            for(var k = 0; k < gangs.length; ++k){
                var info = gangs[k];
                this.initChiPengGang(seatView,index,info,"bugang");
                index++;    
            }
            //初始化碰牌
            var pengs = userData.pengs
            if(pengs){
               for(var k = 0; k < pengs.length; ++k){
                   var info = pengs[k];
                   this.initChiPengGang(seatView,index,info,"peng");
                   index++;    
               }    
            }
            //初始化吃牌
            var chis = userData.chis
            if(chis){
               for(var k = 0; k < chis.length; ++k){
                   var info = chis[k];
                   this.initChiPengGang(seatView,index,info,"chi");
                   index++;    
               }    
            }
        }
 
    },
    initChiPengGang:function(seatView,index,info,flag){
        var nodeCPG = null;
        if(seatView.chipenggang.childrenCount <= index){
            nodeCPG = cc.instantiate(th.mahjongManager.pengPrefabSelf);
            seatView.chipenggang.addChild(nodeCPG)
        }else{
            nodeCPG = seatView.chipenggang.children[index];
            nodeCPG.active = true;
        }
        nodeCPG.active = true;
        nodeCPG.x = index * 55 * 3 + index * 10;
        var sprites = nodeCPG.getComponentsInChildren(cc.Sprite);
        if(flag=="angang"){
            for(var i = 0; i < sprites.length; i++){
                var sprite = sprites[i];
                if(sprite.node.name == "point_left" || sprite.node.name == "point_dui" || sprite.node.name == "point_right"){
                    sprite.node.active = false;
                }else{
                    if(sprite.node.name=="gang"){
                        sprite.node.active = true;
                        sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_",info.mjid);
                    }else{
                        sprite.node.active = true;
                        sprite.spriteFrame = th.mahjongManager.getEmptySpriteFrame("myself");
                    }
                }
            }
        }else if(flag=="diangang"||flag=="bugang"){
            for(var i = 0; i < sprites.length; i++){
                var sprite = sprites[i];
                if(sprite.node.name == "point_left" || sprite.node.name == "point_dui" || sprite.node.name == "point_right"){
                    sprite.node.active = false;
                }else{
                    sprite.node.active = true;
                    sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_",info.mjid);
                }
            }
        }else if(flag=="peng"){
            for(var i = 0; i < sprites.length; i++){
                var sprite = sprites[i];
                if(sprite.node.name == "point_left" || sprite.node.name == "point_dui" || sprite.node.name == "point_right"){
                    sprite.node.active = false;
                }else{
                    if(sprite.node.name == "gang"){
                        sprite.node.active = false;
                    }else{
                        sprite.node.active = true;
                        sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_",info.mjid);
                    }
                }
            }
            
        }else if(flag=="chi"){
            var idx=0;
            for(var i = 0; i < sprites.length; i++){
                var sprite = sprites[i];
                if(sprite.node.name == "point_left" || sprite.node.name == "point_dui" || sprite.node.name == "point_right"){
                    sprite.node.active = false;
                }else{
                    if(sprite.node.name == "gang"){
                        sprite.node.active = false;
                    }else{
                        sprite.node.active = true;
                        sprite.spriteFrame = th.mahjongManager.getSpriteFrameByMJID("B_",info.mjids[idx]);
                        idx+=1;
                    }
                }
               
            }
        }
    },
    onBtnReadyClicked:function(){
        console.log("onBtnReadyClicked");
        if(this._isGameEnd){
            this._nodeGameResult.active=true;
        }else{
            th.sio.send("ready"); 
        }
        this._nodeGameOver.active=false;
    },
    sortHolds:function(holds){
        if(holds==null){
            return holds;
        }
        holds.sort(function(a,b){
            var aa=a;
            var bb=b;
            if(aa==th.socketIOManager.caishen){
                aa=aa-100;
            }
            if(bb==th.socketIOManager.caishen){
                bb=bb-100;
            }
            return aa-bb;
        });
        return holds;
    },
    update (dt) {
    },
});
