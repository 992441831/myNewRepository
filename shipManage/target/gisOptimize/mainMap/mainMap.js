
//定义地图
var aimap = null;
var map_ak = "";  //通过web服务接口鉴权接口获取令牌

var myTable;
var id=null;
var addr_full=null;
var aroundData;

var timer = null;   //用来解决单击双击事件冲突

var overLayer;  //地图覆盖物
var overGrid;  //网格覆盖物
var overAround;//周边覆盖物

var isAddressViewShow;   //addressView 是否展示中

/*用来暂存选址界面item*/
var build_item_list = [];
var unit_item_list = [];
var floor_item_list = [];
var room_item_list = [];

var Item_list = [];

//地址等级
var ADD_LEVEL = {
    NUMBER_LEVEL:4273,      //号
    BUILDING_LEVEL:4274,    //栋
    UNIT_LEVEL:0,           //单元
    FLOOR_LEVEL:4275,       //层
    ROOM_LEVEL:4276         //室
};

//选址方式
var SEARCH_TYPE = {
    ADDRESS_TYPE:1,     //地址搜索
    NAME_TYPE:2,        //名称搜索
    MAPSELECT_TYPE:3    //地址选址搜索周边
};
var cur_search_type = SEARCH_TYPE.ADDRESS_TYPE; //默认选址方式为地址搜索

var XX = null;  //存储鼠标在addressView中的点击位置
var YY = null;

var serachDelayTimer;

$(document).ready(function() {
    $("#content div").hide(); // Initially hide all content

    // $("#tabs li:nth-child(2)").css('display','none');

    $('.ui-choose').ui_choose();
    var select_box = $('#select-box').data('ui-choose');
    select_box.change = function(value) {
        console.log('change', value);
        cur_search_type = value + 1;

        if (cur_search_type == SEARCH_TYPE.ADDRESS_TYPE || cur_search_type == SEARCH_TYPE.NAME_TYPE){
            if ($("#searchInput").val().length > 0){
                addTable($("#searchInput").val(), cur_search_type);
            }
        } else {
            $('#table-content').hide();
        }
    };


    $('#tabs a').click(function(e) {

        $('#tooltip').empty();
        $("#tooltip").css("display","none");

        e.preventDefault();
        $("#content div").hide(); //Hide all content
        $("#tabs li").attr("id",""); //Reset id's
        $(this).parent().attr("id","current"); // Activate this
        $('#' + $(this).attr('title')).fadeIn(); // Show content for current tab
    });

    //先隐藏搜索列表、选择下单地址
    $('#table-content').hide();

    /*搜索框文字变化时
    * 延迟500毫秒再查询 免得拖死服务器
    **/
    $('#searchInput').bind('input propertychange', function () {

        if (cur_search_type == SEARCH_TYPE.ADDRESS_TYPE || cur_search_type == SEARCH_TYPE.NAME_TYPE){
            clearTimeout(serachDelayTimer);
            serachDelayTimer = setTimeout(queryByAddressOrPoi,200)
        }

    });

    /*下单输入框文字变化时*/
    $('#submit-text').bind('input propertychange', function () {
        $('#top-address').html($(this).val());
    });

    //当下拉框选中的值发生改变，搜索也就发生改变
    // $('#type').change(function(){
    //     hideSelectView();
    //     if ($("#searchInput").val().length > 0) {
    //         var type = $("#type option:selected").val();
    //         addTable($("#searchInput").val(), type);
    //     }
    // });

    $("#map").height($(window).height());//设置地图的高度
    initMap();
    hideSelectView();

    $('#dataTable tbody').on('click','tr td:nth-child(1)',function () {
        var data = myTable.api().row(this.parentNode).data();
        if(data.id !=undefined){
            // showSelectView(data.id, data.addr_full,data.level);
            showSelectView(data, true);
        }
        else{
            //是POI搜索
            //var location=data.location;
            //queryAround(0,location[0],location[1]);
        }

    });

    $('#dataTable tbody').on('mouseover','tr td:nth-child(1)',function (e) {
        var data = myTable.api().row(this.parentNode).data();
        if(data.id !=undefined) {
            queryGridData(data.id, data.location);
        }else{
            var location=data.location;
            addr_full="";
            addr_full=data.addr_full;

            if(overGrid){
                overGrid.eachLayer(function (layer) {
                    overGrid.removeLayer(layer);
                })
            }
            //查询周边，清除周边覆盖物
            if(overAround){
                overAround.eachLayer(function (layer) {
                    overAround.removeLayer(layer);
                })
            }
            if(overLayer){
                overLayer.eachLayer(function (layer) {
                    overLayer.removeLayer(layer);
                })
            }

            hideSelectView();
            //removeLayer();
            overAround = new Ai.FeatureGroup();
            var myIcon1 = new Ai.Icon({
                iconUrl: '../images/flat-marker-.png',
                iconSize: [26, 35]

            });
            var marker =new Ai.Point(location, {icon: myIcon1});

            overAround.addLayer(marker);

            aimap.addLayer(overAround);

            aimap.setView(location, 17);

            marker.addEventListener("mouseover", function(e){

                //先清空内容
                $('#myDiv').empty();

                var  xOffset = 10;//layerPoint

                var  yOffset = 25;
                $("#myDiv").css("display","block").css("position","absolute").css("top",(e.containerPoint.y- yOffset) + "px").css("left",(e.containerPoint.x + xOffset) + "px");
                $("#myDiv").append(addr_full+'<br>');
            });
            marker.addEventListener("mouseout", function(){
                $('#myDiv').empty();
                $("#myDiv").css("display","none");
            });
        }
    });

    isAddressViewShow = false;
    /*隐藏显示下单界面*/
    $('#showHideBtn').click(function () {
        if (isAddressViewShow){
            $('#addresView').hide();
        } else {
            $('#addresView').show();
        }
        isAddressViewShow = !isAddressViewShow;
    });

    // $("#dataTable tbody")
    //     .on('mouseover', 'td', function (nRow, aData, index) {
    //         alert(nRow.td.innerHTML + aData + index);
    //     })
    //     .on('mouseleave', function () {
    //
    //     } );
});

