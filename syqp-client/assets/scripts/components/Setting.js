cc.Class({
    extends: cc.Component,

    properties: {
        effectSlider:cc.Slider,
        musicSlider:cc.Slider,
        effectProgressBar:cc.ProgressBar,
        musicProgressBar:cc.ProgressBar,
    },

    onLoad: function () {

    },

    // update: function (dt) {

    // },
    
    onEnable:function(){
        
        var bgm = cc.sys.localStorage.getItem("bgmVolume");
        if(bgm){
            th.audioManager.setBGMVolume(parseFloat(bgm));    
            this.musicSlider.progress=parseFloat(bgm);
            this.musicProgressBar.progress=parseFloat(bgm);
        }
        var sfx = cc.sys.localStorage.getItem("sfxVolume");
        if(sfx){
            th.audioManager.setSFXVolume(parseFloat(sfx));    
            this.effectSlider.progress=parseFloat(sfx);
            this.effectProgressBar.progress=parseFloat(sfx);
        }
        cc.log("bgm:",bgm,"sfx:",sfx);
    },

    onCloseClicked:function(){
        th.audioManager.playSFX("click.mp3");
        this.node.active = false;
    },

    onEffectSlide:function(target){
        th.audioManager.setSFXVolume(target.progress);
        this.effectProgressBar.progress=target.progress;
    },

    onMusicSlide:function(target){
        th.audioManager.setBGMVolume(target.progress);
        this.musicProgressBar.progress=target.progress;
    },

});
