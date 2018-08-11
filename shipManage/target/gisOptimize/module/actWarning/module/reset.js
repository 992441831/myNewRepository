	/*********************************************
	 * 此文件包含了GIS平台网格管理模块中重置功能的代码
	 * @author wangqi
	 * @since 2015/10/26
	 *********************************************/

	/**
	 * 重置按钮的点击事件
	 * @author wangqi
	 * @since 2015/10/23
	 * */
	function resetMapClick(event) {
		//当event参数不为空时，说明函数通过点击reset按钮调用，则响应事件应该重置地图extent；
		//当event参数为空时，说明函数被直接调用，则不重置地图extent
		var changeExtent = event ? true : false;
		//根据不同的操作类型确定重置按钮的点击事件
		switch(_operateType) {
			case "edit_grid":
				if(_editLayer.getLayers().length>0) {
					createConfirmAlert("提示", "活动"
					+"<font style='color:#00BFFF;'>"+polygonEditProperty.ACT_NAME+"</font>图形已经改变，是否放弃保存？", function() {
						confirmRest(changeExtent);//调用确认重置函数
					}).show();
				}else {//否则直接切换操作模式
					confirmRest(changeExtent);//调用确认重置函数
				}
				break;
			case "add_grid":
				if(_drawLayer.getLayers().length>0) {
					createConfirmAlert("提示", "已有活动" +"添加，是否放弃保存？", function() {
						confirmRest(changeExtent);//调用确认重置函数
					}).show();
				}else {//否则直接切换操作模式
					confirmRest(changeExtent);//调用确认重置函数
				}
				break;
			default:
				confirmRest(changeExtent);//调用确认重置函数
				break;
		}
	}
	
	
	/**
	 * 确定对地图进行重置
	 * @author wangqi
	 * @since 2015/10/27
	 * @param changeExtent 是否重置地图extent
	 * */
	function confirmRest(changeExtent) {
		hideMapMsg();//隐藏消息提示框
		polygonDrawer.disable();  		//关闭绘图控件
		$("#inputBox").hide();			//隐藏中间录入框
		_operateType = "";				//将操作类型设置为空
		_editLayer.clearLayers();		//清空编辑中间图层
		_drawLayer.clearLayers();		//清空新增中间图层
		setEditBtnClicked("grid_add", false);//设置网格添加按钮为正常状态
		setEditBtnClicked("grid_edit", false);//设置网格添加按钮为正常状态
		setEditBtnClicked("grid_clear", false);//设置网格添加按钮为正常状态
		polygonEdit=null;
		polygonEditProperty=null;
		polygonAdd=null;
		polygonAddProperty=null;
	}
	
	/**
	 * 提示信息框取消按钮的点击事件
	 * @author wangqi
	 * @since 2015/10/21
	 * */
	function msgCancelClick() {
		//根据当前的操作类型判断取消按钮的响应事件
		switch(_operateType) {
			case "edit_grid"://若操作类型为网格编辑时
				//若已有网格被编辑时，取消对其的编辑
				if(_editLayer.getLayers().length>0) {
					_editLayer.clearLayers();		//清空中间图层
					polygonEdit = null;
					polygonEditProperty = null;
					showMapMsg("请选中一个活动图形开始编辑", false, true, false,null);
				}else {//否则取消网格编辑操作
					cancelGridEdit();
				}
				break;
			case "add_grid"://若操作类型为新增网格
				if(_drawLayer.getLayers().length>0) {//若绘制出了图形，则清除该图形
					_drawLayer.clearLayers();		//清空中间图层
					polygonAdd =null;				//清空已绘制的图形
					polygonAddProperty =null;		//清空已添加的属性
					gridAdd();
					//showMapMsg("请使用画笔开始绘图", false, true, false,null);//显示增加的提示信息
				}else {//若没有绘制出新增的图形则取消新增网格操作
					cancelDrawGrid();
				}
				break;
			case "grid_clear"://清除图形模式
				cancelGridClear();
				break;
			default: break;
		}
	}
	
	/**
	 * 提示信息框保存按钮点击事件
	 * @author wangqi
	 * @since 2015/10/21
	 * */
	function msgSaveClick() {
		//根据当前的操作类型判断保存按钮的响应事件
		switch(_operateType) {
			case "edit_grid"://若操作类型为网格编辑时，保存被修改的网格数据
				saveGridEdit();
				break;
			case "add_grid":
				popWindow();//弹窗窗口
				break;    //若操作类型为新增网格
			default: break;
		}
	}