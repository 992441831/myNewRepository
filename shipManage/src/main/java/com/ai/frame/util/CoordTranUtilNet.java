package com.ai.frame.util;

import net.sf.json.JSONObject;

/**
 * =========================================================
 * 
 * @Description:坐标转换工具类 互联网坐标转换工具集
 * @version V1.0 =========================================================
 */
public class CoordTranUtilNet {
	static double pi = 3.14159265358979323;// 数据圆周率
	static double a = 6378245.0;// 地球半径
	static double ee = 0.00669342162296594323;// 偏心率
	static double x_pi = pi * 3000.0 / 180.0;

	// 判断是否中国范围
	static boolean outOfChina(double lon, double lat) {
		if (lon < 72.004 || lon > 137.8347)
			return true;
		if (lat < 0.8293 || lat > 55.8271)
			return true;
		return false;
	}

	/**
	 * 经纬度转gcj-02坐标系 高德,谷歌等
	 * 
	 * @param wgLat
	 * @param wgLon
	 */
	public static GeoPoint wgs2gcj(double wgLon, double wgLat) {
		if (outOfChina(wgLon, wgLat)) {
			// System.out.println("你的坐标跑到国外去了！");
			return null;
		}
		double dLat = wgs2gcj_transformLat(wgLon - 105.0, wgLat - 35.0);
		double dLon = wgs2gcj_transformLon(wgLon - 105.0, wgLat - 35.0);
		double radLat = wgLat / 180.0 * pi;
		double magic = Math.sin(radLat);
		magic = 1 - ee * magic * magic;
		double sqrtMagic = Math.sqrt(magic);
		dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
		dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
		double mgLat = wgLat + dLat;
		double mgLon = wgLon + dLon;
		// 返回GCJ-02坐标系
		return new GeoPoint(mgLon, mgLat);
	}

	static double wgs2gcj_transformLat(double x, double y) {
		double ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
				+ 0.2 * Math.sqrt(Math.abs(x));
		ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
		ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
		return ret;
	}

