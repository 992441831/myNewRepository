	/*********************************************
	 * 此文件包含了GIS平台网格管理模块中提供给全息网格系统的接口代码
	 * @author wangqi
	 * @since 2015/10/26
	 *********************************************/
	var _gridDrawToolbar;//绘制网格用的工具
	var _drawGridAttr ={};//绘制网格的属性对象
	var _drawGridGeometry;//绘制出的网格几何形状
	
	/**
	 * 初始化增加网格绘图工具
	 * @author wangqi
	 * @since 2015/10/29
	 * */
	function initGridDrawer() {

	}
	
	/**
	 * 供CRM调用的接口
	 * @param operateType 确定要调用的函数
	 * @param obj 传递到函数中的参数
	 * */
	function i_invoke(operateType, obj) {
		if (operateType == "locate_grid") {//定位网格
			locateGrid(obj);
		}else if (operateType == "add_grid") {//新增网格
			drawGrid(operateType, obj);
		}else if (operateType == "delete_grid") {//删除网格
			deleteGrid(obj);
		}else if (operateType == "update_grid") {//修改网格
			updateGrid(obj);
		}else if (operateType == "locate_addr") {//定位地址
			locateAddr(obj);
		}else if (operateType == "reDraw_grid") {//重绘网格
			drawGrid(operateType, obj);
		}else {
			alert("不支持此操作，i_invoke调用非法！");
		}
	}
	
	/**
	 * 定位网格
	 * @author wangqi
	 * @since 2015/10/29
	 * */
	function locateGrid(obj) {
		//校验参数
		if (!(obj && obj.id)) {
			alert("参数不符合要求：缺少网格id");
			return;
		}
		resetMapClick();//调用重置函数
		$("#trans_loading").show();//显示加载动画
		$.ajax({
			type: "POST",
			dataType: "json",
			data: {gridId: obj.id},
			url: getURL("custAnalysis/getGridItem.do"),
			success: function(gridItem) {
				$("#trans_loading").hide();//隐藏加载动画
				if(gridItem != null) {
					if (!getLayerFromTypeId(gridItem.GRID_TYPE)) {
						showMessageTip("您没有权限查看此网格！", false, 3000);
					}else {
						locateGridByAttr(gridItem);
					}
				}else {
					showMessageTip("根据ID:["+obj.id+"]找不到对应的网格", false, 3000);
				}
			},
			error: function() {
				$("#trans_loading").hide();//隐藏加载动画
				showMessageTip("定位出错！", false, 3000);
			}
		});
	}
	
	/**
	 * 根据网格属性值定位到图形
	 * @author wangqi
	 * @since 2015/10/29
	 * @param attr 网格属性
	 * */
	function locateGridByAttr(attr) {
		var rings = getRingsFromShapeText(attr.SHAPE);
		require(["dojo/_base/Color",
			"esri/graphic",
			"esri/geometry/Polygon",
			"esri/symbols/SimpleFillSymbol",
			"esri/symbols/SimpleLineSymbol"
		], function(Color, Graphic, Polygon, SimpleFillSymbol, SimpleLineSymbol) {
			var polygon = new Polygon(rings);
			polygon.spatialReference = _gridmap.spatialReference;
			//放大地图比例尺
			_gridmap.setExtent(polygon.getExtent(), true).then(function() {
				//添加临时的事件监听
				var lisTemp = dojo.connect(getLayerFromTypeId(attr.GRID_TYPE), "onUpdateEnd", function() {
					for(var i=0; i<this.graphics.length; i++) {
						if(this.graphics[i].attributes.GRID_ID == attr.GRID_ID) {
							this.graphics[i].setSymbol(new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
								new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 174, 239]), 3),
								new esri.Color([41, 233, 86, 0.7])
							));
							break;
						}
					}
					dojo.disconnect(lisTemp);//取消事件监听
				});
			});
		});
	}
	
	/**
	 * 绘制网格
	 * @author wangqi
	 * @since 2015/10/29
	 * @param optType 操作类型
	 * @param obj 传递的网格信息参数
	 * */
	function drawGrid(optType, obj) {
		//校验参数
		var typeId = getGridTypeIdFromStr(obj.type);
		if (!(obj && obj.id && obj.type && obj.name && obj.code && obj.mainBureauId && obj.subBureauId)) {
			alert("参数不符合要求");
		}else if (typeId == 0) {
			alert("网格类型(type)不合法");
		}else {
			obj.type = typeId;//将类型文本设置为类型id
			//被全息网格系统调用的参数
			var resultOptType = "";//根据操作类型的值判断传递给CRM系统的操作类型值
			if(optType == "add_grid") {
				resultOptType = "add";
			}else if(optType == "reDraw_grid") {
				resultOptType = "reDraw";
			}
			var info = {id: obj.id, type: getGridTypeStrFromId(obj.type)};
			resetMapClick();//调用重置函数
			$("#trans_loading").show();//显示加载动画
			//校验网格图形是否已经存在
			$.ajax({
				type: 'POST',
				url: getURL("gridSh/checkGridExist.do"),
				data: { gridId: obj.id },
				success: function(result) {
					$("#trans_loading").hide();//隐藏加载动画
					if (result.rst == true) {
						showMessageTip("ID为" + obj.id + "的网格已经存在图形！", false, 3000);//显示失败的提示信息
						info.result = 0;
						notifyOptResult(resultOptType, info);
					}else {
						_drawGridAttr = obj;//将传递的新增网格属性保存在全局变量中
						confirmDrawGrid(optType);
					}
				},
				error: function(result) {
					$("#trans_loading").hide();//隐藏加载动画
					showMessageTip("网络连接失败", false, 3000);//显示保存失败的提示信息
					info.result = 0;
					notifyOptResult(resultOptType, info);
				}
			});
		}
	}
	
	/**
	 * 确定设置操作类型为绘制网格模式
	 * @author wangqi
	 * @since 2015/10/27
	 * @param optType 操作类型
	 * */
	function confirmDrawGrid(optType) {
		//判断地图等级是否为9级，若低于9级，则放大地图
		if(_gridmap.getZoom()<9) {
			_gridmap.setZoom(9);
		}
		showMapMsg("请在地图上绘制网格", false, true, false,null);//显示增加的提示信息
		_operateType = optType;//操作类型设置为指定的绘制模式（增加或重绘）
		
		//激活绘图工具
		_gridDrawToolbar.activate(esri.toolbars.Draw.POLYGON);
		//设置鼠标样式和跟随鼠标的提示信息
		_gridmap.setMapCursor("url(../gridSh/images/pencil.cur),auto");//改变鼠标图片
		//设置鼠标事件监听
		$("#mapView").bind('mousemove', function(event) {
			//setMapMouseMessage("右键退出绘图模式", event);
		}).bind('mousedown', function(event) {
			rightClickDrawGrid(event);
		});
	}
	
	/**
	 * 取消绘制网格操作
	 * @author wangqi
	 * @since 2015/10/26
	 * */
	function cancelDrawGrid() {
		hideMapMsg();//隐藏消息提示框
		polygonDrawer.disable();
		$("#inputBox").hide();
		_drawLayer.clearLayers();		//清空中间图层
		setEditBtnClicked("grid_add", false);//设置网格添加按钮为正常状态
		_operateType = "";//将操作类型设置为空
	}
	
	/**
	 * 在网格绘制模式下，点击鼠标右键取消网格绘制模式
	 * @author wangqi
	 * @since 2015/10/26
	 * */
	function rightClickDrawGrid() {
		if(3 == event.which) {
			$(this).bind('contextmenu',function(e) {//不显示默认的右键菜单
				return false;
			});
			cancelDrawGrid();
		}
	}

	

	
	/**
	 * 删除网格
	 * @author wangqi
	 * @since 2015/10/29
	 * */
	function deleteGrid(obj) {
		//校验参数
		if(!(obj && obj.id && obj.type)) {
			alert("参数不符合要求");
			return;
		}
		var info = {//被全息网格系统调用的参数
			id: obj.id,
			type: obj.type
		};
		resetMapClick();//调用重置函数
		$("#trans_loading").show();//显示加载动画
		$.ajax({
			type: 'POST',
			url: getURL("gridSh/deleteGridGraphic.do"),
			data: {
				gridId: obj.id,
				user: _user
			},
			success: function(result) {
				$("#trans_loading").hide();//隐藏加载动画
				if (result.exitcode == 0) {
					showMessageTip(result.message, true);
					_gridmap.infoWindow.hide();//隐藏infowindow
					_gridmap.graphics.clear();//清除graphics图层
					var layer = getLayerFromTypeId(getGridTypeIdFromStr(obj.type));
					if (layer) {
						layer.refresh();
						_labelLayer.refresh();//刷新文本标注图层
					}
					info.result = 1;
				}else {
					showMessageTip(result.message, false, 3000);
					info.result = 0;
				}
				notifyOptResult("delete", info);
			},
			error: function(result) {
				$("#trans_loading").hide();//隐藏加载动画
				showMessageTip("网络连接失败", false, 3000);//显示保存失败的提示信息
				info.result = 0;
				notifyOptResult("delete", info);
			}
		});
	}
	
	/**
	 * 更新网格类型
	 * @author wangqi
	 * @since 2015/10/29
	 * */
	function updateGrid(obj) {
		if(!(obj && obj.id && obj.code && obj.oldType && obj.newType && obj.name)) {
			alert("参数不符合要求");
			return;
		}
		//将网格类型名称改为对应的id
		obj.oldType = getGridTypeIdFromStr(obj.oldType);
		if(obj.oldType == 0) {
			alert("旧网格类型(oldType)不合法");
			return;
		}
		//将网格类型名称改为对应的id
		obj.newType = getGridTypeIdFromStr(obj.newType);
		if(obj.newType == 0) {
			alert("新网格类型(newType)不合法");
			return;
		}
		obj.user = _user;
		obj.gridId = obj.id;
		
		var info = {//被全息网格系统调用的参数
			id: obj.id,
			code: obj.code,
			oldType: getGridTypeStrFromId(obj.oldType),
			newType: getGridTypeStrFromId(obj.newType),
			name: obj.name
		};
		$("#trans_loading").show();//显示加载动画
		$.ajax({
			type: 'POST',
			url: getURL("gridSh/updateGrid.do"),
			data: obj,
			success: function(result) {
				$("#trans_loading").hide();//隐藏加载动画
				if (result.exitcode == 0) {
					showMessageTip(result.message, true);//显示更新成功的提示信息
					//刷新新旧网格图层的数据
					var oldLayer = getLayerFromTypeId(obj.oldType);
					var newLayer = getLayerFromTypeId(obj.newType);
					if(oldLayer) {
						oldLayer.refresh();
						_labelLayer.refresh();//刷新文本标注图层
					}
					if(newLayer) {
						newLayer.refresh();
						_labelLayer.refresh();//刷新文本标注图层
					}
					info.result = 1;
				}
				else {
					showMessageTip(result.message, false, 3000);//显示保存失败的提示信息
					info.result = 0;
				}
				notifyOptResult("change", info);
			},
			error: function(result) {
				$("#trans_loading").hide();//隐藏加载动画
				showMessageTip("网络连接失败", false, 3000);//显示保存失败的提示信息
				info.result = 0;
				notifyOptResult("change", info);
			}
		});
	}
	
	/**
	 * 定位地址
	 * @author wangqi
	 * @since 2015/10/29
	 * */
	function locateAddr(obj) {
		if(!(obj && obj.addressId)) {
			alert("参数不符合要求");
			return;
		}
		if(_addrLayer == null) {
			showMessageTip("您没有权限查看地址！", false, 3000);
			return;
		}
		
		showAddrLayer();//显示地址点图层
		_gridmap.infoWindow.hide();//隐藏infowindow对象
		resetMapClick();//调用重置函数
		$("#trans_loading").show();//显示加载动画
		$.ajax({
			type: 'GET',
			url: getURL("gridSh/getAddrXYById.do"),
			data: {addressId: obj.addressId},
			success: function(resultMap) {
				$("#trans_loading").hide();//隐藏加载动画
				if(resultMap.exitcode == 1) {
					showMessageTip("地址不存在", false, 3000);
				}else {
					var result = resultMap.result;
					if (!result || !result.X || !result.Y) {
						showMessageTip("无法定位此地址", false, 3000);
					}else {
						//创建地址对象信息窗口
						var createAddrWin = function() {
							var point = new esri.geometry.Point(result.X, result.Y, _gridmap.spatialReference);
							var content = '<span id="addr_name_infowindow" ' +
								'addr_full_name='+result.NAME+' address_id='+result.ADDRESS_ID+' address_x='+result.X+' address_y='+result.Y+'>' + result.NAME + '</span>' +
								'<button id="move_addr_infowindow">移动地址</button>';

							_gridmap.infoWindow.resize(330, 200);
							_gridmap.infoWindow.setTitle("地址信息");
							_gridmap.infoWindow.setContent(content);
							_gridmap.infoWindow.show(_gridmap.toScreen(point));
							_gridmap.centerAt(point);
							$("#move_addr_infowindow").click(infowindow_addressMoveClick);//监听infowindow移动地址按钮的点击事件
						}
						//判断地图等级是否小于10级，若小于10级，则对地图进行放大
						if(_gridmap.getZoom()<10) {
							_gridmap.setZoom(10).then(createAddrWin);
						}else {
							createAddrWin();
						}
					}
				}
			},
			error: function(result) {
				$("#trans_loading").hide();//隐藏加载动画
				showMessageTip("无法定位此地址", false, 3000);
			}
		});
	}

	function refreshLayers(){
		wmsLayer.setParams({action:Math.random()}, false);
	}

	function filterSql(){
		var sql = "1=1";
		return sql;
	}