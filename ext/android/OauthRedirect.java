package com.phonegap.plugins.oauthRedirect;

import org.json.JSONArray;
import org.json.JSONException;

import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

public class OauthRedirect extends Plugin {

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action        The action to execute.
     * @param args          JSONArry of arguments for the plugin.
     * @param callbackId    The callback id used when calling back into JavaScript.
     * @return              A PluginResult object with a status and message.
     */
    public PluginResult execute(String action, JSONArray args, String callbackId) {
        PluginResult.Status status = PluginResult.Status.OK;
        String result = "";

        try {
            if (action.equals("redirectTo")) {
                result = this.redirectTo(args.getString(0), args.optString(1));
                if (result.length() > 0) {
                    status = PluginResult.Status.ERROR;
                }
            }
            return new PluginResult(status, result);
        } catch (JSONException e) {
            return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
        }
    }

    /**
     * Identifies if action to be executed returns a value and should be run synchronously.
     *
     * @param action    The action to execute
     * @return          T=returns value
     */
    public boolean isSynch(String action) {
        return false;
    }

    /**
     * Called by AccelBroker when listener is to be shut down.
     * Stop listener.
     */
    public void onDestroy() {
    }

    //--------------------------------------------------------------------------
    // LOCAL METHODS
    //--------------------------------------------------------------------------

    /**
     * Display a new browser with the specified URL.
     * 
     * NOTE: If usePhoneGap is set, only trusted PhoneGap URLs should be loaded,
     *       since any PhoneGap API can be called by the loaded HTML page.
     *
     * @param url           The url to load.
     * @param usePhoneGap   Load url in PhoneGap webview.
     * @return              "" if ok, or error message.
     */
    
    class MyWebViewClient extends WebViewClient {
    	String stopRegexp;

    	MyWebViewClient(String stopRegexp) {
    		this.stopRegexp = stopRegexp;
    	}
    	
    	public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
			if(url.matches(stopRegexp)) {
				view.loadUrl("file:///android_asset/www/index.html");
			}
		}
    }

    public String redirectTo(String url, String regexp) {
    	this.webView.setWebViewClient(new MyWebViewClient(regexp));
    	this.webView.loadUrl(url);
    	return "";
    }

}