"use strict";
cc._RF.push(module, '89ec8TY4OVDEL5X/J8nkwft', 'JoinRoom');
// scripts/components/JoinRoom.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        nums: {
            default: [],
            type: [cc.Label]
        },
        _inputIndex: 0
    },

    onLoad: function onLoad() {},

    // update: function (dt) {

    // },

    onEnable: function onEnable() {
        this.onResetClicked();
    },

    onResetClicked: function onResetClicked() {
        for (var i = 0; i < this.nums.length; ++i) {
            this.nums[i].string = "";
        }
        this._inputIndex = 0;
    },
    onDelClicked: function onDelClicked() {
        if (this._inputIndex > 0) {
            this._inputIndex -= 1;
            this.nums[this._inputIndex].string = "";
        }
    },
    onCloseClicked: function onCloseClicked() {
        this.node.active = false;
    },

    parseRoomID: function parseRoomID() {
        var str = "";
        for (var i = 0; i < this.nums.length; ++i) {
            str += this.nums[i].string;
        }
        return parseInt(str);
    },

    onInput: function onInput(target, num) {
        if (this._inputIndex >= this.nums.length) {
            return;
        }
        this.nums[this._inputIndex].string = num;
        this._inputIndex += 1;

        if (this._inputIndex == this.nums.length) {
            var roomId = this.parseRoomID();
            console.log("ok:" + roomId);
            this.onInputFinished(roomId);
        }
    },

    onInputFinished: function onInputFinished(roomId) {
        /*
        th.userManager.joinRoom(roomId,function(ret){
            if(ret.errcode == 0){
                this.node.active = false;
            }else{
                var content = "房间["+ roomId +"]不存在，请重新输入!";
                if(ret.errcode == 4){
                    content = "房间["+ roomId + "]已满!";
                }
                th.alert.show("提示",content);
                this.onResetClicked();
            }
        }.bind(this)); 
        */
        this.node.active = false;
        th.userManager.joinRoom(roomId);
    }

});

cc._RF.pop();