	/*********************************************
	 * 此文件包含了GIS平台网格管理模块中网格镂空功能的代码
	 * @author zqq
	 * @since 2018/8/3
	 *********************************************/
	var polygonDrawer = null;//新增控件
	var _drawLayer=null;//绘制展示图层
	var polygonAdd = null;
	var polygonAddProperty = null;
	/**
	 * 初始化网格镂空绘图工具
	 * @author zqq
	 * @since 2015/10/27
	 * */
	function initGridAddDraw() {
		//创建中间图层
		_drawLayer = new Ai.FeatureGroup();
		_gridmap.addLayer(_drawLayer);

		//创建绘图工具
		grahicLayer = Ai.GeoJSON();
		_gridmap.addLayer(grahicLayer);
		guideLayers = [grahicLayer];
		//初始化图绘图控件
		var options = {
			guideLayers: guideLayers
		};
		polygonDrawer = Ai.DrawPolygon(_gridmap, options);
	}



	/**
	 * 网格新增按钮的点击事件
	 * */
	function gridAddClick() {
		if(_operateType!="add_grid"&&_editLayer.getLayers().length>0){
			//其他模式，且已经有修改，点击此按钮
			createConfirmAlert("提示", "将放弃所有未保存的信息，是否确认此操作？", function() {
				//弹框如果点是，进行重置，并切换到添加网格模式
				confirmRest();
				gridAdd();
			},function () {
				//弹框如果点否，返回
				return ;
			}).show();
		}else if(_operateType!="add_grid"&&_editLayer.getLayers().length==0){
			//其他模式，没有修改，点击此按钮，直接重置，并切换到添加模式
			confirmRest();
			gridAdd();
		}else if(_operateType="add_grid"&&_drawLayer.getLayers().length>0){
			//添加网格模式，且已经有修改，点击此按钮
			createConfirmAlert("提示", "将放弃所有未保存的信息，是否确认此操作？", function() {
				//弹框如果点是，进行重置
				confirmRest();
			},function () {
				//弹框如果点否，返回
				return ;
			}).show();
		}else if(_operateType="add_grid"&&_drawLayer.getLayers().length==0){
			//添加网格模式，没有修改，点击此按钮，直接重置
			confirmRest();
		}
	}
	function gridAdd(){
		_operateType = "add_grid";//操作类型设置为网格编辑
		setEditBtnClicked("grid_add", true);//设置网格添加按钮为点击状态
		showMapMsg("请使用画笔开始绘制活动区域", false, true, false,null);
		//激活绘图控件
		polygonDrawer.enable();
		//绘制完成后的操作
		_gridmap.on(AiDrawEvent.CREATED, function(e) {
			if (e.layerType == "polygon") {
				polygonAdd = polygonDrawer.polygon(e);
				_drawLayer.addLayer(polygonAdd);		//将画好的图形添加进中间图层
				polygonDrawer.editing(polygonAdd);	//编辑功能开启
				polygonDrawer.disable();
				showMapMsg("点击<font style='color:#00BFFF;'>确认</font>开始录入详细信息，或点击<font style='color:#00BFFF;'>取消</font>重新绘制", false, true, true,"确认");//显示网格图形提示信息
			}
		});
	}

	/**
	 * 保存绘制的网格图形
	 * @author zqq
	 * @since 2015/10/29
	 * */
	function saveDrawGridGraphic() {
		//获取弹窗输入信息
		polygonAddProperty = getInputInfo();

		console.log("4.polygonAddProperty");
		console.log(polygonAddProperty);
		console.log(geometryToStr(_drawLayer.getLayers()[0].getLatLngs()[0]));
		$("#inputBox").hide();
		$("#trans_loading").show();//显示加载动画

		$.ajax({
			type: 'get',
			url: "/gisOptimize/module/actWarning/insertGrid.do",
			data:{ name:polygonAddProperty.name,
				addr:polygonAddProperty.addr,
				begintime:polygonAddProperty.begintime,
				endtime:polygonAddProperty.endtime,
				frequency:polygonAddProperty.frequency,
				recorder:polygonAddProperty.recorder,
				record_time:polygonAddProperty.record_time,
				coordStr:geometryToStr(_drawLayer.getLayers()[0].getLatLngs()[0])
			},
			success: function(result) {
				$("#trans_loading").hide();//隐藏加载动画
				if (result.status == 0) {
					showMessageTip("活动添加成功，正在刷新...", true,3000);
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
	}