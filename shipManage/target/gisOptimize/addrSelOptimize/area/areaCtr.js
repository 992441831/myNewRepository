
var checkEnable;
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
			}
		};
	
	if (checkEnable == 1) {
		setting.check = new Object();
		setting.check.enable = true;
	}

	$.ajax({
		type : 'GET',
		dataType : 'json',
		url : "../pub/queryArea.do",
		success : function(resultData) {
			var tree = $.fn.zTree.init($("#areaTree"), setting, resultData.result);
			var nodes = tree.getNodes();
			tree.expandNode(nodes[0], true);
		},
		error : function(result) {
			//alert("查询区域失败，代码:" + result.status);
		}
	});
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


