package org.cocos2dx.javascript;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.math.BigDecimal;

import org.cocos2dx.javascript.*;

import com.tencent.mm.sdk.openapi.SendAuth;
import com.tencent.mm.sdk.openapi.SendMessageToWX;
import com.tencent.mm.sdk.openapi.WXImageObject;
import com.tencent.mm.sdk.openapi.WXMediaMessage;
import com.tencent.mm.sdk.openapi.WXWebpageObject;
import com.tencent.mm.sdk.openapi.IWXAPI;
import com.tencent.mm.sdk.openapi.WXAPIFactory;
import com.th.tcqp.R;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.util.Log;
import android.graphics.Bitmap.CompressFormat;

public class Wechat {
	
	// APP_ID 替换为你的应用从官方网站上就申请到的合法appId
	public static final String APP_ID="wx34900d33eaed55b3";
	//微信API接口
	public static IWXAPI iwxapi;
    //分享的图片缩略图大小
	protected static final int THUMB_SIZE = 120;
	//分享Webpage里要用到Resources
	private static  Resources resources;
	//分享Webpage里要用到Resources
	private static Resources getResources(){
		return resources;
	}
	//登陆状态
	public static final class State {
	    public static final String  Login="wechat_login";
	}
	//Java调用C++
    public static native void onLoginEvent(boolean success,String token);
    
    
    public static void regToWX(Context context){
    	Log.d("cocos2d-x debug info","Java:regToWX==>"+Wechat.APP_ID);
		//通过WXAPIFactory工厂，获取IWXAPI实例
    	Wechat.iwxapi = WXAPIFactory.createWXAPI(context, Wechat.APP_ID,true);
		//将应用的appId注册到微信
    	Wechat.iwxapi.registerApp(Wechat.APP_ID);
    	//分享Webpage里要用到Resources
    	resources=context.getResources();

    }
    
	//分享网页
	public static boolean shareWebpage(String url,String title,String description,boolean isTimelineCb) {
		Log.d("cocos2d-x debug info","Java:shareWebpage==>"+url+" | "+title+" | "+description+" | "+(isTimelineCb?"yes":"no"));
		if(!iwxapi.isWXAppInstalled()||!iwxapi.isWXAppSupportAPI()) {
			return false;
		}
		WXWebpageObject webpage = new WXWebpageObject();
		webpage.webpageUrl = url;
		WXMediaMessage msg = new WXMediaMessage(webpage);
		msg.title = title;
		msg.description = description;
		//分享时显示的图片
		Bitmap bmp = BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher);
		//压缩图片 
		Bitmap thumb=reduce(bmp,72, 72,true);
		msg.thumbData = bmpToByteArray(thumb, true);
		SendMessageToWX.Req req = new SendMessageToWX.Req();
		req.transaction = buildTransaction("webpage");
		req.message = msg;
		req.scene = isTimelineCb?SendMessageToWX.Req.WXSceneTimeline:SendMessageToWX.Req.WXSceneSession;
		iwxapi.sendReq(req);
		return true;
	}
	//分享图片
	public static boolean shareImage(String imagePath,boolean isTimelineCb) {
		try {
			Log.d("cocos2d-x debug info","Java:shareImage==>"+imagePath+" | "+(isTimelineCb?"yes":"no"));
			if(!iwxapi.isWXAppInstalled()||!iwxapi.isWXAppSupportAPI()) {
				return false;
			}
			File imageFile=new File(imagePath);
			if(!imageFile.exists()){
				Log.d("cocos2d-x debug info","image not exists!");
				return false;
			}
			InputStream is = new FileInputStream(imageFile);
			Bitmap bmp=BitmapFactory.decodeStream(is);
			WXImageObject imageObject = new WXImageObject(bmp);
			WXMediaMessage msg = new WXMediaMessage();
			msg.mediaObject = imageObject;
			Bitmap thumb=reduce(bmp,THUMB_SIZE, THUMB_SIZE,true);
			bmp.recycle();
			msg.thumbData = bmpToByteArray(thumb, true);
			SendMessageToWX.Req req = new SendMessageToWX.Req();
			req.transaction = buildTransaction("img");
			req.message = msg;
			req.scene = isTimelineCb?SendMessageToWX.Req.WXSceneTimeline:SendMessageToWX.Req.WXSceneSession;
			iwxapi.sendReq(req);
			return true;
		}catch (Exception e) {
			return false;
		}
	}
	//微信登陆
	public static boolean login() {
		Log.d("cocos2d-x debug info","Java:login==>");
		if(!iwxapi.isWXAppInstalled()||!iwxapi.isWXAppSupportAPI()) {
			return false;
		}
		final SendAuth.Req req = new SendAuth.Req();
		req.scope = "snsapi_userinfo";
		req.state = State.Login;
		iwxapi.sendReq(req);
		return true;
	}
	
	/** 
     * 压缩图片 
     * @param bitmap 源图片 
     * @param width 想要的宽度 
     * @param height 想要的高度 
     * @param isAdjust 是否自动调整尺寸, true图片就不会拉伸，false严格按照你的尺寸压缩 
     * @return Bitmap 
     */  
	public static Bitmap reduce(Bitmap bitmap, int width, int height, boolean isAdjust) {  
        // 如果想要的宽度和高度都比源图片小，就不压缩了，直接返回原图  
        if (bitmap.getWidth() < width && bitmap.getHeight() < height) {return bitmap;}  
        // 根据想要的尺寸精确计算压缩比例, 方法详解：public BigDecimal divide(BigDecimal divisor, int scale, int roundingMode);  
        // scale表示要保留的小数位, roundingMode表示如何处理多余的小数位，BigDecimal.ROUND_DOWN表示自动舍弃  
        float sx = new BigDecimal(width).divide(new BigDecimal(bitmap.getWidth()), 4, BigDecimal.ROUND_DOWN).floatValue();  
        float sy = new BigDecimal(height).divide(new BigDecimal(bitmap.getHeight()), 4, BigDecimal.ROUND_DOWN).floatValue();  
        if (isAdjust) {// 如果想自动调整比例，不至于图片会拉伸  
            sx = (sx < sy ? sx : sy);sy = sx;// 哪个比例小一点，就用哪个比例  
        }  
        Matrix matrix = new Matrix();  
        matrix.postScale(sx, sy);// 调用api中的方法进行压缩，就大功告成了  
        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);  
    }  
	
	/**
	 * 构造一个用于请求的唯一标识
	 * @param type 分享的内容类型
	 * @return 
	 */
	private static String buildTransaction(final String type) {
		return (type == null) ? String.valueOf(System.currentTimeMillis()): type + System.currentTimeMillis();
	}

	public static byte[] bmpToByteArray(final Bitmap bmp, final boolean needRecycle) {
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		bmp.compress(CompressFormat.PNG, 100, output);
		if (needRecycle) {
			bmp.recycle();
		}
		
		byte[] result = output.toByteArray();
		try {
			output.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return result;
	}
}
