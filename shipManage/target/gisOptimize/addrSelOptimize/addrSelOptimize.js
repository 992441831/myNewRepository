//定义地图
var aimap = null;
var map_ak = "";  //通过web服务接口鉴权接口获取令牌

var serachDelayTimer;
var cur_city = '杭州市'; //默认城市

var myTable;

var cur_zoom;   //当前地图等级
var overLayer;  //地图覆盖物
var circleLayer = null;    //圆形layer

var _errorLayerUrl=null;//告警基站
var _errorLayer=null;

var _baseLayerUrl=null;//所有基站
var _baseLayer=null;

var _lijingLayerUrl=null;//历经小区
var _lijingLayer=null;

var _eventLayerUrl=null;//重大事件
var _eventLayer=null;

var _pointLayerUrl=null;//申告地址
var _pointLayer=null;

$(document).ready(function () {
    $('#cityName').html(cur_city);

    $('#legend4error_layer_controller').hide();
    $('#legend4point_layer_controller').hide();

    $("#map").height($(window).height());//设置地图的高度
    initMap();
    addAreas();
    addListener();

    $('.filter-box').selectFilter({
        callBack : function (val){
            //返回选择的值
            console.log(val+'-是返回的值')
        }
    });

    $.datetimepicker.setLocale('ch');
    $('#datetimepicker').datetimepicker({
        formatTime:'H:i',
        formatDate:'d.m.Y',
        timepickerScrollbar:false
    });

    /*搜索框文字变化时
   * 延迟查询 免得拖死服务器
   **/
    $('#searchInput').bind('input propertychange', function () {
        // clearTimeout(serachDelayTimer);
        // serachDelayTimer = setTimeout(queryByAddressOrPoi,200)
        // $('#table-content').show(); //显示列表
        var addr_str = $('#searchInput').val();
        if (addr_str.length > 0)
        {

        } else {
            $('#table-content').hide();
            removeLayer();
        }
    });

    /*
    * input绑定键盘回车事件
    * */
    $('#searchInput').bind('keypress',function (e) {
        if (e.keyCode == '13'){
            queryByAddressOrPoi();
        }
    });

    /*点击table*/
    $('#dataTable tbody').on('click','tr td:nth-child(1)',function () {
        var data = myTable.api().row(this.parentNode).data();

        if (data){
            //删除其他点
            deletePoint(data.location);

            //以该店为中心 500米半径画圆
            drawCircleLayer(data.location, 500);

            $('#table-content').hide(); //隐藏列表
        }
    });

    /*table mouseover事件*/
    $('#dataTable tbody').on('mouseover','tr td:nth-child(1)',function () {
        var data = myTable.api().row(this.parentNode).data();
        if (data){
            //地图等级小于13的时候 触发时设置等级到17，否则不改变地图等级
            if (cur_zoom < 13){
                aimap.setView(data.location,17);
            } else {
                aimap.setView(data.location,cur_zoom);
            }

            //展示该点的信息
            var content = data.addr_full;
            var popup = Ai.Popup({minWidth:200,offset:[0, 0]})
                .setLatLng(data.location)
                .setContent(content)
                .openOn(aimap);

            addOnePointMarker(data,data.location);
        }
    });
});

/*添加选择地址*/
function addAreas() {
    var areaList = ['杭州市','湖州市','嘉兴市','金华市','丽水市','宁波市','绍兴市','台州市','温州市','舟山市','衢州市'];

    $.each(areaList,function (index,val) {
        var areaItem =$('<div class="city-style">' + val +'</div>');
        areaItem.click(function () {
            cur_city = val;
            $('#cityName').html(cur_city);
            aimap.centerAndZoom(cur_city);
            queryByAddressOrPoi();
        })
        $('#area_controller').append(areaItem);
    });
}

/*选择城市*/
function setAreaSelect(cityNode) {
    cur_city = cityNode.NAME;
    $('#cityName').html(cur_city);
    aimap.centerAndZoom(cur_city);
    queryByAddressOrPoi();
}

/*已知中心点、半径在地图上画圆*/
function drawCircleLayer(point,radius) {
   if (circleLayer){
       aimap.removeLayer(circleLayer);
   }
    circleLayer=Ai.Circle(point, {radius: radius});
    aimap.addLayer(circleLayer);
}

