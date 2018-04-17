cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad: function () {
    },

    // update: function (dt) {

    // },
    
    init:function(){
    },

    getBatteryPercent:function(){
        if(cc.sys.isNative){
            if(cc.sys.os == cc.sys.OS_ANDROID){
                return jsb.reflection.callStaticMethod(this.ANDROID_API, "getBatteryPercent", "()F");
            }
            else if(cc.sys.os == cc.sys.OS_IOS){
                return jsb.reflection.callStaticMethod(this.IOS_API, "getBatteryPercent");
            }            
        }
        return 0.9;
    },

});
