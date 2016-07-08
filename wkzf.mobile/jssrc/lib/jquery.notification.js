/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：悟空找房移动端FE-MVC框架
 2. 页面名称：notification (jQuery扩展方法 - 通知)
 3. 作者：zhaohuagang@lifang.com
 4. 实例：
    $.notification({
        "html" : "出大事啦！我中奖啦！" ,
        "onClick" : function(){} ,
        "onClose" : function(){} ,
        "time" : 5  //单位为秒
    }) ;
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$.notification = function(params) {
    if($(".wkzf-notification").size() === 0) {
        var $noti = $(document.createElement("DIV")).addClass("wkzf-notification") ;
        var $content = $(document.createElement("DIV")).addClass("notification-content").html(params.html) ;
        var $handlerBar = $(document.createElement("DIV")).addClass("notification-handle-bar") ;
        $noti.append($content).append($handlerBar) ;
        $(document.body).append($noti) ;        
    }
    $(".wkzf-notification").off("click").on("click", params.onClick).slideDown(500) ;
    if(params.time !== undefined && params.time) {
        window.setTimeout(function(){
            $.notification.close() ;
            if(params.onClose !== undefined && params.onClose) params.onClose() ;
        }, params.time * 1000) ;
    }
} ;

$.notification.close = function() {
    $(".wkzf-notification").slideUp(500) ;
} ;