/**
 * 这里姐姐亲自帮你们做了
 */
function queryByAddressOrPoi()
{
    var addr_str = $('#searchInput').val();
    if (addr_str.length > 0)
    {
        // var type = $("#type option:selected").val();
        addTable(addr_str,cur_search_type);
    } else {
        $('#table-content').hide();
        removeLayer();
    }
}

/*初始化地图*/
function initMap(){
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
    aimap.setView([31.22,121.48], 11);//设置地图中心点和缩放级别
    aimap.on('click',function (e) {
       // alert('click' + e.latlng + e.latlng.lat + e.latlng.lng);
        if (cur_search_type == SEARCH_TYPE.MAPSELECT_TYPE){
            queryAround(0,e.latlng.lat,e.latlng.lng);
        }
    });
}

/*请求网格数据*/
function queryGridData(addr_id, location) {
    var url = '../AddressController/queryGrid.do?address_id=' + addr_id;
    $.get(url,function (result, status) {
        if ('success' == status){
            var SHP = result.SHP;
            if (SHP){
                var points = splitString(SHP);
                var center = location;
                addOverlayerLine(points, center);
            }
        }
    },"json");
}

/*添加地图覆盖物*/
function addOverlayerMarkers(mydata,markers) {
    removeLayer();
    if(overGrid){
        overGrid.eachLayer(function (layer) {
            overGrid.removeLayer(layer);
        })
    }
    //查询周边，清除周边覆盖物
    if(overAround){
        overAround.eachLayer(function (layer) {
            overAround.removeLayer(layer);
        })
    }
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
                    }
                }

            });
            showSelectView(aroundData, true);
            aimap.setView(aroundData.location,17);
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

            var  yOffset = 25;
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

