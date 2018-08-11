package com.ai.frame.util;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

public class JSONUtils {
	 /**
    *
    * @author JSON工具类
    * @param <T>
    *
    */
   
   /***
    * 将List对象序列化为JSON文本
    */
   public static <T> String toJSONString(List<T> list)
   {
       JSONArray jsonArray = JSONArray.fromObject(list);

       return jsonArray.toString();
   }
   
   /***
    * 将对象序列化为JSON文本
    * @param object
    * @return
    */
   public static String toJSONString(Object object)
   {
       JSONArray jsonArray = JSONArray.fromObject(object);

       return jsonArray.toString();
   }

   /***
    * 将JSON对象数组序列化为JSON文本
    * @param jsonArray
    * @return
    */
   public static String toJSONString(JSONArray jsonArray)
   {
       return jsonArray.toString();
   }

   /***
    * 将JSON对象序列化为JSON文本
    * @param jsonObject
    * @return
    */
   public static String toJSONString(JSONObject jsonObject)
   {
       return jsonObject.toString();
   }
   
   /***
    * 将对象转换为List对象
    * @param object
    * @return
    */
   public static List<Map> toArrayList(Object object)
   {
       List arrayList = new ArrayList();

       JSONArray jsonArray = JSONArray.fromObject(object);

       Iterator it = jsonArray.iterator();
       while (it.hasNext())
       {
           JSONObject jsonObject = (JSONObject) it.next();

           Iterator keys = jsonObject.keys();
           Map map = new HashMap();;
           while (keys.hasNext())
           {
               Object key = keys.next();
               Object value = jsonObject.get(key);
               if(value == null){
					map.put(key, "");
				}else{
					map.put(key, value);
				}
               map.put(key, value);
           }
           arrayList.add(map);
       }

       return arrayList;
   }

   /***
    * 将对象转换为Collection对象
    * @param object
    * @return
    */
   public static Collection toCollection(Object object)
   {
       JSONArray jsonArray = JSONArray.fromObject(object);

       return JSONArray.toCollection(jsonArray);
   }

   /***
    * 将对象转换为JSON对象数组
    * @param object
    * @return
    */
   public static JSONArray toJSONArray(Object object)
   {
       return JSONArray.fromObject(object);
   }

   /***
    * 将对象转换为JSON对象
    * @param object
    * @return
    */
   public static JSONObject toJSONObject(Object object)
   {
       return JSONObject.fromObject(object);
   }

   /***
    * 将对象转换为HashMap
    * @param object
    * @return
    */
   public static HashMap toHashMap(Object object)
   {
       HashMap<String, Object> data = new HashMap<String, Object>();
       JSONObject jsonObject = JSONUtils.toJSONObject(object);
       Iterator it = jsonObject.keys();
       while (it.hasNext())
       {
           String key = String.valueOf(it.next());
           Object value = jsonObject.get(key);
           data.put(key, value);
       }

       return data;
   }

   /***
    * 将对象转换为List<Map<String,Object>>
    * @param object
    * @return
    */
   // 返回非实体类型(Map<String,Object>)的List
   public static List<Map<String, Object>> toList(Object object)
   {
       List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
       JSONArray jsonArray = JSONArray.fromObject(object);
       for (Object obj : jsonArray)
       {
           JSONObject jsonObject = (JSONObject) obj;
           Map<String, Object> map = new HashMap<String, Object>();
           Iterator it = jsonObject.keys();
           while (it.hasNext())
           {
               String key = (String) it.next();
               Object value = jsonObject.get(key);
               map.put((String) key, value);
           }
           list.add(map);
       }
       return list;
   }

   /***
    * 将JSON对象数组转换为传入类型的List
    * @param <T>
    * @param jsonArray
    * @param objectClass
    * @return
    */
   public static <T> List<T> toList(JSONArray jsonArray, Class<T> objectClass)
   {
       return JSONArray.toList(jsonArray, objectClass);
   }

   /***
    * 将对象转换为传入类型的List
    * @param <T>
    * @param jsonArray
    * @param objectClass
    * @return
    */
   public static <T> List<T> toList(Object object, Class<T> objectClass)
   {
       JSONArray jsonArray = JSONArray.fromObject(object);

       return JSONArray.toList(jsonArray, objectClass);
   }
}
