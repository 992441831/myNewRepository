package com.ai.frame.util;


public class Constant {
	public static final String STAFF_ID = "staffId";
	public static final String INIT_PASSWD = "abc123";
	public static final String USERKEY = "session_userinfo";
	public static final String ADD = "add";
	public static final String EDIT = "edit";
	public static final String MENU = "session_MENU";
	// 百度令牌
	public static String BAIDU_AK = "AZt2Af7Bhq2Xoz0tHGjfyisv";
	// GIS平台用令牌
	public static String GIS_TOKEN = "OSS_A1922C33E01511058CCA77801221";

	// 百度Place接口路径
	public static String BAIDU_Place_URL = String.valueOf(Config.getInstance()
			.getProperty("baidu_api_url")) + "/place/v2/search";


}