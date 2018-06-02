package com.th.tcqp.wxapi;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.tencent.mm.sdk.openapi.BaseReq;
import com.tencent.mm.sdk.openapi.BaseResp;
import com.tencent.mm.sdk.openapi.ConstantsAPI;
import com.tencent.mm.sdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.sdk.openapi.SendAuth;
import com.th.tcqp.R;
import com.th.tcqp.Wechat;

import org.cocos2dx.lib.Cocos2dxHelper;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;


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
        Log.d("com.th.tcqp","Java:"+req.getType());
        switch (req.getType()) {
            case ConstantsAPI.COMMAND_GETMESSAGE_FROM_WX:
                Log.d("com.th.tcqp","==>COMMAND_GETMESSAGE_FROM_WX");
                // goToGetMsg();
                break;
            case ConstantsAPI.COMMAND_SHOWMESSAGE_FROM_WX:
                Log.d("com.th.tcqp","==>COMMAND_SHOWMESSAGE_FROM_WX");
                // goToShowMsg((ShowMessageFromWX.Req) req);
                break;
            default:
                break;
        }
        finish();

    }

    // 第三方应用发送到微信的请求处理后的响应结果，会回调到该方法
    @Override
    public void onResp(BaseResp resp) {
        int result = 0;
        Log.d("com.th.tcqp","Java resp.errCode===>>:"+resp.errCode);
        switch (resp.errCode) {
            case BaseResp.ErrCode.ERR_OK:
                if(resp instanceof  SendAuth.Resp){
                    final String token = ((SendAuth.Resp) resp).token;
                    Log.d("com.th.tcqp","Java Token===>>:"+token);
                    Cocos2dxHelper.runOnGLThread(new Runnable() {
                        @Override
                        public void run() {
                            Log.d("com.th.tcqp","===>Java Callback js onLoginResp:"+token);
                            Cocos2dxJavascriptJavaBridge.evalString("th.anysdkManager.onLoginResp('"+token+"')");
                        }
                    });
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
