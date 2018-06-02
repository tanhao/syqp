#include "WechatAPI.h"


#ifdef ANDROID
#define  LOG_TAG    "WechatAPI-android.cpp"
#define  LOGD(...)  __android_log_print(ANDROID_LOG_DEBUG,LOG_TAG,__VA_ARGS__)
#else
#define  LOGD(...) js_log(__VA_ARGS__)
#endif

using namespace cocos2d;

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)

const char kJavaWechatClass[] = "org/cocos2dx/javascript/Wechat";

//////////////////////////////////////////////////////////////////////////


//============================================================================
// 分享网页
//============================================================================
bool WechatAPI::shareWebpage(std::string urlStr,std::string title,std::string description,bool isTimelineCb)
{

    //cocos2d::log("Wechat-android==>>urlStr: %s      title: %s      description: %s      isTimelineCb: %s", urlStr.c_str(),title.c_str(),description.c_str(),(isTimelineCb?"yes":"no"));
    JniMethodInfo info;
    bool ret = JniHelper::getStaticMethodInfo(info, kJavaWechatClass, "shareWebpage", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)Z");
    if (ret) {
        //c++ -> java
        jstring jUrlStr = info.env->NewStringUTF(urlStr.c_str());
        jstring jTitle = info.env->NewStringUTF(title.c_str());
        jstring jDescription = info.env->NewStringUTF(description.c_str());
        return info.env->CallStaticBooleanMethod(info.classID, info.methodID,jUrlStr,jTitle,jDescription,isTimelineCb);
    }

    return false;
}

//============================================================================
// 分享图片
//============================================================================
bool WechatAPI::shareImage(std::string imagePath,bool isTimelineCb)
{

    //cocos2d::log("Wechat-android==>>imagePath: %s       isTimelineCb: %s", imagePath.c_str(),(isTimelineCb?"yes":"no"));
    JniMethodInfo info;
    bool ret = JniHelper::getStaticMethodInfo(info, kJavaWechatClass, "shareImage", "(Ljava/lang/String;Z)Z");
    if (ret) {
        //c++ -> java
        jstring jImagePath = info.env->NewStringUTF(imagePath.c_str());
        return info.env->CallStaticBooleanMethod(info.classID, info.methodID,jImagePath,isTimelineCb);
    }

    return false;
}

//============================================================================
// 登陆
//============================================================================
bool WechatAPI::login(const EventCustomCallback& cb)
{

    //添回微信登陆成功后回调监听
    cocos2d::Director::getInstance()->getEventDispatcher()->addCustomEventListener(kWechatLoginEvent, cb);

    JniMethodInfo info;
    bool ret = JniHelper::getStaticMethodInfo(info, kJavaWechatClass, "login", "()Z");
    if (ret) {
        return info.env->CallStaticBooleanMethod(info.classID, info.methodID);
    }
    return false;
}

//////////////////////////////////////////////////////////////////////////
// java 本地回调函数
extern "C"
{   

	JNIEXPORT void JNICALL Java_org_cocos2dx_javascript_Wechat_onLoginEvent(
                                                                             JNIEnv*  env, 
                                                                             jclass thiz, 
                                                                             jboolean success,
                                                                             jstring token
                                                                             )
    {
		tagWechatLoginEvent* eventParam = new tagWechatLoginEvent;
        eventParam->success = success;
		eventParam->token = JniHelper::jstring2string(token);
        cocos2d::Director::getInstance()->getScheduler()->performFunctionInCocosThread([=]() mutable {
			Director::getInstance()->getEventDispatcher()->dispatchCustomEvent(kWechatLoginEvent, eventParam);
        });
    }
}

#endif //(CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)

//////////////////////////////////////////////////////////////////////////
