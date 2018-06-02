#include "base/ccConfig.h"
#ifndef __utils_wechat_api_h__
#define __utils_wechat_api_h__

#include "jsapi.h"
#include "jsfriendapi.h"

#ifdef __cplusplus
extern "C" {
#endif

    //分享URL
	bool jsb_utils_shareWebpage(JSContext *cx, uint32_t argc, jsval *vp);
	//分享图片
	bool jsb_utils_shareImage(JSContext *cx, uint32_t argc, jsval *vp);
	//微信登陆
    bool jsb_utils_login(JSContext *cx, uint32_t argc, jsval *vp);

#ifdef __cplusplus
}
#endif


    void register_jsb_wechatAPI(JSContext *globalC, JS::HandleObject globalO);

#endif // __sqlite_h__
