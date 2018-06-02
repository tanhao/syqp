#include "WechatAPI.h"
#include "Wechat.h"
#import <Foundation/Foundation.h>

#ifdef ANDROID
#define  LOG_TAG    "WechatAPI-ios.cpp"
#define  LOGD(...)  __android_log_print(ANDROID_LOG_DEBUG,LOG_TAG,__VA_ARGS__)
#else
#define  LOGD(...) js_log(__VA_ARGS__)
#endif

using namespace cocos2d;

#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)



//============================================================================
// 分享网页
//============================================================================
bool WechatAPI::shareWebpage(std::string urlStr,std::string title, std::string description, bool isTimelineCb)
{
    NSString *nsUrlStr= [NSString stringWithCString:urlStr.c_str() encoding:[NSString defaultCStringEncoding]];
    NSString *nsTitle= [NSString stringWithCString:title.c_str() encoding:[NSString defaultCStringEncoding]];
    NSString *nsDescription= [NSString stringWithCString:description.c_str() encoding:[NSString defaultCStringEncoding]];
    NSLog(@"WechatAPI.shareWebpage,urlStr: %@ , title: %@ , description: %@ ",nsUrlStr,nsTitle,nsDescription);
    return [[Wechat sharedInstance] shareWebpage:nsUrlStr Title:nsTitle Description:nsDescription IsTimelineCb:isTimelineCb];
}

//============================================================================
// 分享图片
//============================================================================
bool WechatAPI::shareImage(std::string imagePath, bool isTimelineCb)
{
    NSString *nsImagePath= [NSString stringWithCString:imagePath.c_str() encoding:[NSString defaultCStringEncoding]];
    NSLog(@"WechatAPI.shareImage,imagePath: %@",nsImagePath);
    return [[Wechat sharedInstance] shareImage:nsImagePath IsTimelineCb:isTimelineCb];
}

//============================================================================
// 登陆
//============================================================================
bool WechatAPI::login(const EventCustomCallback &cb)
{
    NSLog(@"WechatAPI.login");
    Director::getInstance()->getEventDispatcher()->addCustomEventListener(kWechatLoginEvent, cb);
    return [[Wechat sharedInstance] login];
}


//////////////////////////////////////////////////////////////////////////
// IOS 本地回调函数
void WechatAPI::onLoginEvent(bool success,std::string token){
    tagWechatLoginEvent* eventParam = new tagWechatLoginEvent;
    eventParam->success = success;
    eventParam->token = token;
    Director::getInstance()->getScheduler()->performFunctionInCocosThread([=]() mutable {
        Director::getInstance()->getEventDispatcher()->dispatchCustomEvent(kWechatLoginEvent, eventParam);
    });
}
#endif //(CC_TARGET_PLATFORM == CC_PLATFORM_IOS)

//////////////////////////////////////////////////////////////////////////