/*搜周边添加地图覆盖物*/
function addOverlayerMarkersRadius(mydata,markers, center) {
    hideSelectView();
    //removeLayer();
    overAround = new Ai.FeatureGroup();
    var myIcon1 = new Ai.Icon({
        iconUrl: '../images/marker.png',
        iconSize: [36, 36]
    });

    $.each(markers, function (index, val) {
        var marker =new Ai.Point(val, {icon: myIcon1});

        marker.addEventListener("click", function(e){
            $.each(mydata, function (index1, myval) {
                if(e.latlng.lat==myval.location[0] &&e.latlng.lng==myval.location[1]){
                    addr_full="";
                    addr_full=myval.addr_full;
                    aroundData=null;
                    aroundData=mydata[index1];
                }

            });
            showSelectView(aroundData, true);
            aimap.setView(aroundData.location,17);
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

            var  yOffset = 25;
            $("#myDiv").css("display","block").css("position","absolute").css("top",(e.containerPoint.y- yOffset) + "px").css("left",(e.containerPoint.x + xOffset) + "px");
            $("#myDiv").append(addr_full+'<br>');
        });
        marker.addEventListener("mouseout", function(){
            $('#myDiv').empty();
            $("#myDiv").css("display","none");
        });
        overAround.addLayer(marker);
    });

    aimap.addLayer(overAround);

    aimap.setView(center, 17);
}

/*添加地图覆盖网格*/
function addOverlayerLine(points, center) {
    //removeLayer();
    if(overGrid){
        overGrid.eachLayer(function (layer) {
            overGrid.removeLayer(layer);
        })
    }
    if(overAround){
        overAround.eachLayer(function (layer) {
            overAround.removeLayer(layer);
        })
    }

    overGrid = new Ai.FeatureGroup();
    var myIcon1 = new Ai.Icon({
        iconUrl: '../images/marker.png',
        iconSize: [36, 36]
    });
    var marker =new Ai.Point(center, {icon: myIcon1});
    overGrid.addLayer(overLayer);

    var road = new Ai.Polyline(points, {
        color: '#ff8a00',
        opacity: 1.0
    });
    overGrid.addLayer(road);
    aimap.addLayer(overGrid);
    aimap.setView(center, 17);
}

/*移除地图覆盖物*/
function removeLayer() {
    if (overLayer){
        overLayer.eachLayer(function (layer) {
            overLayer.removeLayer(layer);
        })
    }
}

/*快速查询地址列表*/
function addTable(key,type) {
    var url = '../addressIndex/fuzzyQueryAddress.do?addr_full=' + key+'&type='+type;
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

            addOverlayerMarkers(resultData,points);

            createTable(resultData);
        }
    },"json");
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
        destroy:true,
        data:data,
        "columnDefs" : [ {
            // 定义操作列
            "targets" : 1,//操作按钮目标列
            "data" : null,
            'width':70,
            "render" : function(data, type,row) {
                var html = '';
                var id = data.id;
                var lat;
                var lon;
                if (data.location) {
                    var location = data.location;
                    lat = location[0];
                    lon = location[1];
                    html = "<div style='width: 60px;height:20px; color: #000;cursor:pointer;margin-left: 20px' onclick='queryAround("+ id + ',' + lat + ',' + lon +")'><img class='search-image' src='../images/search1.png'>搜周边</div> "
                }
                return html;
            }
        } ],
        'fnRowCallback':function (nRow, aData, index, indexFull) {
            if (index%2 == 0){
                $(nRow).css('background','#ffedda');
            }
        },
    });
}

function getValue() {
    var oSettings = myTable.fnSettings();
    // 获取页码值
    alert(oSettings._iDisplayStart);
    //获取页面分割长度
    alert(oSettings._iDisplayLength);
}

