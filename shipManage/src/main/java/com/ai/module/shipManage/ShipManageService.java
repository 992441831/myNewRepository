package com.ai.module.shipManage;

import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("unchecked")
@Service
public class ShipManageService {
    @Resource
    private ShipManageMapper shipManageMapper;

    /**
     * 获取船舶基本信息列表
     * @author yc
     * @since 2018/8/4
     * */
    public Map queryShip(Map paramMap) {
        Map result = new HashMap();
        int pno = Integer.valueOf(paramMap.get("pno").toString());    //当前页码
        int pageSize = Integer.valueOf(paramMap.get("pageSize").toString());//页码显示记录条数
        int offset = (pno-1)*pageSize;
        paramMap.put("offset",offset);
        try{
            List list = shipManageMapper.queryShip(paramMap);
            int count = shipManageMapper.queryCount(paramMap);
            //Map shipObj = shipManageMapper.queryShipByName(paramMap);
            int pageCount = new Double(Math.ceil((count/(pageSize*1.0)))).intValue();

            result.put("list", list);
            result.put("pageCount", pageCount);
            result.put("pno", pno);
            result.put("pageSize", pageSize);

            result.put("status", 0);
        }catch(Exception e) {
            e.printStackTrace();
            result.put("status", -1);
        }
        return result;
    }
    /**
     * 根据名字获取船舶信息
     * @author yc
     * @since 2018/8/4
     * */
    public Map queryShipByName(Map paramMap) {
        Map result = new HashMap();
        try{
            Map shipObj = shipManageMapper.queryShipByName(paramMap);
            result.put("shipObj",shipObj);
            result.put("status", 0);
        }catch(Exception e) {
            e.printStackTrace();
            result.put("status", -1);
        }
        return result;
    }
}