package com.ai.module.shipManage;

import com.ai.frame.util.GetParamUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("unchecked")
@Controller
@RequestMapping("/module/shipManage")
public class ShipManageController {
    @Resource
    private ShipManageService shipManageService;

    /**
     * 获取船舶信息列表
     * @param request
     * @param response
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/queryShip.do",method = RequestMethod.GET)
    @ResponseBody
    public  Object queryShip(HttpServletRequest request,
                                         HttpServletResponse response) throws Exception {
        response.setHeader("Access-Control-Allow-Origin", "*");//允许其它链接跨域访问
        // 取查询条件
        Map paramMap =  GetParamUtil.getRequestParamMap(request);
        Map reusltMap = new HashMap();
        paramMap.put("pno",2);
        paramMap.put("pageSize",5);
        try{
            reusltMap = shipManageService.queryShip(paramMap);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return reusltMap;
    }

    /**
     * 根据船名获取船舶信息
     * @param request
     * @param response
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/queryShipByName.do",method = RequestMethod.GET)
    @ResponseBody
    public  Object queryShipByName(HttpServletRequest request,
                            HttpServletResponse response) throws Exception {
        response.setHeader("Access-Control-Allow-Origin", "*");//允许其它链接跨域访问
        Map reusltMap = new HashMap();
        // 取查询条件
        Map paramMap =  GetParamUtil.getRequestParamMap(request);
        try{
            reusltMap = shipManageService.queryShipByName(paramMap);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return reusltMap;
    }

}