/*从多个点里删除特定的点*/
function deletePoint(point){
    overLayer.eachLayer(function (layer) {
        if(!(layer._latlng.lat == point[0] && layer._latlng.lng == point[1])){
            overLayer.removeLayer(layer);
        }
    });

}

/*poi检索*/
function queryByAddressOrPoi() {
    var addr_str = $('#searchInput').val();
    if (addr_str.length > 0)
    {
        // var type = $("#type option:selected").val();
        addTable(addr_str,cur_city);
    } else {
        $('#table-content').hide();
        removeLayer();
    }
}

/*初始化地图*/
function initMap() {
    if (aimap != null){
        aimap.remove();
    }
    aimap = new Ai.Map('map',{
        // mapId:"map",
        ak:map_ak,
        mapType:"bdmap",
    });
    var maplayer;
    //http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer//加载智图底图
    maplayer = Ai.TileLayer('http://192.168.74.195:8999/bdvector');
    aimap.addLayer(maplayer);
    aimap.setView([29.22,120.48], 8);//设置地图中心点和缩放级别


    Ai.Zoom({type:"large"}).addTo(aimap);


    //初始化网格图层
    // var wmsLayer = Ai.WMSLayer('http://192.168.74.198:8088/geoserver/cite/wms', {
    //     layers: 'cite:GEO_ZHEJIANG_BASE_STATION_2',
    //     format: 'image/png',
    //     transparent: true,
    //     crs:getWGS84CRS(),
    //     CQL_FILTER:"1=1"
    // });
    // aimap.addLayer(wmsLayer);

    _baseLayerUrl = 'cite:GEO_ZHEJIANG_BASE_STATION_2';
    _errorLayerUrl = 'cite:GEO_ERROR_STATION';
    _eventLayerUrl = 'cite:GR_IMPORTANT_ACTIVITIES';
    _pointLayerUrl = 'cite:GEO_COMPLAINTINFO';

    _baseLayer=addLyaerToMap(_baseLayerUrl,'基础图层',1,'base_layer_controller',1);
    addCheckEvent('base_layer_controller',[_baseLayer]);

    _errorLayer=addLyaerToMap(_errorLayerUrl,'告警图层',2,'error_layer_controller',1);
    addCheckEvent('error_layer_controller',[_errorLayer]);

    _eventLayer=addLyaerToMap(_eventLayerUrl,'重大事件',3,'event_layer_controller',0.75);
    addCheckEvent('event_layer_controller',[_eventLayer]);

    _pointLayer=addLyaerToMap(_pointLayerUrl,'申告地址',4,'point_layer_controller',1);
    addCheckEvent('point_layer_controller',[_pointLayer]);

    addCommunityPointsLayerToMap(_lijingLayerUrl,'经历小区',5,'lijing_layer_controller',1);

    aimap.on('click', function (e) {
        _errorLayer.identify({EPSG:4326,mapobj:aimap,callBackFun:showFeatureInfo}).run(e);

        _eventLayer.identify({EPSG:4326,mapobj:aimap,callBackFun:showEvevtInfo}).run(e);

        _pointLayer.identify({EPSG:4326,mapobj:aimap,callBackFun:showPointInfo}).run(e);
    });

    aimap.on('zoomend',function () {
        cur_zoom = aimap.getZoom();
    })
}
/*请求经历小区数据并添加到地图*/
function addCommunityPointsLayerToMap(layerUrl,layer_describle,index,layerControllerDomId,opacity) {
    var reqUrl = '../AddressController/queryThroughCommunity.do?time=12&telePhone=12343';
    $.ajax({
        type: 'GET',
        dataType: "json",
        url: reqUrl,
        success:function(result){
            if (result.status == 0) {
                // showSuccessTip(result.msg);
                _lijingLayer = new Ai.FeatureGroup();
                var myIcon1 = new Ai.Icon({
                    iconUrl: 'images/xiaoqu.png',
                    iconSize: [30, 45]
                });
                var markers = result.data;

                $.each(markers, function (index, val) {
                    var point = [val.y,val.x];
                    var marker =new Ai.Point(point, {icon: myIcon1});

                    _lijingLayer.addLayer(marker);

                    marker.addEventListener("click", function(e){
                        var content = val.community_name;
                        var popup = Ai.Popup({minWidth:200,offset:[0, 0]})
                            .setLatLng(point)
                            .setContent(content)
                            .openOn(aimap);
                    });
                });

                aimap.addLayer(_lijingLayer,index);

                addLayerController(_lijingLayer,layer_describle,layerControllerDomId);
                addCheckEvent('lijing_layer_controller',[_lijingLayer]);
            } else {
                showWarning(result.msg);
            }
        },
        error:function(error){
            showError('请求经历小区数据失败');
        }
    });
}

