/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：悟空找房移动端FE-MVC框架
 2. 页面名称：modal (jQuery扩展方法 - 模态框)
 3. 作者：zhaohuagang@lifang.com 
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
自定义的modal框
实例：
    $.modal({
        "id" : "alertModalDialog" ,
        "title" : "提示信息" ,
        "content" : "你这么牛逼你妈知道吗？" ,
        "buttons" : [
             { "text" : "确定" , "className" : "text-success" , "clickInterface" : function(){ $.modal.close("alertModalDialog") ; } } ,
             { "text" : "取消" , "className" : "text-info" , "clickInterface" : function(){ $.modal.close("alertModalDialog") ; } }
        ]
    }) ;
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$.modal = function(params) {
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    不定义title的话title就是警告
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    var title = (params === null || params.title === undefined) ? "警告" : params.title ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
   每个modal对应一个遮罩层
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    var $modalMask = $(document.createElement("DIV")).addClass("wkzf-modal-mask").attr("id", params.id + "Mask") ;
    $(document.body).append($modalMask) ; 
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    绘制modal层
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    var $modal = $(document.createElement("DIV")).attr("id", params.id).addClass("wkzf-modal").append("<div class=\"modal-header\">" + title + "</div>").append("<div class=\"modal-body\">" + params.content + "</div>") ;
    var $modalFooter = $(document.createElement("DIV")).addClass("modal-footer") ;
    var buttons = params.buttons ;
    for(var a = 0 ; a < buttons.length ; a ++) {
        var button = buttons[a] ;        
        var $button = $(document.createElement("A")).attr("href", "javascript:void(0);").addClass("wkzf-btn wkzf-btn-transparent").text(button.text) ;        
        if(button.className !== undefined && button.className !== null && button.className !== "") $button.addClass(button.className) ;
        $button.css({ "width" : 100 / buttons.length + "%"}) ;
        if($.isFunction(button.clickInterface)) $button.click(button.clickInterface) ;
        $modalFooter.append($button) ;
    }
    $modal.append($modalFooter) ;
    $(document.body).append($modal) ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    显示并重定位modal
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    $.modal.show(params.id) ;
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
显示modal，不影响遮罩层
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$.modal.show = function(id) {
    $("#" + id + "Mask").fadeIn(200) ;
    $("#" + id).css({ "left" : parseInt(($(window).width() - $("#" + id).width()) / 2 , 10) , "top" :  parseInt(($(window).height() - $("#" + id).height()) / 2 , 10) }).delay(200).slideDown(200) ;    
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
隐藏modal，不影响遮罩层
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$.modal.hide = function(id) {    
    $("#" + id).slideUp(200) ; 
    $("#" + id + "Mask").delay(200).fadeOut(200) ;
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
关闭modal，根据需要决定是否隐藏遮罩层
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$.modal.close = function(id) {    
    $("#" + id + ", #" + id + "Mask").remove() ;    
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
alert框的定义，注意id如果不定义，就是由wkzfModal + 时间戳字符串来构造，避免重复
实例：
$.alert({
    "title" : "警告你" ,
    "content" : "赶紧送点吃的过来"
}) ;
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$.alert = function(params) {
    var id = (params === null || params.id === null || params.id === undefined) ? "wkzfModal" + new Date().getTime() : params.id ;
    $.modal({
        "id" : id ,
        "title" : params.title ,
        "content" : params.content ,
        "buttons" : [
             { "text" : "确定" , "className" : "text-success" , "clickInterface" : function(){ $.modal.close(id) ; } }
        ]
    }) ;
} ;
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
confirm框的定义,注意id是由wkzfModal + 时间戳字符串来构造，避免重复
实例：
    $.confirm({
        "id" : "confirmDialog" ,
        "title" : "智商测试题" ,
        "content" : "如花和苏菲玛索摆在你面前你会选择如花吗？" ,
        "confirmText" : "是" ,
        "confirmInterface" : function() { alert("sb") ; } ,
        "cancelText" : "否 " ,
        "cancelInterface" : function() { alert("好样的！") ; $.modal.close("confirmDialog") ; } 
    }) ;
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$.confirm = function(params) {
    var id = (params === null || params.id === null || params.id === undefined) ? "wkzfModal" + new Date().getTime() : params.id ;
    var confirmText = (params === null || params.confirmText === null || params.confirmText === undefined) ? "确定" : params.confirmText ;
    var confirmClassName = (params === null || params.confirmClassName === null || params.confirmClassName === undefined) ? null : params.confirmClassName ;
    var confirmInterface = (params === null || params.confirmInterface === null || params.confirmInterface === undefined) ? $.noop : params.confirmInterface ;
    var confirmBtn = { "text" : confirmText , "clickInterface" : confirmInterface } ;
    if(confirmClassName) confirmBtn.className = confirmClassName ;
    var cancelText = (params === null || params.cancelText === null || params.cancelText === undefined) ? "取消" : params.cancelText ;
    var cancelClassName = (params === null || params.cancelClassName === null || params.cancelClassName === undefined) ? null : params.cancelClassName ;
    var cancelInterface = (params === null || params.cancelInterface === null || params.cancelInterface === undefined) ? $.noop : params.cancelInterface ;
    var cancelBtn = { "text" : cancelText , "clickInterface" : cancelInterface } ;
    if(cancelClassName) cancelBtn.className = cancelClassName ;
    $.modal({
        "id" : id ,
        "title" : params.title ,
        "content" : params.content ,
        "buttons" : [confirmBtn, cancelBtn]
    }) ;
} ;
