package org.cocos2dx.javascript.wxapi;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import org.cocos2dx.javascript.Wechat;

import com.tencent.mm.sdk.openapi.ConstantsAPI;
import com.tencent.mm.sdk.openapi.BaseReq;
import com.tencent.mm.sdk.openapi.BaseResp;
import com.tencent.mm.sdk.openapi.SendAuth;
import com.tencent.mm.sdk.openapi.IWXAPIEventHandler;
import com.th.tcqp.R;

public class WXEntryActivity extends Activity implements IWXAPIEventHandler {

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
        Wechat.iwxapi.handleIntent(getIntent(), this);
		finish();
	}

	@Override
	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
		setIntent(intent);
		Wechat.iwxapi.handleIntent(intent, this);
	}

	@Override
	public void onReq(BaseReq req) {
		Log.d("cocos2d-x debug info","Java:"+req.getType());
		switch (req.getType()) {
			case ConstantsAPI.COMMAND_GETMESSAGE_FROM_WX:
				Log.d("cocos2d-x debug info","==>COMMAND_GETMESSAGE_FROM_WX");
				break;
			case ConstantsAPI.COMMAND_SHOWMESSAGE_FROM_WX:
				Log.d("cocos2d-x debug info","==>COMMAND_SHOWMESSAGE_FROM_WX");
				break;
			default:
				break;
		}
		finish();
		
	}

	@Override
	public void onResp(BaseResp resp) {
		int result = 0;
		Log.d("cocos2d-x debug info","Java: onResp.errCode==>"+resp.errCode);
		switch (resp.errCode) {
			case BaseResp.ErrCode.ERR_OK:
				SendAuth.Resp tmpResp=(SendAuth.Resp) resp;
				if(tmpResp.state.equals(Wechat.State.Login)){
					//接收微信的请求及返回值 ,如果就登陆state,就回调到 Wechat-android.cpp的onLoginEvent方法，再回调到JS
					Log.d("cocos2d-x debug info","Java: onResp.token==>"+((SendAuth.Resp) resp).token);
					//Wechat.onLoginEvent(true, tmpResp.code);
				}
				result = R.string.errcode_success;
				finish();
				break;
			case BaseResp.ErrCode.ERR_COMM:
				result = R.string.errcode_comm;
				finish();
				break;
			case BaseResp.ErrCode.ERR_USER_CANCEL:
				result = R.string.errcode_cancel;
				finish();
				break;
			case BaseResp.ErrCode.ERR_SENT_FAILED:
				result = R.string.errcode_failed;
				finish();
				break;
			case BaseResp.ErrCode.ERR_AUTH_DENIED:
				result = R.string.errcode_deny;
				finish();
				break;
			case BaseResp.ErrCode.ERR_UNSUPPORT:
				result = R.string.errcode_unsupport;
				finish();
				break;
			default:
				result = R.string.errcode_unknown;
				finish();
				break;
		}
		Toast.makeText(this, result, Toast.LENGTH_LONG).show();
	}
	
	
}
