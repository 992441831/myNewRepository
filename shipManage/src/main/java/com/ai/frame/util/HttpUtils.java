package com.ai.frame.util;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHeader;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.CoreConnectionPNames;
import org.apache.http.protocol.HTTP;
import org.apache.http.util.EntityUtils;

/**
 * @author ghoulguo
 * 
 */
public class HttpUtils {

	/**
	 * Http请求 GET方式
	 * 
	 * @param url
	 * @param paramMap
	 * @param timeout
	 * @param encodeStr
	 * @return
	 * @throws Exception
	 */
	public static String doGet(String url, Map paramMap, int timeout,
			String encodeStr) throws Exception {
		// 默认UTF-8
		String encode = "UTF-8";
		if (encodeStr != null && !"".equals(encodeStr)) {
			encode = encodeStr;
		}
		// 设置URL参数
		boolean prexfixFlag;
		if (url.indexOf("?") < 0) {
			url = url + "?";
			prexfixFlag = false;
		} else {
			prexfixFlag = true;
		}
		if (paramMap != null) {
			String paramStr = "";
			Iterator it = paramMap.keySet().iterator();
			while (it.hasNext()) {
				String key = (String) it.next();
				String value = String.valueOf(paramMap.get(key));
				if (prexfixFlag) {
					paramStr = key + "=" + value;
					prexfixFlag = false;
				} else {
					paramStr = paramStr + "&" + key + "=" + value;
				}
			}
			url = url + paramStr;
		}
		DefaultHttpClient httpclient = new DefaultHttpClient();
		HttpGet httpget = new HttpGet();

		String content = "";

		httpget.setURI(new java.net.URI(url));
		// 请求超时
		httpclient.getParams().setParameter(
				CoreConnectionPNames.CONNECTION_TIMEOUT, 10000);
		// 读取超时
		httpclient.getParams().setParameter(CoreConnectionPNames.SO_TIMEOUT,
				timeout);
		HttpResponse response = httpclient.execute(httpget);
		HttpEntity entity = response.getEntity();
		if (entity != null) {
			// 使用EntityUtils的toString方法，传递默认编码，在EntityUtils中的默认编码是ISO-8859-1
			content = EntityUtils.toString(entity, encode);
			httpget.abort();
			httpclient.getConnectionManager().shutdown();
		}
		return content;
	}

	/**
	 * HTTP请求 POST方式
	 * 
	 * @param url
	 * @param paramMap
	 * @param timeout
	 * @param encodeStr
	 * @return
	 * @throws Exception
	 */
	public static String doPost(String url, Map paramMap, int timeout,
			String encodeStr) throws Exception {
		// 默认UTF-8
		String encode = "UTF-8";
		if (encodeStr != null && !"".equals(encodeStr)) {
			encode = encodeStr;
		}
		HttpPost post = new HttpPost(url);
		// 连接超时时间
		post.getParams().setParameter(CoreConnectionPNames.CONNECTION_TIMEOUT,
				10000);
		// 读取超时时间
		post.getParams().setParameter(CoreConnectionPNames.SO_TIMEOUT, timeout);

		// 参数设置
		List<NameValuePair> nvps = new ArrayList<NameValuePair>();
		// nvps.add(new BasicNameValuePair("areaID", "2"));
		if (paramMap != null) {
			Iterator it = paramMap.keySet().iterator();
			while (it.hasNext()) {
				String key = (String) it.next();
				String value = String.valueOf(paramMap.get(key));
				nvps.add(new BasicNameValuePair(key, value));
			}
		}

		post.setEntity(new UrlEncodedFormEntity(nvps, encode));
		DefaultHttpClient client = new DefaultHttpClient();
		HttpResponse response = client.execute(post);
		HttpEntity entity = response.getEntity();
		String entityStr = EntityUtils.toString(entity);

		return entityStr;
	}
	public static String httpPostWithJSON(String url, String json) throws Exception {
		String APPLICATION_JSON = "application/json";

		String CONTENT_TYPE_TEXT_JSON = "text/json";
		// 将JSON进行UTF-8编码,以便传输中文
		String encoderJson =json; //URLEncoder.encode(json, HTTP.UTF_8);

		DefaultHttpClient httpClient = new DefaultHttpClient();
		HttpPost httpPost = new HttpPost(url);
		httpPost.addHeader(HTTP.CONTENT_TYPE, APPLICATION_JSON);

		StringEntity se = new StringEntity(encoderJson);
		se.setContentType(CONTENT_TYPE_TEXT_JSON);
		se.setContentEncoding(new BasicHeader(HTTP.CONTENT_TYPE, APPLICATION_JSON));
		httpPost.setEntity(se);
		HttpResponse response=httpClient.execute(httpPost);
		HttpEntity entity = response.getEntity();
		String entityStr = EntityUtils.toString(entity);

		return entityStr;
	}
}
