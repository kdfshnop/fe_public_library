/**
 * Created by mac on 15/4/9.
 */
define([
    'jQuery',
    'lib/ui/class',
    'lib/ui/template'
],function($,Class,tmpl){

    var DatePicker = Class.create({
        setOptions: function(opts){
            this.options = {
                template: '',
                element:null
            };

            $.extend(true,this.options,opts);
        }
    },{
        init: function(element,options){
            this.element = $(element);
            this.setOptions(options);

            this.bindEvent();
        },
        //显示
        show: function(){},
        //隐藏
        hide: function(){},
        //draw绘制
        draw: function(){
            //先写这个，这个完成了基本就算写完了
        },
        bindEvent: function(){

        }
    });


    return DatePicker;

});