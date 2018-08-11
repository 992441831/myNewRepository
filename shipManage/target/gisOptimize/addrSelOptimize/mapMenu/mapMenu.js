function showMapMenu() {
    $(".map-menus").show();//显示地图右上角菜单
}

function initMapMenuFrame() {
    //监听地图右上角父菜单的点击事件
    $(".map-menus .button").click(function(e) {
        e.stopPropagation();//阻止事件冒泡
        //迭代隐藏同级的其它菜单的下拉面板
        var b = $(this);
        $(".map-menus .button").each(function(index, el) {
            if(el.id != b[0].id) {
                $(el).find(".panel").hide();
                $(el).removeClass("expanded");
            }
        });

        //控制下拉面板的显示或隐藏，控制箭头的方向
        var panel = $(this).find(".panel");
        if(panel.is(':visible')) {
            panel.hide();
            b.removeClass("expanded");
        }else {
            panel.show();
            b.addClass("expanded");
        }
    });

    //监听地图右上角单选框的事件
    $(".map-menus .panel .radio-btn").click(function(e) {
        e.stopPropagation();//阻止事件冒泡
    });

    //监听地图右上角复选框事件
    $(".map-menus .panel .checkbox-btn").click(function(e) {
        e.stopPropagation();//阻止事件冒泡
        if(!$(this).hasClass("checked")) {
            $(this).addClass("checked");
        }else {
            $(this).removeClass("checked");
        }
    });
}