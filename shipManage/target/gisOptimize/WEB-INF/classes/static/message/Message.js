/***************************************
 * 消息组件类
 * @author wangqi
 * @since 2017/10/10
 ***************************************/
/**
 * 构造函数
 * @author wangqi
 * @since 2017/10/10
 * @param property 配置项
 * */
Message = function(property) {
	this.type = typeof property.type!="undefined" ? property.type : Message.INFO;//消息类型，默认为一般信息
	this.message = typeof property.message!="undefined" ? property.message : "";//消息文本
	this.hidMS = typeof property.hidMS!="undefined" ? property.hidMS : 2000;//隐藏时间，默认为2000ms
	this.dom = $('<div class="uiMessage '+this.type+'">'
		+'<div class="messageImage">'
			+'<div class="messageIcon"></div>'
		+'</div>'
		+'<div class="messageText">'+this.message+'</div>'
	+'</div>');
	$(document.body).append(this.dom);
}

Message.SUCCESS = "SUCCESS";/**静态常量，提示框中消息类型为成功**/
Message.WARNING = "WARNING";/**静态常量，提示框中消息类型为警告**/
Message.INFO = "INFO";/**静态常量，提示框中消息类型为信息**/
Message.ERROR = "ERROR";/**静态常量，提示框中消息类型为错误**/
Message.UNHIDE = "UNHIDE";/**静态常量，若hidMS设置为此值，提示框将不隐藏**/

/**
 * 显示提示框
 * @author wangqi
 * @since 2017/10/10
 * */
Message.prototype.show = function() {
	var that = this;
	var dom = that.dom;
	setTimeout(function() {
		dom.css({top: "20px", opacity: 1});
		if(that.hidMS != Message.UNHIDE) {
			setTimeout(function() {
				dom.css({top: "-20px", opacity: 0});
				setTimeout(function() {
					dom.remove();
				}, 300);
			}, that.hidMS);
		}
	}, 1);
	return that;
}

//隐藏
Message.prototype.hide = function() {
	var dom = this.dom;
	dom.css({top: "-20px", opacity: 0});
	setTimeout(function() {
		dom.remove();
	}, 300);
	return this;
}

//注销
Message.prototype.destroy = function() {
	this.dom.remove();
}

//静态变量，加载动画对象
Message.loading = $('<div class="uiLoading">'
	+ '<div class="content">'
	+ '<div class="load-image"></div>'
	+ '<div class="load-message"></div>'
	+ '</div>'
+ '</div>');

/**
 * 静态函数，显示加载动画
 * @author wangqi
 * @since 2016/11/2
 * @param message 记载动画的提示信息
 * */
Message.showLoading = function(message) {
	$(document.body).append(Message.loading);
	Message.loading.find(".load-message").text(typeof message!="undefined" ? message : "加载中...");
	Message.loading.show();
	Message.loading.find(".content").css("margin-top", ($(window).height()-Message.loading.find(".content").outerHeight())/5*2);
	//监听页面大小变化事件
	$(window).resize(function() {
		Message.loading.find(".content").css("margin-top", ($(window).height()-Message.loading.find(".content").outerHeight())/5*2);
	});
}

/**
 * 静态函数，隐藏加载动画
 * @author wangqi
 * @since 2016/11/2
 * */
Message.hideLoading = function() {
	Message.loading.hide();
}


//静态变量，加载动画对象
Message.loading2 = $('<div class="uiLoading2">'
	+ '<div class="content">'
	+ '<div class="load-image"></div>'
	+ '<div class="load-message"></div>'
	+ '</div>'
+ '</div>');

/**
 * 静态函数，显示加载动画
 * @author wangqi
 * @since 2016/11/2
 * @param message 记载动画的提示信息
 * */
Message.showLoading2 = function(message) {
	$(document.body).append(Message.loading2);
	Message.loading2.find(".load-message").text(typeof message!="undefined" ? message : "加载中...");
	Message.loading2.show();
	Message.loading2.find(".content").css("margin-top", ($(window).height()-Message.loading2.find(".content").outerHeight())/5*2);
	//监听页面大小变化事件
	$(window).resize(function() {
		Message.loading2.find(".content").css("margin-top", ($(window).height()-Message.loading2.find(".content").outerHeight())/5*2);
	});
}

/**
 * 静态函数，隐藏加载动画
 * @author wangqi
 * @since 2016/11/2
 * */
Message.hideLoading2 = function() {
	Message.loading2.hide();
}


//静态变量，气泡提示
Message.tooltip = $('<div class="uiTooltip">'
	+ '<div class="messageText"></div>'
	+ '<div class="messageDelta border"></div>'
	+ '<div class="messageDelta background"></div>'
	+ '</div>'
+ '</div>');


/**
 * 静态函数，显示气泡提示
 * @author wangqi
 * @since 2016/11/2
 * @param message 提示信息
 * */
Message.showTooltip = function(message, x, y) {
	$(document.body).append(Message.tooltip);
	Message.tooltip.find(".messageText").text(message);
	Message.tooltip.show();
	Message.tooltip.css({left: x+"px", top: y+"px"});
}

/**
 * 静态函数，隐藏气泡提示
 * @author wangqi
 * @since 2016/11/2
 * */
Message.hideTooltip = function() {
	Message.tooltip.hide();
}