/*查询周边*/
function queryAround(id,lat,lon) {
    //查询周边，清除网格覆盖物体
    if(overGrid){
        overGrid.eachLayer(function (layer) {
            overGrid.removeLayer(layer);
        })
    }
    //查询周边，清除周边覆盖物
    if(overAround){
        overAround.eachLayer(function (layer) {
            overAround.removeLayer(layer);
        })
    }

    var url = '../addressIndex/queryAddressByRadius.do?addr_id='+ id
    + '&lat=' + lat + '&lon=' + lon;
    $.get(url,function (result, status) {
        if ('success' == status){
            var resultData = result.data;
            var points = [];
            $.each(resultData, function (index, val) {
                if (val.location){
                    points.push(val.location);
                }
            });

            var center = [lat, lon];

            addOverlayerMarkersRadius(resultData,points, center);
        }
    },"json");
}

/*展示具体楼层房间选择下单界面*/
function showSelectView(data, first) {
    var addr_id = data.id?data.id:data.ID;
    var addr_full = data.addr_full?data.addr_full:data.ADDR_FULL;
    var level = data.level?data.level:data.ADDRESS_LEVEL;

    hideTipLabel();
    $("#addresView").show();
    $('#showHideBtn').show();
    isAddressViewShow = true;

    //获取鼠标点击相对坐标
    $('#addresView').click(function (e) {
        XX = e.pageX - 410; //减去addressView的偏移量
        YY = e.pageY - 350;
    });

    // $('#top-address').html(addr_full);
    setAddressText(addr_full);

    var NO_ADDRESS_HTML = '<span><img style="height: 115px;margin-left: 95px;" src="../images/noAddress.png"></span>';

    var numbers = [];
    var buildings = [];
    var units = [];
    var floors = [];
    var rooms = [];

    // var buildingHtml = $('<ul></ul>');
    // var unitHtml = $('<ul></ul>');
    // var floorHtml = $('<ul></ul>');
    // var roomHtml = $('<ul></ul>');
    //
    // //先清空数组
    // build_item_list = [];
    // unit_item_list = [];
    // floor_item_list = [];
    // room_item_list = [];

    var tab1Html = $('<ul></ul>');
    var tab2Html = $('<ul></ul>');
    var tab3Html = $('<ul></ul>');
    var tab4Html = $('<ul></ul>');

    var url = '../AddressController/queryAddressNext.do?address_id=' + addr_id + '&address_level=' + level;
    $.get(url,function (result, status) {
        if ('success' == status && result.result){
            var list = result.address_list;

            if (list.length > 0){
                $.each( list, function( index, val ) {
                    var listItem;
                    if (val.ADDRESS_LEVEL < ADD_LEVEL.BUILDING_LEVEL){
                        listItem = $(
                            '<span class="cell" id="' + val.ID + '"><img class="cell-image" src="../images/building.png"><p class="cell-text">' +
                            val.NAME +
                            '</p></span>'
                        );
                    }else if (val.ADDRESS_LEVEL == ADD_LEVEL.BUILDING_LEVEL){
                        listItem = $(
                            '<span class="cell" id="' + val.ID + '"><img class="cell-image" src="../images/building.png"><p class="cell-text">' +
                            val.NAME +
                            '</p></span>'
                        );
                    } else if (val.ADDRESS_LEVEL == ADD_LEVEL.UNIT_LEVEL){
                        listItem = $(
                            '<span class="cell" id="' + val.ID + '"><img class="cell-image" src="../images/unit.png"><p class="cell-text">' +
                            val.NAME +
                            '</p></span>'
                        );
                    } else if (val.ADDRESS_LEVEL == ADD_LEVEL.FLOOR_LEVEL){
                        listItem = $(
                            '<span class="cell" id="' + val.ID + '"><img class="cell-image" src="../images/floor.png"><p class="cell-text">' +
                            val.NAME +
                            '</p></span>'
                        );
                    } else if (val.ADDRESS_LEVEL == ADD_LEVEL.ROOM_LEVEL){
                        listItem = $(
                            '<span class="cell" id="' + val.ID + '"><img class="cell-image" src="../images/room.png"><p class="cell-text">' +
                            val.NAME +
                            '</p></span>'
                        );
                    }
                    Item_list.push(listItem);
                    if (listItem){
                        addListener(listItem,val,val.ADDRESS_LEVEL);
                        tab1Html.append(listItem);
                    }

                });
            } else {
                tab1Html = $(NO_ADDRESS_HTML);
                showWarning('没有查询到下级数据');
                if (!first){
                    return;
                }
            }


            $.each( list, function( index, val ) {
                var V = val.ADDRESS_LEVEL;
                if (V <= ADD_LEVEL.NUMBER_LEVEL) {
                    numbers.push(val);
                } else if (V == ADD_LEVEL.BUILDING_LEVEL) {
                    buildings.push(val);
                } else if (V == ADD_LEVEL.NUMBER_LEVEL) {
                    units.push(val);
                } else if (V == ADD_LEVEL.FLOOR_LEVEL) {
                    floors.push(val);
                } else if (V == ADD_LEVEL.ROOM_LEVEL) {
                    rooms.push(val);
                }
            } );

            var tabText = '';
            if (numbers.length > 0){
                tabText += '号';
                level = ADD_LEVEL.NUMBER_LEVEL;
            }
            if (buildings.length > 0){
                tabText += '栋';
                level = ADD_LEVEL.NUMBER_LEVEL;
            }
            if (units.length > 0){
                tabText += '单元';
                level = ADD_LEVEL.BUILDING_LEVEL;
            }
            if (floors.length > 0){
                tabText += '层';
                level = ADD_LEVEL.UNIT_LEVEL;
            }
            if (rooms.length > 0){
                tabText += '室';
                level = ADD_LEVEL.FLOOR_LEVEL;
            }

            tabText.length == 0?tabText = '无':tabText;

            // cur_tab = 1;
            // var a = $("a", "#tabs li:nth-child(1)");
            // $("a", "#tabs li:nth-child(1)").prop('lastChild').nodeValue = tabText;

            // $("#tabs li:nth-child(1)").attr("id","current");
            // $("#content div:nth-child(1)").fadeIn();

            $("#content div").hide();
            $("#tabs li").attr("id","");
            if (level == ADD_LEVEL.NUMBER_LEVEL){
                $("#tabs li:nth-child(2)").attr("id","current");
                $("#content div:nth-child(2)").fadeIn();

                $("#tab2").empty();
                $("#tab2").append(tab1Html);

                if (first){
                    $("#tabs li:nth-child(1)").css('display','none');
                    $("#tabs li:nth-child(2)").css('display','block');
                    $("#tabs li:nth-child(3)").css('display','none');
                    $("#tabs li:nth-child(4)").css('display','none');
                    $("#tabs li:nth-child(5)").css('display','none');
                } else {
                    $("#tabs li:nth-child(2)").css('display','block');
                }
                $("a", "#tabs li:nth-child(2)").prop('lastChild').nodeValue = tabText;
            } else if (level == ADD_LEVEL.BUILDING_LEVEL){
                $("#tabs li:nth-child(3)").attr("id","current");
                $("#content div:nth-child(3)").fadeIn();

                $("#tab3").empty();
                $("#tab3").append(tab1Html);

                if (first){
                    $("#tabs li:nth-child(1)").css('display','none');
                    $("#tabs li:nth-child(2)").css('display','none');
                    $("#tabs li:nth-child(3)").css('display','block');
                    $("#tabs li:nth-child(4)").css('display','none');
                    $("#tabs li:nth-child(5)").css('display','none');
                } else {
                    $("#tabs li:nth-child(3)").css('display','block');
                }
                $("a", "#tabs li:nth-child(3)").prop('lastChild').nodeValue = tabText;
            } else if (level == ADD_LEVEL.UNIT_LEVEL){
                $("#tabs li:nth-child(4)").attr("id","current");
                $("#content div:nth-child(4)").fadeIn();

                $("#tab4").empty();
                $("#tab4").append(tab1Html);

                if (first){
                    $("#tabs li:nth-child(1)").css('display','none');
                    $("#tabs li:nth-child(2)").css('display','none');
                    $("#tabs li:nth-child(3)").css('display','none');
                    $("#tabs li:nth-child(4)").css('display','block');
                    $("#tabs li:nth-child(5)").css('display','none');
                } else {
                    $("#tabs li:nth-child(4)").css('display','block');
                }
                $("a", "#tabs li:nth-child(4)").prop('lastChild').nodeValue = tabText;
            } else if (level == ADD_LEVEL.FLOOR_LEVEL || level == ADD_LEVEL.ROOM_LEVEL){
                $("#tabs li:nth-child(5)").attr("id","current");
                $("#content div:nth-child(5)").fadeIn();

                $("#tab5").empty();
                $("#tab5").append(tab1Html);

                if (first){
                    $("#tabs li:nth-child(1)").css('display','none');
                    $("#tabs li:nth-child(2)").css('display','none');
                    $("#tabs li:nth-child(3)").css('display','none');
                    $("#tabs li:nth-child(4)").css('display','none');
                    $("#tabs li:nth-child(5)").css('display','block');
                } else {
                    $("#tabs li:nth-child(5)").css('display','block');
                }
                $("a", "#tabs li:nth-child(5)").prop('lastChild').nodeValue = tabText;
            } else {
                $("#tabs li:first").attr("id","current"); // Activate first tab
                $("#content div:first").fadeIn(); // Show first tab content

                $("#tab1").empty();
                $("#tab1").append(tab1Html);

                if (first){
                    $("#tabs li:nth-child(1)").css('display','block');
                    $("#tabs li:nth-child(2)").css('display','none');
                    $("#tabs li:nth-child(3)").css('display','none');
                    $("#tabs li:nth-child(4)").css('display','none');
                    $("#tabs li:nth-child(5)").css('display','none');
                } else {
                    $("#tabs li:nth-child(1)").css('display','block');
                }
                $("a", "#tabs li:nth-child(1)").prop('lastChild').nodeValue = tabText;
            }

        } else {
            showError('请求错误'+ status);
        }
    },"json");

    //若content滚动了，则隐藏tipLabel
    $('#content').on('scroll',function () {
        hideTipLabel();
    })

    $('#tooltip').click(function () {
        hideTipLabel();
    })
}

