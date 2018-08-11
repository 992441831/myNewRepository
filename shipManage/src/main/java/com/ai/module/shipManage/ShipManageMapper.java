package com.ai.module.shipManage;

import java.util.List;
import java.util.Map;

@SuppressWarnings("unchecked")
public interface ShipManageMapper {
    /**
     * 获取船舶基本信息
     * @author yc
     * @since 2018/8/4
     * */
    public List queryShip(Map paramMap);
    public int queryCount(Map paramMap);
    public Map queryShipByName(Map paramMap);

}
