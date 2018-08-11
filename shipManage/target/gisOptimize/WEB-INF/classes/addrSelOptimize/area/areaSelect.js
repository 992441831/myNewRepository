
var checkEnable;
var checkTreeNode;

// 页面初始化
$(document).ready(function() {
	checkEnable  = getQueryString('checkEnable');
	initAreaTree();
});

function initAreaTree() {
	var setting = {
			view: {
				selectedMulti: false
			},
			data: {
				key: {
					name: "NAME"
				},
				simpleData: {
					enable: true,
					idKey: "AREA_ID",
					pIdKey: "PARENT_AREA"
				}
			},
        	callback: {
                onClick: zTreeOnCheck
        	}
		};
	
	if (checkEnable == 1) {
		setting.check = new Object();
		setting.check.enable = true;
	}

	var list = [
        {"CSS_AREA_ID":null,"NAME":"浙江省","PARENT_AREA":100000,"AREA_LEVEL":2,"AREA_ID":330000,"CSS_LATN_ID":null,"CODE":null},
        {"CSS_AREA_ID":null,"NAME":"杭州市","PARENT_AREA":330000,"AREA_LEVEL":3,"AREA_ID":330100,"CSS_LATN_ID":null,"CODE":null},
        {"CSS_AREA_ID":null,"NAME":"湖州市","PARENT_AREA":330000,"AREA_LEVEL":3,"AREA_ID":330500,"CSS_LATN_ID":null,"CODE":null},
		{"CSS_AREA_ID":null,"NAME":"嘉兴市","PARENT_AREA":330000,"AREA_LEVEL":3,"AREA_ID":330400,"CSS_LATN_ID":null,"CODE":null},
		{"CSS_AREA_ID":null,"NAME":"金华市","PARENT_AREA":330000,"AREA_LEVEL":3,"AREA_ID":330700,"CSS_LATN_ID":null,"CODE":null},
		{"CSS_AREA_ID":null,"NAME":"丽水市","PARENT_AREA":330000,"AREA_LEVEL":3,"AREA_ID":331100,"CSS_LATN_ID":null,"CODE":null},
		{"CSS_AREA_ID":null,"NAME":"宁波市","PARENT_AREA":330000,"AREA_LEVEL":3,"AREA_ID":330200,"CSS_LATN_ID":null,"CODE":null},
		{"CSS_AREA_ID":null,"NAME":"绍兴市","PARENT_AREA":330000,"AREA_LEVEL":3,"AREA_ID":330600,"CSS_LATN_ID":null,"CODE":null},
		{"CSS_AREA_ID":null,"NAME":"台州市","PARENT_AREA":330000,"AREA_LEVEL":3,"AREA_ID":331000,"CSS_LATN_ID":null,"CODE":null},
		{"CSS_AREA_ID":null,"NAME":"温州市","PARENT_AREA":330000,"AREA_LEVEL":3,"AREA_ID":330300,"CSS_LATN_ID":null,"CODE":null}
	];

    var tree = $.fn.zTree.init($("#areaTree"), setting,list);
    var nodes = tree.getNodes();
    tree.expandNode(nodes[0], true);

	// $.ajax({
	// 	type : 'GET',
	// 	dataType : 'json',
	// 	url : "../pub/queryArea.do",
	// 	success : function(resultData) {
	// 		var tree = $.fn.zTree.init($("#areaTree"), setting, resultData.result);
	// 		var nodes = tree.getNodes();
	// 		tree.expandNode(nodes[0], true);
	// 	},
	// 	error : function(result) {
	// 		//alert("查询区域失败，代码:" + result.status);
	// 	}
	// });
}

function getSelectedArea() {
	var zTree = $.fn.zTree.getZTreeObj("areaTree");
	var retObj = new Object();
	if (checkEnable==1) {
		var nodes = zTree.getCheckedNodes(true);
		if (nodes != null) {
			var areaIds = "";
			for (var i=0; i<nodes.length; ++i) {
				if (!nodes[i].isParent) {
					areaIds += nodes[i].AREA_ID + ',';
				}
			}
			if (areaIds.length > 0) {
				areaIds = areaIds.substr(0, areaIds.length-1);
			}
			retObj.areaIds = areaIds;
		}
		else {
			retObj = null;
		}
	}
	else {
		var nodes = zTree.getSelectedNodes();
		if (nodes != null && nodes.length != 0) {
			retObj.area_id = nodes[0].AREA_ID;
			retObj.area_name = nodes[0].NAME;
			retObj.area_level = nodes[0].AREA_LEVEL;
		}
		else {
			retObj = null;
		}
	}
	return retObj;
}

function cancelHandler() {
	self.close();
}

function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

/***
 * @author zhengsiliang
 * @since 2017-08-01
 * 区域选择树节点点击事件
 * 点击树节点移动父页面地图至选中区域中心点
 */
function zTreeOnCheck(event, treeId, treeNode){
	var areaId=treeNode.AREA_ID;
	checkTreeNode=treeNode;
	parent.setAreaSelect(checkTreeNode);
// 	$.ajax({
//         type : 'GET',
//         dataType : 'json',
//         url : "../pub/queryAreaCentroidXY.do",
// 		data:{area_id:areaId},
//         success : function(result) {
//         	if(result.status!=0){
//             //    alert("查询区域坐标失败，代码:" + result.status);
//         		return;
// 			}
//         	if(result.status==0){
//                 var x=result.X;
//                 var y=result.Y
//                 parent.moveMapToXY(x,y);
// 			}
//         },
//         error : function(result) {
// //            alert("查询区域失败，代码:" + result.status);
//         }
// 	});

}

function getCheckTreeNode() {
	return checkTreeNode;
}