/*向上重选地址*/
function queryPreTab(addr_id, addr_level) {

    var buildingHtml = $('<ul></ul>');
    var unitHtml = $('<ul></ul>');
    var floorHtml = $('<ul></ul>');
    var roomHtml = $('<ul></ul>');

    var url = '../AddressController/queryAddressPid.do?address_id=' + addr_id + '&address_level=' + addr_level;
    $.get(url,function (result, status) {
        if ('success' == status){
            var list = result.address_list;

            // if (list.length == 0){
            //     return;
            // }

            if (addr_level == ADD_LEVEL.BUILDING_LEVEL){
                $.each(list, function (index, val) {
                    var buildingItem;
                    buildingItem = $(
                        '<span class="cell" id="' + val.ID + '"><img class="cell-image" src="../images/floor.png"><p class="cell-text">' +
                        val.NAME +
                        '</p></span>'
                    );
                    build_item_list.push(buildingItem);
                    addListener(buildingItem,val,ADD_LEVEL.BUILDING_LEVEL);
                    buildingHtml.append(buildingItem);
                });

                $("#tab1").empty();
                $("#tab1").append(buildingHtml);
            } else if (addr_level == ADD_LEVEL.UNIT_LEVEL) {

            } else if (addr_level == ADD_LEVEL.FLOOR_LEVEL) {
                $.each(list, function (index, val) {
                    var floorItem;
                    floorItem = $(
                        '<span class="cell" id="' + val.ID + '"><img class="cell-image" src="../images/floor.png"><p class="cell-text">' +
                        val.NAME +
                        '</p></span>'
                    );
                    floor_item_list.push(floorItem);
                    addListener(floorItem,val,ADD_LEVEL.FLOOR_LEVEL);
                    floorHtml.append(floorItem);
                });
                $("#tab3").empty();
                $("#tab3").append(floorHtml);
            } else if (addr_level == ADD_LEVEL.ROOM_LEVEL) {
                $.each(list, function (index, val) {
                    var roomItem;
                    roomItem = $(
                        '<span class="cell" id="' + val.ID + '"><img class="cell-image" src="../images/room.png"><p class="cell-text">' +
                        val.NAME +
                        '</p></span>'
                    );
                    room_item_list.push(roomItem);
                    addListener(roomItem,val,ADD_LEVEL.ROOM_LEVEL);
                    roomHtml.append(roomItem);
                });
                $("#tab4").empty();
                $("#tab4").append(roomHtml);
            }

        }
    },"json");
}

