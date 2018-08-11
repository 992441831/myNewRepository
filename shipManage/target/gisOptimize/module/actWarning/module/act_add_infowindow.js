$(function(){
    $("#inputBox").css("left", ($("body").width()-$("#inputBox").outerWidth(true))/2+"px");
});

/**
 * 弹窗录入活动信息
 */
function popWindow(){
    console.log("1._drawLayer");
    console.log(_drawLayer.getLayers());
    console.log("2.polygonDrawer");
    console.log(polygonDrawer);
    console.log("3._latlngs");
    console.log(geometryToStr(_drawLayer.getLayers()[0].getLatLngs()[0]));
    $("#inputBox").show();  //显示消息录入窗口
    $("#msgBox").hide();    //隐藏顶端消息窗
    $("#validate").click(saveDrawGridGraphic); //弹窗中确认按钮点击事件
    $("#cancle").click(cancelDrawGrid);        //弹窗中取消按钮点击事件
    $("#close_btn").click(returnLast);
}

function returnLast(){
    $("#inputBox").hide();  //显示消息录入窗口
    $("#msgBox").show();    //隐藏顶端消息窗
}

function getInputInfo(){
    var name = $("#name").val();
    var addr = $("#addr").val();
    var frequency= $("#frequency").val();
    var begintime=$("#begintime").val();
    var endtime=$("#endtime").val();
    var recorder=$("#recorder").val();
    var record_time=$("#record_time").val();

    var obj={};
    obj.name=name;
    obj.addr=addr;
    obj.frequency=frequency;
    obj.begintime=begintime;
    obj.endtime=endtime;
    obj.recorder=recorder;
    obj.record_time=record_time;

    return obj;
}
