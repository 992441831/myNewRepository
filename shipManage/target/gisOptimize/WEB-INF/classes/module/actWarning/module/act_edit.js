	/*********************************************
	 * 此文件包含了GIS平台网格管理模块中网格编辑功能的代码
	 * @author wangqi
	 * @since 2015/10/26
	 *********************************************/
	var _editToolbar = null;//编辑控件
	var _editLayer = null;//编辑功能图层
	var polygonEdit = null;
	var polygonEditProperty = null;
	/**
	 * 初始化网格编辑控件
	 * @author wangqi
	 * @since 2015/10/27
	 * */
	function initGridEditor() {
		//初始化编辑功能图层
		_editLayer = new Ai.FeatureGroup();
		_gridmap.addLayer(_editLayer);

		var grahicLayer = Ai.GeoJSON();
		_gridmap.addLayer(grahicLayer);
		guideLayers = [grahicLayer];
		//初始化图绘图控件
		var options = {
			guideLayers: guideLayers
		};
		_editToolbar = Ai.DrawPolygon(_gridmap, options);
		//取消编辑操作按钮点击事件
		$("#editSteps .cancel").click(function() {
			setEditStepNum(-1);
		});
	}
	
	/**
	 * 网格编辑按钮的点击事件
	 * @author wangqi
	 * @since 2015/10/27
	 * */
	function gridEditClick() {
		if(_operateType!=""){
			createConfirmAlert("提示", "将放弃所有未保存的信息，是否确认此操作？", function() {
				//弹框如果点是，进行重置
				confirmRest();
				gridEdit();
			},function () {
				//弹框如果点否，返回
				return ;
			}).show();
		}else{
			gridEdit();
		}
	}
	function gridEdit(){
		_operateType = "edit_grid";//操作类型设置为网格编辑
		showMapMsg("请选中一个网格开始编辑", false, true, false,null);//显示网格编辑提示信息
		setEditBtnClicked("grid_edit", true);//设置网格编辑按钮为点击状态
	}
	/**
	 * 取消网格编辑模式
	 * @author wangqi
	 * @since 2015/10/26
	 * */
	function cancelGridEdit() {
		hideMapMsg();//隐藏消息提示框
		_operateType = "";//将操作类型设置为空
		setEditBtnClicked("grid_edit", false);//取消网格编辑按钮的点击状态
	}
	
	/**
	 * 当操作模式为编辑网格模式时，网格图层的点击事件响应
	 * @author wangqi
	 * @since 2015/10/27
	 * */
	function layerClickWhenEdit(feature) {
		if(polygonEdit==null){
			showMapMsg("通过操作控制点来编辑网格图形", false, true, true,null);//显示提示信息
			polygonEditProperty = feature.properties;
			polygonEdit = Ai.Polygon(Ai.GeoUtils().ParseGeometryToLatlngs(feature.geometry), {color: 'green'});
			_editLayer.addLayer(polygonEdit);
			_editToolbar.editing(polygonEdit);
		}else{
			//有一个图形正在被编辑
		}
	}
	
	/**
	 * 保存被编辑的网格
	 * @author wangqi
	 * @since 2015/10/27
	 * */
	function saveGridEdit() {
		console.log("coordStr");
		console.log(geometryToStr(polygonEdit.getLatLngs()[0]));
		console.log(polygonEditProperty.ACT_ID)
		$("#trans_loading").show();//显示加载动画

		$.ajax({
			type: 'get',
			url: "/gisOptimize/module/actWarning/updateGridSHP.do",
			data: {
				actId: polygonEditProperty.ACT_ID,
				coordStr:geometryToStr(polygonEdit.getLatLngs()[0])
			},
			success: function(result) {
				$("#trans_loading").hide();//隐藏加载动画
				if(result.status == 0) {//保存成功
					showMessageTip("网格编辑成功，正在刷新...", true);//显示保存成功的提示信息
					refreshLayers();			//刷新图层
					wmsLayer.redraw();			//刷新网格图形
					confirmRest();
				}else {//保存失败
					showMessageTip(result.msg, false, 3000);//显示保存失败的提示信息
					confirmRest();
				}
			},
			error: function(result) {
				$("#trans_loading").hide();//隐藏加载动画
				showMessageTip("网络连接失败", false, 3000);//显示保存失败的提示信息
				confirmRest();
			}
		});

	}