/*添加图层*/
function addLyaerToMap(layerUrl,layer_describle,index,layerControllerDomId,opacity){
    var layer = Ai.WMSLayer('http://192.168.74.198:8088/geoserver/cite/wms', {
        layers: layerUrl,
        format: 'image/png',
        transparent: true,
        crs:getWGS84CRS(),
        CQL_FILTER:"1=1"
    });

    layer.setOpacity(opacity);
    aimap.addLayer(layer,index);

    addLayerController(layer,layer_describle,layerControllerDomId);

    return layer;
}

function addLayerController(layer,layer_describle,layerControllerDomId){
    var controller;
    if($('#'+layerControllerDomId).html()==undefined){
        controller='<div id="'+layerControllerDomId+'">'+
            '<div class="checkbox i-checks" style="padding-left: 10px;">'+
            '<div style="padding-left: 0px;">'+
            '<input type="checkbox" value="" /> <i></i>'+layer_describle+
            '</div>'+
            '</div>'+
            '</div>';
        $("#layer_controller_li").append(controller);
        $("#"+layerControllerDomId+" .i-checks").iCheck({checkboxClass: "icheckbox_square-green", radioClass: "iradio_square-green"}).iCheck('uncheck');
    }
}

/*绑定check*/
function addCheckEvent(layerControllerDomId,layers) {
    if($('#'+layerControllerDomId+' input').is(':checked')){
        for(var i in layers){
            setShowLayers(layers[i]);
        }
        $('#legend4'+layerControllerDomId).show();
    }else{
        for(var i in layers){
            hideLayers(layers[i]);
        }
        $('#legend4'+layerControllerDomId).hide();
    }
    $('#'+layerControllerDomId+' input').on('ifChecked', function(event){
        for(var i in layers){
            setShowLayers(layers[i]);
        }
        $('#legend4'+layerControllerDomId).show();
    });

    $('#'+layerControllerDomId+' input').on('ifUnchecked', function(event){
        for(var i in layers){
            hideLayers(layers[i]);
        }
        $('#legend4'+layerControllerDomId).hide();
    });
}

/*展示图层*/
function setShowLayers(layer){
    // layer.setVisibility(true);
    aimap.addLayer(layer);
    // layer.setOpacity(1);
}

/*隐藏图层*/
function hideLayers(overLayer){
    // layer.setVisibility(false);
    aimap.removeLayer(overLayer);
    // layer.setOpacity(0);
}

/*展示告警基站信息**********/
function showFeatureInfo(data,e,feaType){
    console.log(data);
    if (data.features.length > 0){
        var point = data.features[0].geometry.coordinates;
        var infoData = data.features[0].properties;
//331150
        if (infoData.ENMID){
            var url = '../AddressController/queryErrorBaseStationInfo.do?id='+ infoData.ENMID;
            $.get(url,function (result, status) {
                if ('success' == status){
                    var stationData = result.data;
                    var content;
                    /*如果能获取到扇区信息加载扇区信息，不能获取到就加载基站默认的错误信息*/
                    if (stationData.length > 0){
                        content = getSectionInfoContent(infoData,stationData);
                    } else {
                        content = getInfoContentWraper(infoData);
                    }
                    var popup = Ai.Popup({minWidth:300,offset:[0, 0]})
                        .setLatLng({lat:point[1],lng:point[0]})
                        .setContent(content)
                        .openOn(aimap);
                } else {
                    showError('请求错误'+ status);
                }
            },"json");
        } else {
            var content = getInfoContentWraper(infoData);
            var popup = Ai.Popup({minWidth:300,offset:[0, 0]})
                .setLatLng({lat:point[1],lng:point[0]})
                .setContent(content)
                .openOn(aimap);
        }
    } else {
        $('#stationDiv').empty();
        $("#stationDiv").css("display","none");
    }
}

