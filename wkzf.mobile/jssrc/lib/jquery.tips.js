/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：悟空找房移动端FE-MVC框架
 2. 页面名称：tips (jQuery扩展方法 - 提示)
 3. 作者：zhaohuagang@lifang.com
 4. 实例：
    $.tips("至少选择2项", 2, function(){ alert("提示看完了") ; }) ;
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$.tips = function(content, time, callback) {
    var $tips = $(document.createElement("DIV")).addClass("wkzf-tips").text(content) ;
    $(document.body).append($tips) ;
    $tips.fadeIn(200).css({ "left" : parseInt(($(window).width() - $tips.width()) / 2, 10) + "px" , "top" : parseInt(($(window).height() - $tips.height()) / 2, 10) + "px" }) ;    
    if(time) {
        $tips.delay(time * 1000).fadeOut(200) ;
        window.setTimeout(function(){
            $tips.remove() ;
            if (callback) callback() ;
        }, time * 1000) ;         
    }    
} ;