/*绑定item监听事件*/
function addListener(item, attr, type) {
    /*监听单击事件*/
    item.click(function () {
        clearTimeout(timer);
        timer = setTimeout(function (e) {    //设置单击事件触发的时间间隔
            for (var i=0; i<Item_list.length; i++){
                if (Item_list[i] == item){
                    $("img",Item_list[i]).css('border','1px solid #ff8200');
                } else {
                    $("img",Item_list[i]).css('border','1px solid #c4ccd8');
                }
            }

            //先清空内容
            $('#tooltip').empty();

            var  xOffset = 10;
            var  yOffset = 25;
            $("#tooltip").css("display","block").css("position","absolute").css("top",(YY - yOffset) + "px").css("left",(XX + xOffset) + "px");
            $("#tooltip").append('地址能力信息<br>PSTN接入: -- <br>XDSL接入:最大下行速率:12M<br>PON接入:光接入默认满足所有能力<br>LAN接入:不可安装ITV"');
        }, 300);
    })

    /*监听双击事件*/
    item.dblclick(function () {
        clearTimeout(timer);
        // $('#top-address').html(attr.ADDR_FULL);
        setAddressText(attr.ADDR_FULL);

        //不在房间层级下，双击后继续向下查询地址
        if (type != ADD_LEVEL.ROOM_LEVEL){
            showSelectView(attr, false);
        }

        for (var i=0; i<Item_list.length; i++){
            if (Item_list[i] == item){
                $("img",Item_list[i]).css('border','1px solid #ff8200');
            } else {
                $("img",Item_list[i]).css('border','1px solid #c4ccd8');
            }
        }
    })
}