function getSectionInfoContent(data,datalist) {
    var content ='<div class="infowindow-body">'
        + '<div id="infowindow_header">'
        +'<div id="info_name" class="infowindow-head" contentIndex=0>基站告警信息</div>'
        +'</div>'
        +'<div id="infowindow_base">'
        +'<div class="infowindow-text" id="buildDetail">'
        + '基站名称：' + data.BASE_STATION_NAME
        +'</div>'
        +'<div class="infowindow-text" id="buildDetail">'
        + '基站编号：' + data.BASE_STATION_CODE
        +'</div>'
        +'<div class="infowindow-text" id="buildDetail">'
        + '基站地址：' + data.ADDRESS_NAME
        +'</div>'
        +'</div>'
        + '</div>';

    for(var i = 0;i<datalist.length;i++){
        var data = datalist[i];
        var item = '<div>' +
            '<div style="background: grey;padding: 0.5px;margin: 10px -15px"></div>' +
            '<div id="">' +
            '<div class="infowindow-text" id="">' + '扇区名称：' + data.SECTION_NAME + '</div>' +
            '<div class="infowindow-text" id="">' + '扇区编号：' + data.SECTION_CODE + '</div>' +
            '<div class="infowindow-text" id="">' + '告警开始时间：' + data.ERROR_DATE + '</div>' +
            '<div class="infowindow-text" id="">' + '告警类型：' + data.ERROR_TYPE + '</div>' +
            '</div>' +
            '</div>'

        content += item;
    }
    return content;
}

function getInfoContentWraper(data){
    var content ='<div class="infowindow-body">'
        + '<div id="infowindow_header">'
        +'<div id="info_name" class="infowindow-head" contentIndex=0>基站告警信息</div>'
        +'</div>'
        +'<div id="infowindow_base">'
        +'<div class="infowindow-text" id="buildDetail">'
        + '基站地址：' + data.ADDRESS_NAME
        +'</div>'
        +'<div class="infowindow-text" id="buildDetail">'
        + '基站名称：' + data.BASE_STATION_NAME
        +'</div>'
        +'<div class="infowindow-text" id="buildDetail">'
        + '基站编号：' + data.BASE_STATION_CODE
        +'</div>'
        +'<div class="infowindow-text" id="buildDetail">'
        + '告警开始时间：' + data.ERROR_START_DATE
        +'</div>'
        +'<div class="infowindow-text" id="buildDetail">'
        + '告警类型：' + data.ERROR_TYPE
        +'</div>'
        +'</div>'
        + '</div>';

    return content;
}
/**************************/

/*展示申告基站信息*/
function showPointInfo(data) {
    if (data.features.length > 0) {
        var point = data.features[0].geometry.coordinates;
        var infoData = data.features[0].properties;

        var content ='<div class="infowindow-body">'
            + '<div id="infowindow_header">'
            +'<div id="info_name" class="infowindow-head" contentIndex=0>申告点信息</div>'
            +'</div>'
            +'<div id="infowindow_base">'
            +'<div class="infowindow-text" id="buildDetail">'
            + '申告地址：' + infoData.COMPLAINT_ADDRESS
            +'</div>'
            +'<div class="infowindow-text" id="buildDetail">'
            + '申告信息：' + infoData.COMPLAINT_INFO
            +'</div>'
            +'</div>'
            + '</div>';
        var popup = Ai.Popup({minWidth:300,offset:[0, 0]})
            .setLatLng({lat:point[1],lng:point[0]})
            .setContent(content)
            .openOn(aimap);
    }
}

/*展示重大事件信息*/
function showEvevtInfo(data) {
    if (data.features.length > 0) {
        var point = data.features[0].geometry.coordinates[0][0];
        var infoData = data.features[0].properties;

        var content ='<div class="infowindow-body">'
            + '<div id="infowindow_header">'
            +'<div id="info_name" class="infowindow-head" contentIndex=0>重大事件预警点</div>'
            +'</div>'
            +'<div id="infowindow_base">'
            +'<div class="infowindow-text" id="buildDetail">'
            + '预警地址：' + infoData.ACT_ADDR
            +'</div>'
            +'<div class="infowindow-text" id="buildDetail">'
            + '预警名称：' + infoData.ACT_NAME
            +'</div>'
            +'<div class="infowindow-text" id="buildDetail">'
            + '影响时间：' + infoData.BEGIN_TIME + '至'+ infoData.END_TIME
            +'</div>'
            +'</div>'
            + '</div>';
        var popup = Ai.Popup({minWidth:300,offset:[0, 0]})
            .setLatLng({lat:point[1],lng:point[0]})
            .setContent(content)
            .openOn(aimap);
    }
}

