#include "jsb_utils_wechatAPI.h"
#include "scripting/js-bindings/manual/cocos2d_specifics.hpp"
#include "cocos2d.h"
#include "WechatAPI.h"

//分享网页
bool jsb_utils_shareWebpage(JSContext *cx, uint32_t argc, jsval *vp){
	
    //共4个参数，1要分享的URL，2标题title，3说明description，4是否分享到朋友圈isTimelineCb
	//判断参数个数是否正确
    JSB_PRECONDITION2(argc == 4, cx, false, "Invalid number of arguments");
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);

	//把第一个参数url从JS string->std:string
	bool ok = true;
	std::string urlStr;
	ok &= jsval_to_std_string(cx, args[0], &urlStr);
	JSB_PRECONDITION2(ok, cx, false, "arguments 1 url processing Error");
	//把第二个参数title从js string->c++ std:string
	std::string title;
	ok &= jsval_to_std_string(cx, args[1], &title);
	JSB_PRECONDITION2(ok, cx, false, "arguments 2 title processing Error");
	//把第三个参数description从js  string->c++ std:string
	std::string description;
	ok &= jsval_to_std_string(cx, args[2], &description);
	JSB_PRECONDITION2(ok, cx, false, "arguments 3 description processing Error");
	//把第六个参数isTimelineCb从 js bool->c++ bool
	bool isTimelineCb = JS::ToBoolean(args.get(3));

	//cocos2d::log("jsb_utils_wechat==>>urlStr: %s      title: %s      description: %s      isTimelineCb: %s", urlStr.c_str(),title.c_str(),description.c_str(),(isTimelineCb?"yes":"no"));
	bool ret_val = WechatAPI::shareWebpage(urlStr,title,description,isTimelineCb);
	//JS调用 var isSuccess=jsb.wechatShareWebpage(urlStr,title,description,false);
	//这个返回值就是isSuccess接收到的值
	args.rval().setBoolean(ret_val);
	//这个返回的值是C++函数调用结果返回，必须返回true,不然JS调没反应
	return true;
}
//分享图片
bool jsb_utils_shareImage(JSContext *cx, uint32_t argc, jsval *vp){
	//共2个参数，1要分享的iamgePath，2是否分享到朋友圈isTimelineCb
	//判断参数个数是否正确
    JSB_PRECONDITION2(argc == 2, cx, false, "Invalid number of arguments");
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
   

	//把第一个参数url从JS string->std:string
	bool ok = true;
	std::string imagePath;
	ok &= jsval_to_std_string(cx, args[0], &imagePath);
	JSB_PRECONDITION2(ok, cx, false, "arguments 1 imagePath processing Error");
	//把第四个参数title从js string->c++ std:string
	bool isTimelineCb = JS::ToBoolean(args.get(1));

	
	//cocos2d::log("jsb_utils_wechat==>>imagePath: %s       isTimelineCb: %s",imagePath.c_str(),(isTimelineCb?"yes":"no"));
	bool ret_val = WechatAPI::shareImage(imagePath,isTimelineCb);
	//JS调用 var isSuccess=jsb.wechatShareImage(imagePath,false);
	//这个返回值就是isSuccess接收到的值
	args.rval().setBoolean(ret_val);
	//这个返回的值是C++函数调用结果返回，必须返回true,不然JS调没反应
	return true;
}
//微信登陆
bool jsb_utils_login(JSContext *cx, uint32_t argc, jsval *vp){
	 //共2个参数，1回调方法，2this
	//判断参数个数是否正确
    JSB_PRECONDITION2(argc == 2, cx, false, "Invalid number of arguments");
	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    //判断第0个参数（回调方法，JS传进来的）是否是个FUNCTION
	JSB_PRECONDITION2(JS_TypeOfValue(cx, args[0]) == JSTYPE_FUNCTION, cx, false, "arguments 1 processing Error");
    //把回调方法判定到JS运行环境
	JS::RootedValue cb(cx);
    JS::RootedObject target(cx);
    cb.set(args[0]);
    target.set(args[1].toObjectOrNull());

	//JS函数包装器
	std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, target, cb));
	//创建回调方法(用来传递到android或者ios)
	std::function<void(cocos2d::EventCustom *event)> callback;
	auto lambda = [=](cocos2d::EventCustom *event) -> void {
		JSB_AUTOCOMPARTMENT_WITH_GLOBAL_OBJCET
		cocos2d::Director::getInstance()->getEventDispatcher()->removeCustomEventListeners(kWechatLoginEvent);
		tagWechatLoginEvent* eventParam = (tagWechatLoginEvent*)event->getUserData();
		jsval val[2];
		val[0] = BOOLEAN_TO_JSVAL(eventParam->success);
		val[1] = std_string_to_jsval(cx,eventParam->token);
		JS::RootedValue rval(cx);
		func->invoke(2, val, &rval);
		delete eventParam;
	};
	callback = lambda;

	bool ret_val = WechatAPI::login(callback);
	//JS调用 var isSuccess=jsb.wechatLogin(function(success){}，this);
	//这个返回值就是isSuccess接收到的值
	args.rval().setBoolean(ret_val);
	//这个返回的值是C++函数调用结果返回，必须返回true,不然JS调没反应
	return true;
}

void register_jsb_wechatAPI(JSContext *_cx, JS::HandleObject global)
{
	JS::RootedObject ns(_cx);
	get_or_create_js_obj(_cx, global, "jsb", &ns);
	JS_DefineFunction(_cx, ns, "wechatShareWebpage", jsb_utils_shareWebpage, 3, JSPROP_READONLY | JSPROP_PERMANENT | JSPROP_ENUMERATE);
    JS_DefineFunction(_cx, ns, "wechatShareImage", jsb_utils_shareImage, 3, JSPROP_READONLY | JSPROP_PERMANENT | JSPROP_ENUMERATE);
	JS_DefineFunction(_cx, ns, "wechatLogin", jsb_utils_login, 3, JSPROP_READONLY | JSPROP_PERMANENT | JSPROP_ENUMERATE);
}