/**
 *   绝对定位顶部input查询框
 *
 */
define([
        'jQuery',
        'lib/ui/class'
],function($,Class){
   var Celling=Class.create({
       setOptions:function(opts){
          var options={
              //容器对象
              container:null,
              //选择input显示的方式，滑动和固定两种类型
              selectSild:"",
              top:0,
              css:{
                  "position":"absolute",
                  "top":"100px"
              },
              placeholder:"",
              //判断input的值是否为空   是否等于placeholder的值
              isValue:function(){
                  if(this.container.attr(this.placeholder)==this.container.val()){
                         return false;
                  }else{
                       return true;
                  }
              },
              //按回车键返回事件
              onEnter:function(callback){
                   this.container.focus(function(){
                       document.onkeydown=function(event){
                           var e=event||window.event;
                           if(e&& e.keyCode==13){
                                callback();
                           }
                       }
                   });
              }
          };
           $.extend(true,this,options,opts);

       }
   },{
     init:function(opts){
         var _this=this;
         this.setOptions(opts);
         if(!this.container||this.container.size()<=0){
             return false;
         }
         this.container.css(this.css);
         this.method[this.selectSild](_this);
     },
     method:{
         //带滑动效果
         scrollBind:function(_this){
             var top=Number(_this.top);
             $(window).scroll(function(){
                 var scrollTop=$(window).scrollTop();
                 _this.container.animate({"top":(top+scrollTop)},100);
             });
         },
         //固定顶部
         topBind:function(_this){
             this.container.css({
                 "position":"fixed",
                 "top":_this.top
             });
         }
     }
   });
    return Celling;
});