/*快速查询地址列表*/
function addTable(key,city) {
    var url = '../AddressController/fuzzyQueryAddress.do?addr_full=' + key +'&city=' + city;
    $.get(url,function (result, status) {
        if ('success' == status){
            console.log(result);
            //检索成功展示列表
            $('#table-content').show();
            var resultData = [];
            if (result.data){
                resultData = result.data;
            }

            var points = [];
            $.each(resultData, function (index, val) {
                if (val.location){
                    points.push(val.location);
                }
            });

            // addOverlayerMarkers(resultData,points);

            createTable(resultData);
        }
    },"json");
}

/*在地图上添加单个点*/
function addOnePointMarker(data,marker) {
    removeLayer();

    overLayer = new Ai.FeatureGroup();
    var myIcon1 = new Ai.Icon({
        iconUrl: 'images/marker.png',
        iconSize: [20, 30]
    });

    var marker =new Ai.Point(marker, {icon: myIcon1});

    marker.addEventListener("click", function(e){
        var content = showSubmitView(data);
        var popup = Ai.Popup({minWidth:300,offset:[0, 0]})
            .setLatLng(data.location)
            .setContent(content)
            .openOn(aimap);

        aimap.setView(data.location);
    });

    overLayer.addLayer(marker);

    aimap.addLayer(overLayer);
}

/*添加地图覆盖物*/
function addOverlayerMarkers(mydata,markers) {
    removeLayer();
    // if(overGrid){
    //     overGrid.eachLayer(function (layer) {
    //         overGrid.removeLayer(layer);
    //     })
    // }
    // //查询周边，清除周边覆盖物
    // if(overAround){
    //     overAround.eachLayer(function (layer) {
    //         overAround.removeLayer(layer);
    //     })
    // }
    overLayer = new Ai.FeatureGroup();
    var myIcon1 = new Ai.Icon({
        iconUrl: '../images/marker.png',
        iconSize: [36, 36]
    });

    $.each(markers, function (index, val) {
        var marker =new Ai.Point(val, {icon: myIcon1});

        marker.addEventListener("click", function(e){
            $.each(mydata, function (index1, myval) {
                if (myval.location){
                    if(e.latlng.lat==myval.location[0] &&e.latlng.lng==myval.location[1]){
                        addr_full="";
                        addr_full=myval.addr_full;
                        aroundData=null;
                        aroundData=mydata[index1];

                        var content = showSubmitView(aroundData);
                        var popup = Ai.Popup({minWidth:300,offset:[0, 0]})
                            .setLatLng(aroundData.location)
                            .setContent(content)
                            .openOn(aimap);
                    }
                }

            });

            // aimap.setView(aroundData.location);
        });

        marker.addEventListener("mouseover", function(e){
            $.each(mydata, function (index1, myval) {
                if(e.latlng.lat==myval.location[0] &&e.latlng.lng==myval.location[1]){
                    addr_full="";
                    addr_full=myval.addr_full;
                    aroundData=null;
                    aroundData=mydata[index1];
                }
            });

            //先清空内容
            $('#myDiv').empty();

            var  xOffset = 10;//layerPoint
            var  yOffset = 15;
            $("#myDiv").css("display","block").css("position","absolute").css("top",(e.containerPoint.y- yOffset) + "px").css("left",(e.containerPoint.x + xOffset) + "px");
            $("#myDiv").append(addr_full+'<br>');
        });
        marker.addEventListener("mouseout", function(){
            $('#myDiv').empty();
            $("#myDiv").css("display","none");
        });

        overLayer.addLayer(marker);
    });

    aimap.addLayer(overLayer);

    if (markers[0]) {
        aimap.setView(markers[0], 17);
    }
}

/*移除地图覆盖物*/
function removeLayer() {
    if (overLayer){
        overLayer.eachLayer(function (layer) {
            overLayer.removeLayer(layer);
        })
    }
    if (circleLayer){
        aimap.removeLayer(circleLayer);
    }
}

