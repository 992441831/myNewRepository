
	var _addrLayer = null;
	var _buildingLayer = null;     // 商务楼 (0)
	var _businessZoneLayer = null; // 开发园区 (1)
	var _communityLayer = null; // 社区 (2)
	var _blankZoneLayer = null; // 待建空地 (3)
	var _notAggrLayer = null;   // 非聚类区域 (4)
	var _proMarketLayer = null;   // 专业市场(5)
	var _labelLayer = null;//网格文本标注所在的图层

	var _operateType = ""; // 当前操作类型
	var _timer = null;
	var wmsLayer = null;//网格图层
	var _gridmap = null; //基本底图
	var  map_ak = "";  //通过web服务接口鉴权接口获取令牌

	/**
	 * 初始化
	 */
	$(function() {
		initWindow();      //初始化窗口
		initMap();		   //初始化地图
		initLayers();	   //初始化网格图层
		initByAuth();      //初始化按钮
		addListeners();	   //初始化监听
	});
	function initWindow(){
		$("#mapView").height($(window).height());
	}
	function initMap() {
		if (_gridmap != null){
			_gridmap.remove();
		}
		_gridmap = new Ai.Map('mapView',{
			ak:map_ak,
			mapType:"bdmap",
			layerControler:false
		});
		_gridmap.zoomControl=true;
		var maplayer = Ai.TileLayer('http://192.168.74.195:8999/bdvector');
		_gridmap.addLayer(maplayer);
		_gridmap.setView([30.26,120.22], 14);//设置地图中心点和缩放级别
		Ai.Zoom({type:"large"}).addTo(_gridmap);
		//Ai.Scale({position:"bottomright"}).addTo(_gridmap);
		//locationLayer = new Ai.FeatureGroup();
		//_gridmap.addLayer(locationLayer);
	}
	function initLayers(){
		//初始化网格图层
		wmsLayer = Ai.WMSLayer("http://192.168.74.198:8088/geoserver/cite/wms", {
			layers: 'cite:GR_IMPORTANT_ACTIVITIES',
			format: 'image/png',
			transparent: true,
			opacity:0.75,
			crs:getWGS84CRS(),
			CQL_FILTER:"1=1"
		});
		_gridmap.addLayer(wmsLayer);
		//增加事件监听,wmsLayer没有这些事件
		//wmsLayer.on("click", onGridLayerClick);
		//wmsLayer.on("update-end", endGridLayerUpdate);
		//wmsLayer.on("mouse-over", onGridLayerMouseOver);
		//wmsLayer.on("mouse-out", onGridLayerMouseOut);
	}
	function getWGS84CRS(){
		var crs = new L.Proj.CRS("EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs ",
			{
				origin: [-400,400],             // 将刚刚的 Origin 复制到这里
				resolutions: [                 // 所有的分辨率复制到这里
					0.023794610058302794,
					0.011897305029151397,
					0.0059486525145756985,
					0.0023794610058302797,
					0.0011897305029151398,
					5.948652514575699E-4,
					2.3794610058302794E-4,
					1.1897305029151397E-4,
					5.9486525145756985E-5,
					2.3794610058302794E-5,
					1.1897305029151397E-5,
					4.758922011660559E-6,
					2.3794610058302796E-6,
					1.1894610058302796E-6
				]
			});
		return crs;
	}
	//初始化按钮
	function initByAuth() {
		//根据权限设置下方按钮的显示或隐藏
		$("#grid_edit").css("display","display" );//编辑网格
		$("#grid_add").css("display","display");//镂空网格
		$("#grid_clear").css("display","display");//清除网格图层
		//根据实际显示的按钮个数设置下方工具栏的位置，使工具栏位置居中
		$("#gridShTools").css("left", ($("body").width()-$("#gridShTools").outerWidth(true))/2+"px");
		$("#gridShTools").show();

		initGridEditor();//初始化网格编辑控件
		initGridAddDraw();//初始化添加网格绘图工具
	}

	
	/**
	 * 在地图中显示消息提示框
	 * @param msg 消息文本
	 * @param autoClose 消息提示框是否自动关闭
	 * @param showCancelOpt 是否显示取消按钮
	 * @param showCancelOpt 是否显示保存按钮
	 * */
	function showMapMsg(msg, autoClose, showCancelOpt, showSaveOpt,selfDefine) {
		//清除已有的消息提示框痕迹
		clearTimeout(_timer);
		_timer = null;
		$("#msgBox").hide();
		
		//设置消息提示框的样式
		$("#msgBox #msg").html(msg);
		$("#msgBox").css("left", ($("body").width()-$("#msgBox").outerWidth())/2);
		$("#msgBox").show();


		$("#msgBox #cancelOpt").css("display", showCancelOpt ? "block" : "none");//判断取消按钮的显示和隐藏
		$("#msgBox #saveOpt").css("display", showSaveOpt ? "block" : "none");//判断保存按钮的显示和隐藏

		if(selfDefine!=null){
			$("#msgBox #saveOpt").text(selfDefine);
		}
		if (autoClose) {//设置自动隐藏
			_timer = setTimeout(function() {
				$("#msgBox").hide();
			}, 4000);
		}
	}
	
	//隐藏提示信息
	function hideMapMsg() {
		clearTimeout(_timer);
		$("#msgBox").hide();
	}


	/**
	 * 给网格图层绑定点击事件
	 * @param e
     */
	function mapClick(e){
		wmsLayer.identify({EPSG:4326,mapobj:_gridmap,callBackFun:showFeatureInfo}).run(e);
	}
	function showFeatureInfo(data,e,feaType){
		console.log("鼠标点击事件返回数据data:");
		console.log(data);
		//编辑网格和清除网格，需要监听地图点击事件
		if(_operateType=="edit_grid"){
			if(data.features.length>0){
				layerClickWhenEdit(data.features[0]);
			}
		}else if(_operateType=="grid_clear"){
			if(data.features.length>0){
				layerClickWhenClear(data.features[0]);
			}
		}
	}
	/**
	 * 给网格图层绑定鼠标悬浮事件
	 * @param e
     */
	function mapMouseOver(e){
		wmsLayer.identify({EPSG:4326,mapobj:_gridmap,callBackFun:showFeatureInfo1}).run(e);
		console.log("鼠标悬浮事件");
	}
	function showFeatureInfo1(data,e,feaType){
		console.log("鼠标悬浮事件返回数据data:");
		console.log(data);
	}

	/**
	 * 增加事件监听
	 * @author wangqi
	 * @since 2015/10/21
	 * */
	function addListeners() {

		_gridmap.on('click', mapClick);//单击
		_gridmap.on('mouse-over', mapMouseOver);//鼠标悬浮
		//监听地图顶端消息提示框的事件
		$("#cancelOpt").click(msgCancelClick);
		$("#saveOpt").click(msgSaveClick);
	
		//监听地图底部编辑按钮组的鼠标移动事件
		$("#gridShTools").find(".editbutton").mouseover(function() {
			if($(this).attr("clicked") == "true") {
				$(this).css("background", "url(images/"+this.id+"_clicked.png) no-repeat");
			}else {
				$(this).css("background", "url(images/"+this.id+"_hover.png) no-repeat");
			}
		}).mouseout(function() {
			if($(this).attr("clicked") == "true") {
				$(this).css("background", "url(images/"+this.id+"_clicked.png) no-repeat");
			}else {
				$(this).css("background", "url(images/"+this.id+".png) no-repeat");
			}
		});


		//监听地图底部编辑按钮组的点击事件
		$("#map_reset").click(resetMapClick);//重置
		$("#grid_add").click(gridAddClick);//新增网格
		$("#grid_edit").click(gridEditClick);//编辑网格
		$("#grid_clear").click(gridClearClick);//清除网格图形

	}
	
	/**
	 * 将地图下方指定的编辑按钮的点击状态设置为指定值，并改变其样式
	 * @auhtor wangqi
	 * @since 2015/10/23
	 * @param id 指定的编辑按钮id
	 * @param clicked 指定的点击状态
	 * */
	function setEditBtnClicked(id, clicked) {
		var button = $("#"+id);
		if(clicked) {//设置为点击状态
			button.attr("clicked", "true");
			button.css("background", "url(images/"+id+"_clicked.png) no-repeat");
		}else {//取消点击状态
			button.attr("clicked", "false");
			//根据鼠标是否移动在指定按钮的范围内判断按钮图片
			if(!window.event) {
				button.css("background", "url(images/"+id+".png) no-repeat");
			}else {
				var mouseX = window.event.clientX;//鼠标所在的X轴位置
				var mouseY = window.event.clientY;//鼠标坐在的Y轴位置
				if(mouseX>button.offset().left && mouseX<(button.offset().left+button.outerWidth())
					&& mouseY>button.offset().top && mouseY<(button.offset().top+button.outerHeight())) {
					button.css("background", "url(images/"+id+"_hover.png) no-repeat");
				}else {
					button.css("background", "url(images/"+id+".png) no-repeat");
				}
			}
		}
	}
	
	/**
	 * 从shape字符串中解析出拐点数组
	 * @author wangqi
	 * @since 2015/10/29
	 * */
	function getRingsFromShapeText(shapeText) {
		var rings = [];
		var ringsArray = [];
		if (shapeText.indexOf("MULTIPOLYGON") != -1) {
			shapeText = $.trim(shapeText.substring(shapeText.indexOf("(")+2, shapeText.lastIndexOf(")")-1));
			ringsArray = shapeText.split("),(");
			if (ringsArray) {
				for (var i=0; i<ringsArray.length; ++i) {
					var ring = parseSingleRing(ringsArray[i]);
					rings.push(ring);
				}
			}
			return rings;
		}
		else if (shapeText.indexOf("POLYGON") != -1) {
			var ringText = shapeText.substring(shapeText.indexOf("(")+1, shapeText.lastIndexOf(")"));
			if (ringText.indexOf("),(") == -1) {
				return parseSingleRing(ringText);
			}
			else {
				ringsArray = ringText.split("),(");
				if (ringsArray) {
					for (var i=0; i<ringsArray.length; ++i) {
						if (ringsArray[i].indexOf("(") == -1)
							ringsArray[i] = "( " + ringsArray[i];
						if (ringsArray[i].lastIndexOf(")") == -1)
							ringsArray[i] += ")";
						var ring = parseSingleRing(ringsArray[i]);
						rings.push(ring);
					}
				}
				return rings;
			}
		}
	}
	
	function parseSingleRing(ringText) {
		var ring = [];
		ringText = $.trim(ringText.substring(ringText.indexOf("(")+1, ringText.lastIndexOf(")")));
		var pointPairArray = ringText.split(",");
		
		for (var i=0; i<pointPairArray.length; ++i) {
			var pairs = ($.trim(pointPairArray[i])).split(" ");
			if (pairs.length == 2) {
				var point = [];
				point.push(pairs[0]);
				point.push(pairs[1]);
				ring.push(point);
			}
		}
		return ring;
	}
	
	//根据网格图层名称获取对应的网格图层id（类型）
	function getGridTypeIdFromStr(gridName) {
		switch(gridName) {
			case _C_BUILDING: return 1;//楼宇
			case _C_BUSINESSZONE: return 2;//园区
			case _C_COMMUNITY: return 3;//社区
			case _C_BLANKZONE: return 4;//空地
			case _C_NOTAGGR: return 5;//非聚类
			case _C_PROMARKET: return 6;//专业市场
			default : return 0;
		}
	}
	
	//根据网格图层id（类型）获取网格图层名称
	function getGridTypeStrFromId(id) {
		switch(id) {
			case 1: return _C_BUILDING;//楼宇
			case 2: return _C_BUSINESSZONE;//园区
			case 3: return _C_COMMUNITY;//社区
			case 4: return _C_BLANKZONE;//空地
			case 5: return _C_NOTAGGR;//非聚类
			case 6: return _C_PROMARKET;//专业市场
			default : return "";
		}
	}
	
	//根据网格图层id（类型）获取网格图层对象
	function getLayerFromTypeId(id) {
		switch (id) {
			case 1: return _buildingLayer;
			case 2: return _businessZoneLayer;
			case 3: return _communityLayer;
			case 4: return _blankZoneLayer;
			case 5: return _notAggrLayer;
			case 6: return _proMarketLayer;
			default: return null;
		}
	}
	
	// 通知外层全息系统操作结果
	function notifyOptResult(optType, info) {
		try {
			parent.OptGridResult(optType, info);
		} catch(e) {
			alert("调用OptGridResult方法失败");
		}
	}
	
	/**
	 * 创建确认提示框
	 * @author wangqi
	 * @since 2015/10/22
	 * @param title 提示框的标题文本
	 * @param message 提示框的信息文本
	 * @param yesFn 确认按钮的点击事件
	 * @param noFn 取消按钮的点击事件
	 * */
	function createConfirmAlert(title, message, yesFn, noFn) {
		var confirmAlert = $("#confirm_alert");
		var hideConfirmAlert = function() {
			confirmAlert.css("display", "none");
		}
		//设置标题
		if(title) {
			confirmAlert.find("#confirm_title").html(title);
		}
		//设置信息
		if(message) {
			confirmAlert.find("#confirm_message").html(message);
		}
		//设置点击事件
		var yesBtn = confirmAlert.find('[button-type="yes"]').unbind("click");
		if(yesBtn) {
			yesBtn.bind("click", yesFn);
		}
		yesBtn.bind("click", hideConfirmAlert);
		
		var noBtn = confirmAlert.find('[button-type="no"]').unbind("click");
		if(noFn) {
			noBtn.bind("click", noFn);
		}
		noBtn.bind("click", hideConfirmAlert);
		
		confirmAlert.find(".remove-btn").unbind("click").bind("click", hideConfirmAlert);
		return confirmAlert;
	}
	
	/**
	 * 显示消息提示框
	 * @author wangqi
	 * @since 2015/10/23
	 * @param message 提示信息文本
	 * @param success 是否为成功消息的提示框
	 * @param hideMs 提示框隐藏的时间
	 * */
	function showMessageTip(message, success, hideMs) {
		$("#message_icon").html(message);
		if(success) {//根据提示框是否为成功消息来设定其样式
			$("#message_tip").css("border-color", "#5BC0DE");
			$("#message_icon").css("background", "url(images/success_save.png) no-repeat");
		}else {
			$("#message_tip").css("border-color", "#FF0000");
			$("#message_icon").css("background", "url(images/faild_save.png) no-repeat");
		}
		$("#message_tip").show();
		setTimeout(function() {
			$("#message_tip").hide();
		}, hideMs ? hideMs : 2000);
	}
	
	/**
	 * 校验网格是否在当前操作用户管理的区局或分局内
	 * @author wangqi
	 * @since 2015/12/10
	 * @param graphic 网格图形对象
	 * */
	function verifyGridBureau(graphic) {
		return (_authObj.mainBureauIds && _authObj.mainBureauIds.indexOf(graphic.attributes.MAIN_BUREAU_ID) != -1)
			|| (_authObj.subBureauIds && _authObj.subBureauIds.indexOf(graphic.attributes.SUB_BUREAU_ID) != -1);
	}

	/***
	 * 通过正则表达式抽取shape字符串中的坐标，返回rings数组
	 * @author wangqi
	 * @since 2018/6/21
	 * @param shape 坐标字符串
	 * */
	function parsePolygon(shape) {
		//正则表达式对象，匹配"x y"格式的坐标串
		var reg = new RegExp("((-?[1-9]\\d*\\.?\\d*)|(-?0\\.\\d*))\\s((-?[1-9]\\d*\\.?\\d*)|(-?0\\.\\d*))", "gm");
		var obj = {};//创建键值对对象
		//通过正则表达式从字符串中匹配出"x y"格式的坐标串
		shape.match(reg).forEach(function(el, i) {
			var xy = el.split(" ");
			//组装"[y, x]"格式的数组字符串，符合leaflet使用的坐标顺序
			obj[el] = "["+xy[1]+", "+xy[0]+"]";
		});

		//迭代键值对，将shape字符串中的"x y"格式的坐标串替换为"[y, x]"格式的数组字符串
		for(var name in obj) {
			shape = shape.replaceAll(name, obj[name]);
		}
		//将字符串中的小括号替换为中括号
		shape = shape.replaceAll("\\(", "[").replaceAll("\\)", "]");
		//去除头部标记
		shape = shape.replace("MULTIPOLYGON", "").replace("POLYGON", "");
		var rings = eval("(0 || "+shape+")");//使用eval函数赋值，注意兼容性
		return rings;
	}

	function geometryToStr(latLngs){
		var pointStr = ""
		latLngs.forEach(function(el, i) {
			pointStr += el.lng + ",";
			pointStr += el.lat + ",";
		});
		pointStr +=latLngs[0].lng+","+latLngs[0].lat;
		pointStr=pointStr.substring(0,pointStr.length-1);
		return pointStr;
	}