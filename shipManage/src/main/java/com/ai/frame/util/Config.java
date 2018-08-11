package com.ai.frame.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
/**
* 类描述/Class Description：负责读取jsbss.property中的配置数据
* 实现中用到算法
* 具体的使用环境及其他需要说明的地方。
* 可以使用<pre></pre><p><I>等Java Doc定义的类html的文档结构化语句
* 
* 负责人/principal： 
* 修改记录/revision：
*	日期：		修改人：		修改说明：
*   2009-08-31	 
*   
*/
public class Config {
	private static Config instance=null;
	Properties prop;

	public static synchronized Config getInstance()
	{
		if (instance==null)
		{
			instance=new Config();
		}
		return instance;
	}

	public Config()
	{
		prop= new Properties();
		try {
			InputStream stream=null;
			stream =this.getClass().getResourceAsStream("/config/gis.properties");
			prop.load(stream);
		}
		catch (IOException e) {
			e.printStackTrace();
		}
	}
	public String getProperty(String key)
	{

		return prop.getProperty(key);
	}
}
