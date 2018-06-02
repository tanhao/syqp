#ifndef __WECHAT_API_H__
#define __WECHAT_API_H__

#include "cocos2d.h"

typedef std::function<void(cocos2d::EventCustom *event)> EventCustomCallback;

//static const char kWechatShareEvent[] = "WechatShareEvent";
static const char kWechatLoginEvent[] = "WechatLoginEvent";

struct tagWechatLoginEvent {
    bool success;
    std::string token;
};

class WechatAPI
{
public:
    //============================================================================
    // 分享网页
    //============================================================================
    static bool shareWebpage(std::string urlStr,std::string title,std::string description,bool isTimelineCb);
    
    //============================================================================
    // 分享图片
    //============================================================================
    static bool shareImage(std::string imagePath,bool isTimelineCb);

    //============================================================================
    // 登陆
    //============================================================================
    static bool login(const EventCustomCallback& cb);


    //============================================================================
    // IOS 本地回调函数
    //============================================================================
    /*
    #if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
        static void onAudioRecordEvent(std::string path,double audioTime);
    #endif
    */
};

#endif // __sqlite_h__
