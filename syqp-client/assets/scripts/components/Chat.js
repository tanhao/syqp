cc.Class({
    extends: cc.Component,

    properties: {
        quickChatWin:cc.Node,
        emojiWin:cc.Node,
        _quickChatInfo:null,
    },

    // use this for initialization
    onLoad: function () {
        if(th == null){
            return;
        }
        th.chat = this;
        this.node.active=false;

        this._quickChatInfo = {};
        this._quickChatInfo["item1"] = {index:1,content:"打块点",sound:"Speak1.mp3"};
        this._quickChatInfo["item2"] = {index:2,content:"真会碰",sound:"Speak2.mp3"};
        this._quickChatInfo["item3"] = {index:3,content:"不搭牌",sound:"Speak3.mp3"};
        this._quickChatInfo["item4"] = {index:4,content:"暗杠碰没了",sound:"Speak4.mp3"};
        this._quickChatInfo["item5"] = {index:5,content:"牌太烂",sound:"Speak5.mp3"};
        this._quickChatInfo["item6"] = {index:6,content:"大对了哇",sound:"Speak6.mp3"};
        this._quickChatInfo["item7"] = {index:7,content:"抓张杠杠",sound:"Speak7.mp3"};
        this._quickChatInfo["item8"] = {index:8,content:"跟住",sound:"Speak8.mp3"};
        this._quickChatInfo["item9"] = {index:9,content:"流局",sound:"Speak9.mp3"};
        this._quickChatInfo["item10"] = {index:10,content:"要全包了",sound:"Speak10.mp3"};
        this._quickChatInfo["item11"] = {index:11,content:"要胡了",sound:"Speak11.mp3"};1
    },
    
    getQuickChatInfo(index){
        var key = "item" + index;
        return this._quickChatInfo[key];   
    },
    
    onBtnCloseChatWinClicked:function(){
        th.audioManager.playSFX("click.mp3");
        this.node.active=false;
    },

    onBtnToggleEmojiFastVoiceClicked:function(target,idx){
        th.audioManager.playSFX("click.mp3");
        if(1==parseInt(idx)){
            this.quickChatWin.active=true;
            this.emojiWin.active=false;
        }else{
            this.quickChatWin.active=false;
            this.emojiWin.active=true;
        }
    },
    onEmojiItemClicked:function(target,idx){
        th.audioManager.playSFX("click.mp3");
        this.node.active=false;
        th.sio.send("emoji",idx); 
        cc.log('onBtnEmojiClicked==>',idx);
    },
    onQuickChatItemClicked:function(target,idx){
        th.audioManager.playSFX("click.mp3");
        this.node.active=false;
        th.sio.send("quick_chat",idx); 
        cc.log('onBtnVoiceClicked==>',idx);
    },
    // update: function (dt) {

    // },
});
