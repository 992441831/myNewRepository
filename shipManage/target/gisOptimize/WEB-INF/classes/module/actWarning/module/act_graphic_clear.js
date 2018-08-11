	/*********************************************
	 * 此文件包含了GIS平台网格管理模块中清除网格图形功能的代码
	 * @author wangqi
	 * @since 2015/11/9
	 *********************************************/
	/**
	 * 初始化网格编辑控件
	 * @author wangqi
	 * @since 2015/10/27
	 * */

	/**
	 * 清除网格图形按钮的点击事件
	 * @author wangqi
	 * @since 2015/11/9
	 * */
	function gridClearClick() {
		if(_operateType!=""){
			createConfirmAlert("提示", "将放弃所有未保存的信息，是否确认此操作？", function() {
				//弹框如果点是，进行重置
				confirmRest();
				gridClear();
			},function () {
				//弹框如果点否，返回
				return ;
			}).show();
		}else{
			gridClear();
		}
	}
	function gridClear(){
		//根据当前的操作模式，进行具体的判断
		switch(_operateType) {
			case "edit_grid":
				var editGraphic = _gridEditToolbar.getCurrentState().graphic;
				//若已有网格处于编辑状态，且其坐标已经被改变时，显示确认提示框
				if(editGraphic && _gridEditToolbar.getCurrentState().isModified) {
					createConfirmAlert("提示", getGridTypeStrFromId(editGraphic.attributes.GRID_TYPE)
						+"<font style='color:#00BFFF;'>"+editGraphic.attributes.NAME+"</font>已经改变，是否放弃保存？", function() {
						cancelGridEdit();//取消网格编辑模式
						confirmGridClear();//切换为地址移动模式
					}).show();
				}else {//否则直接切换操作模式
					cancelGridEdit();//取消网格编辑模式
					confirmGridClear();//切换为地址移动模式
				}
				break;
			case "add_grid":
			case "reDraw_grid":
				cancelDrawGrid();//取消绘制网格模式
			default:
				confirmGridClear();//
				break;
		}
	}
	/**
	 * 确定设置操作模式为清除网格图形模式
	 * @author wangqi
	 * @since 2015/10/28
	 * */
	function confirmGridClear() {
		//判断地图等级是否为9级，若低于9级，则放大地图
		if(_gridmap.getZoom()<9) {
			_gridmap.setZoom(9);
		}
		_operateType = "grid_clear";//操作类型设置为清除网格图形模式
		showMapMsg("请选中一个活动删除", false, true, false,null);//显示网格编辑提示信息
		setEditBtnClicked("grid_clear", true);//设置清除网格图形按钮为点击状态
	}
	
	/**
	 * 退出网格清除模式
	 * @author wangqi
	 * @since 2015/10/28
	 * */
	function cancelGridClear() {
		hideMapMsg();//隐藏消息提示框
		_operateType = "";//将操作类型设置为空
		setEditBtnClicked("grid_clear", false);//取消清除网格图形按钮的点击状态
	}
	
	/**
	 * 当操作模式为编清除网格图形模式时，网格图层的鼠标移入事件响应
	 * @author wangqi
	 * @since 2015/10/27
	 * */
	function layerMouseOverWhenClear(evt) {
		//鼠标移入网格图形，显示高亮效果
		_gridmap.setMapCursor("pointer");
		require(["esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol"], 
		function(SimpleFillSymbol, SimpleLineSymbol) {
			var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
				new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 174, 239]), 3),
				new esri.Color([41, 233, 86, 0.7])
			);
			evt.graphic.setSymbol(symbol);
		});
	}
	
	/**
	 * 当操作模式为编清除网格图形模式时，网格图层的鼠标移除事件响应
	 * @author wangqi
	 * @since 2015/10/27
	 * */
	function layerMouseOutWhenClear(evt) {
		//鼠标移出网格图形，隐藏高亮效果
		_gridmap.setMapCursor("default");
		evt.graphic.setSymbol();
	}
	
	/**
	 * 当操作类型为清除网格图形时，点击网格图形对象触发事件
	 * @author wangqi
	 * @since 2015/11/9
	 * */
	function layerClickWhenClear(feature) {
		polygonEditProperty = feature.properties;
		polygonEdit = Ai.Polygon(Ai.GeoUtils().ParseGeometryToLatlngs(feature.geometry), {color: 'green'});
		_editLayer.addLayer(polygonEdit);
		createConfirmAlert("提示", "活动"
		+"<font style='color:#00BFFF;'>"+polygonEditProperty.ACT_NAME+"</font>的图形信息将被删除，是否确认此操作？", function() {
			$("#trans_loading").show();//显示加载动画
			$.ajax({
				type: 'get',
				url: "/gisOptimize/module/actWarning/deleteGrid.do",
				data: {
					actId: polygonEditProperty.ACT_ID
				},
				success: function(result) {
					$("#trans_loading").hide();//隐藏加载动画
					if (result.status == 0) {
						showMessageTip("网格图形已成功被清除,正在刷新...", true);
						refreshLayers();			//刷新图层
						wmsLayer.redraw();			//刷新网格图形
						confirmRest();
					}else {
						showMessageTip(result.msg, false, 3000);
						confirmRest();
					}
				},
				error: function(result) {
					$("#trans_loading").hide();//隐藏加载动画
					showMessageTip("网络连接失败", false, 3000);//显示保存失败的提示信息
					confirmRest();
				}
			});
			//弹框如果点否，继续选择其他网格
		},function () {
			_editLayer.clearLayers();
			polygonEdit=null;
			polygonEditProperty=null;
		}).show();
	}