/*展示申告内容输入界面*/
function showSubmitView(info) {
    var addr_full = info.addr_full;
    var loc = info.location;
    var x = loc[1];
    var y = loc[0];
    var inputContent =
        '<div id="infowindow_header">'
        +'<div id="info_name" class="infowindow-head" contentIndex=0>申告地址填写</div>'
        +'</div>'
        + '<div>' +
        '<div style="color: #0078ff">申告地址</div>' +
        '<input type="text" id="add_text" placeholder="请输入地址"  style="height: 25px;width: 100%;border: 1px solid #0078ff" value='+ addr_full +'>'+
        '<div style="color: #0078ff">申告内容</span> </div>' +
        '<textarea name="text1" id="add_content" rows="4" placeholder="请输入申告内容" style="height: 100px;width: 100%;resize: none;border: 1px solid #0078ff"></textarea>' +
        '<div style="color: #0078ff">备注信息</div>' +
        '<textarea name="text2" id="add_remarks" rows="2" placeholder="请输入备注信息" style="height: 50px;width: 100%;resize: none;border: 1px solid #0078ff"></textarea>'+
        '<div style="background: #0078ff;color: white;text-align: center; height: 25px;width: 100px;line-height: 25px;position: relative;left: 200px;" onclick="submitInfo(' + x + ','+ y +')">提交</div>' +
        '</div>'
    return inputContent;
}

/*提交申告信息*/
function submitInfo(x,y) {
    var str1 = $('#add_text').val();
    var str2 = $('#add_content').val();
    var str3 = $('#add_remarks').val();

    if (str1.length == 0){
        showWarning('地址不能为空');
        return;
    }
    if (str2.length == 0){
        showWarning('请输入具体的申告内容');
        return;
    }

    var reqUrl = "../AddressController/insertComplaint.do?complaint_address=" + str1 + '&complaint_info=' + str2 + '&remarks=' + str3 + '&x=' + x + '&y=' + y;

    $.ajax({
        type: 'POST',
        dataType: "json",
        data: null,
        url: reqUrl,
        success:function(result){
            if (result.status == 0) {
                showSuccessTip(result.msg);
            } else {
                showWarning(result.msg);
            }
        },
        error:function(error){
            showError('操作失败');
        }
    });
}

/*创建datatable*/
function createTable(data) {
    if (myTable){
        myTable.fnClearTable(); //销毁数据
        myTable.fnDestroy(); //销毁datatable
    }
    myTable = $('#dataTable').dataTable({
        "oLanguage":{
            "sZeroRecords":"抱歉，没有找到相应的地址",
            // 'sSearch':'精确筛选',
            // "sLengthMenu" : "显示 _MENU_ 条",
            "sProcessing" : "正在获取数据，请稍后...",
            "sInfo" : "从 _START_ 到  _END_ 条记录 总记录数为 _TOTAL_ 条",
            "sInfoEmpty" : "记录数为0",
            "sInfoFiltered" : "(全部记录数 _MAX_ 条)",
            "oPaginate": {
                "sFirst" : "第一页",
                "sPrevious" : "上一页",
                "sNext" : "下一页",
                "sLast" : "最后一页"
            }
        },
        'bFilter':false,
        'bLengthChange':false,
        'bRetrieve': true,
        "aoColumns":[{'data':'addr_full'}],
        "bSort" : false,
        'aLengthMenu':[10],
        'bProcessing':true,
        // 'bPaginate':false,
        // 'bScrollInfinite':true,
        // 'sScrollY':'350px',
        destroy:true,
        data:data,
        'fnRowCallback':function (nRow, aData, index, indexFull) {
            if (index%2 == 0){
                $(nRow).css('background','#e5f1fc');
            }
        },
    });
}

function addListener(){
    // $("#search_btn").click(search);
    // $("#close_btn_result").click(hideSearchResult);
    $("#layers_choose").hover(function(){
        $("#layers_choose .panel").show();
    },function(){
        $("#layers_choose .panel").hide();
    });
    $("#area_choose").hover(function(){
        $("#area_choose .panel").show();
    },function(){
        $("#area_choose .panel").hide();
    });
    $("#tool_choose").hover(function(){
        $("#tool_choose .panel").show();
    },function(){
        $("#tool_choose .panel").hide();
    });
}

/*警告提示*/
function showWarning(string) {
    spop({
        template: string,
        autoclose: 3000
    });
}

/*错误提示*/
function showError(string) {
    spop({
        template: string,
        autoclose: 3000,
        style: 'error'
    });
}

/*操作成功提示*/
function showSuccessTip(string) {
    spop({
        template: string,
        autoclose: 3000,
        style: 'success'
    });
}