	static double wgs2gcj_transformLon(double x, double y) {
		double ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
				* Math.sqrt(Math.abs(x));
		ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
		ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
				* pi)) * 2.0 / 3.0;
		return ret;
	}

	/**
	 * gcj-02坐标系(高德,谷歌等)到经纬度转换
	 * 
	 * @param gcjLon
	 * @param gcjLat
	 * @return
	 */
	public static GeoPoint gcj2wgs(double gcjLon, double gcjLat) {
		double initDelta = 0.01;
		double threshold = 0.000000001;
		double dLat = initDelta, dLon = initDelta;
		double mLat = gcjLat - dLat, mLon = gcjLon - dLon;
		double pLat = gcjLat + dLat, pLon = gcjLon + dLon;
		double wgsLat, wgsLon, i = 0;
		while (true) {
			wgsLat = (mLat + pLat) / 2;
			wgsLon = (mLon + pLon) / 2;
			GeoPoint geoPoint = wgs2gcj(wgsLon, wgsLat);
			dLat = geoPoint.getY() - gcjLat;
			dLon = geoPoint.getX() - gcjLon;
			if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold))
				break;

			if (dLat > 0)
				pLat = wgsLat;
			else
				mLat = wgsLat;
			if (dLon > 0)
				pLon = wgsLon;
			else
				mLon = wgsLon;

			if (++i > 10000)
				break;
		}
		GeoPoint retGeoPoint = new GeoPoint(wgsLon, wgsLat);
		return retGeoPoint;
	}

	/**
	 * GCJ-02 坐标系转百度坐标
	 * 
	 * @param x
	 * @param y
	 * @return
	 */
	public static GeoPoint gcj2baidu(double x, double y) {
		// gg_2_bd
		double bd_lon, bd_lat;
		double z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
		double theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
		bd_lon = z * Math.cos(theta) + 0.0065;
		bd_lat = z * Math.sin(theta) + 0.006;
		return new GeoPoint(bd_lon, bd_lat);
	}

	/**
	 * 百度坐标转换到GCJ-02坐标
	 * @param bd_lon
	 * @param bd_lat
	 * @return
	 */
	public static GeoPoint baidu2gcj(double bd_lon, double bd_lat) {
		// bd_2_gd
		double x = bd_lon - 0.0065;
		double y = bd_lat - 0.006;
		double z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
		double theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
		double gg_lon = z * Math.cos(theta);
		double gg_lat = z * Math.sin(theta);
		return new GeoPoint(gg_lon, gg_lat);
	}
	
	/**
	 * 经纬度转换到百度坐标
	 * @param lon
	 * @param lat
	 * @return
	 */
	public static GeoPoint wgs2baidu(double lon, double lat) {
		//wgs2gcj
		GeoPoint wgs2gcj = wgs2gcj(lon,lat);
		//gcj2bd
		GeoPoint gcj2bd = gcj2baidu(wgs2gcj.getX(),wgs2gcj.getY());
		return gcj2bd;
	}
	/**
	 * 百度坐标转换到经纬度
	 * @param lon
	 * @param lat
	 * @return
	 */
	public static GeoPoint baidu2wgs(double lon, double lat) {
		//baidu2gcj
		GeoPoint baidu2gcj = baidu2gcj(lon,lat);
		//gcj2bd
		GeoPoint gcj2wgs = gcj2wgs(baidu2gcj.getX(),baidu2gcj.getY());
		return gcj2wgs;
	}
	/**
	 * 百度09坐标转百度墨卡托坐标
	 * @author ZHANGJUN
	 * @param lon 百度09lon
	 * @param lat 百度09lat
	 * @return 百度墨卡托坐标
	 */
	public static GeoPoint baidu092baiduwc(double lon,double lat){
		double[] location = Baidu.convertLL2MC(lon, lat);
		GeoPoint baiduwc = new GeoPoint(location[0],location[1]);
		return baiduwc;
	}
	/**
	 * 百度墨卡托坐标转换百度09坐标
	 * @author ZHANGJUN
	 * @param x 百度墨卡托x
	 * @param y 百度墨卡托y
	 * @return 百度09坐标
	 */
	public static GeoPoint baiduwc2baidu09(double x,double y){
		double[] location= Baidu.convertMC2LL(x, y);
		GeoPoint baidu09 = new GeoPoint(location[0],location[1]);
		return baidu09;
	}
	/**
	 * GCJ02坐标转百度墨卡托坐标
	 * @author ZHANGJUN
	 * @param lon GCJ02lon
	 * @param lat GCJ02lat
	 * @return 百度墨卡托坐标
	 */
	public static GeoPoint gcj2baiduwc(double lon,double lat){
		GeoPoint baidu09 = gcj2baidu(lon,lat);//step1：将GCJ02坐标转换成百度09坐标
		GeoPoint baiduwc = baidu092baiduwc(baidu09.getX(),baidu09.getY());//step2：将百度09坐标转换到百度墨卡托坐标
		return baiduwc;
	}
	/**
	 * 百度墨卡托坐标转GCJ02坐标
	 * @author ZHANGJUN
	 * @param x 百度墨卡托x
	 * @param y 百度墨卡托y
	 * @return  GCJ02坐标
	 */
	public static GeoPoint baiduwc2gcj(double x,double y){
		double[] location= Baidu.convertMC2LL(x, y);//step1:将百度墨卡托坐标转换成百度09坐标
		GeoPoint gcj = baidu2gcj(location[0],location[1]);//step2：将百度09坐标转换成GCJ02坐标
		return gcj;
	}

	/**
	 * 将城地坐标转换为别的坐标系的经纬度。
	 * @param x
	 * @param y
	 * @param type
     * @return
     */
	public static GeoPoint cvtCitycoords2LonLat(String x, String y, int type)
	{
        //这里没写错 原来的X Y是反的
		String url = String.format("http://10.7.98.147:2539/cityxy2wgs84xy.aspx?x=%s&y=%s",y,x);
		int retry = 2;
		String json = null;
        //重试三次
		while(retry > 0)
		{
			json = HttpClientUtil.get(url);
			if(json != null)
				break;
			retry --;
		}
        if(json == null)
            return null;
		JSONObject jo = JSONObject.fromObject(json);
        int rescode = jo.getInt("resultcode");
        if (rescode == 1)
        {
            //wgs84坐标系的
            GeoPoint pnt = new GeoPoint(Double.parseDouble(jo.getString("lon")), Double.parseDouble(jo.getString("lat")));
            if(type == 1)
            {
                return pnt;
            }
            else if(type == 2)
            {
                return CoordTranUtilNet.wgs2baidu(pnt.getX(),pnt.getY());
            }
            else if(type == 3)
            {
                return CoordTranUtilNet.wgs2gcj(pnt.getX(),pnt.getY());
            }
        }
        else
        {
            return null;
        }
        return null;
	}

}