/*隐藏选择下单界面*/
function hideSelectView() {
    $("#addresView").hide();
    $('#showHideBtn').hide();
    isAddressViewShow = false;
}

/*隐藏tipLabel*/
function hideTipLabel() {
    //先清空内容
    $('#tooltip').empty();
    $("#tooltip").css("display","none");
}

/*给相关位置赋值已选择地址*/
function setAddressText(addr_full) {
    $('#top-address').html(addr_full);
    $('#submit-text').val(addr_full);
}

//截取网格字符串转换成可用数组
function splitString(string) {
    //"POLYGON  (( 121.38273024 31.13170163, 121.38331867 31.13059640,
    // 121.38552023 31.13117964, 121.38494545 31.13228648,
    // 121.38419635 31.13192883, 121.38352942 31.13179333,
    // 121.38273024 31.13170163))"
    var strs1 = new Array();
    var strs2 = new Array();
    var resultArr = [];

    strs1=string.split("(("); //字符分割

    var pointStr = strs1[1].split("))")[0];

    strs2 = pointStr.split(",");

    for (var i=0;i<strs2.length ;i++ )
    {
        var tempStr = strs2[i];
        var tempArr = tempStr.split(" ");
        var pointArr = [tempArr[2],tempArr[1]]; //按照纬度，经度的格式存放
        resultArr.push(pointArr);
    }
    return resultArr;
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