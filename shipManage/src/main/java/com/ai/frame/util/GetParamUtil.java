package com.ai.frame.util;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.UnsupportedEncodingException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import java.net.URLDecoder;


public class GetParamUtil {


    private static final long serialVersionUID = 6357869213649815390L;
    /**
     * 从request中取出所有参数(单键值对形式),并返回Map
     *
     * @param request
     * @return
     */
    public static Map getRequestParamMap(HttpServletRequest request) {
        Map paramMap = new HashMap();
        Enumeration enu = request.getParameterNames();
        while (enu.hasMoreElements()) {
            String paramName = (String) enu.nextElement();
            String[] values = request.getParameterValues(paramName);
            for (int i = 0; i < values.length; i++) {
                try {
                    paramMap.put(paramName, URLDecoder.decode(values[i], "UTF-8"));
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
            }

        }
        return paramMap;
    }

    /**
     * 得到request对象
     */
    public HttpServletRequest getRequest() {
        HttpServletRequest request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
        return request;
    }

}
