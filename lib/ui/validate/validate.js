define([
    'jQuery',
    'lib/ui/class',
    'lib/ui/json',
    'lib/ui/validate/rules',
    'lib/ui/validate/messages',
    'lib/ui/tips'
],function($,Class,json,rules, messages,Tips){

    //这个是验证单个元素的类，公开出去的方法会提供多个元素验证
    var Validate = Class.create({

        setOptions: function(opts){
            var options = {
                //提示文案
                messages:{},
                //验证规则
                defaultRules:{},
                rules:{},
                tips:null,
                tipsOptions:{
                    direction:'right',
                    template:''
                },
                ignore:'',
                errorClass:'error',
                validClass:'valid',
                onfocus: function(){
                    //this.show();
                },
                onkeyup: function(e){
                    clearTimeout(e.target.__timeout);
                    e.target.__timeout = setTimeout(this.show.bind(this,e.target),this.options.validTime || 1000 );
                },
                onblur: function(e){
                    this.__blurTimeobj=setTimeout(function(){
                        this.show(e.target);
                    }.bind(this),200 );
                },
                onclick: function(event){
                   var target = event.target,
                       type=target.type;
                   if(type){
                       type=type.toLowerCase();
                       if(type === 'checkbox' || type === 'radio' ){
                           this.show(target);
                       }
                   }

                },
                submitCallback: function(){
                    return true;
                }
            };
            //继承默认的验证规则
            $.extend(true,options.defaultRules,rules);
            $.extend(true,options.messages,messages);
            $.extend(true,this.options={},options,opts);
        }
    },{
        init : function(element,options){
            this.element = $(element);
            this.setOptions(options);

            //如果没有用其他的提示控件，则默认使用Tips
            if(!this.options.tips){
                this.options.tips = Tips.tip(this.options.tipsOptions.direction,this.options.tipsOptions.template);
            }

            //radius checkbox会有多个元素

            //this.parent = this.element.parent();
            this.elements = this.getElements(this.element);

            this.bindEvent();
        },
        isForm: function(){
            return this.element.size() ==1 && this.element[0].nodeName.toLowerCase() ==='form';
        },
        getElements: function(){
            var elements = this.element;
            if(this.isForm() ){
                elements=elements.find( "input, select, textarea" )
                    .not( ":submit, :reset, :image, [disabled], [readonly]" )
                    .not( this.options.ignore );
            }
            return elements;
        },
        highlight: function( element, errorClass, validClass ) {
            if ( element.type === "radio" ) {
                this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
            } else {
                $( element ).addClass( errorClass ).removeClass( validClass );
            }
        },
        unhighlight: function( element, errorClass, validClass ) {
            if ( element.type === "radio" ) {
                this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
            } else {
                $( element ).removeClass( errorClass ).addClass( validClass );
            }
        },
        //获取input的value值
        getValue: function(element){
            //checkbox、select、radios、input
            //checkbox.value
            //select.options[select.selectIndex]
            //radius.value
            //input.value
            var val,
                $element = $(element),
                type = element.type;

            if ( type === "radio" || type === "checkbox" ) {
                return $( "input[name='" + element.name + "']:checked" ).val();
            } else if ( type === "number" && typeof element.validity !== "undefined" ) {
                return element.validity.badInput ? false : $element.val();
            }

            val = $element.val();
            if ( typeof val === "string" ) {
                return val.replace(/\r/g, "" );
            }
            return val;
        },
        optional: function(element) {
            var val = this.getValue(element );
            return !this.options.defaultRules.required.call( this, val, element );
        },
        findByName: function( name ) {
            return $("[name='" + name + "']" );
        },
        getLength: function( value, element ) {
            switch ( element.nodeName.toLowerCase() ) {
                case "select":
                    return $( "option:selected", element ).length;
                case "input":
                    if ( this.checkable( element ) ) {
                        return this.findByName( element.name ).filter( ":checked" ).length;
                    }
            }
            return value.length;
        },
        checkable: function( element ) {
            return ( /radio|checkbox/i ).test( element.type );
        },
        formatString: function(str, options){

            if(!options){
                return str;
            }

            return str.replace(/\{(.+?)\}/ig, function(match, key){
                var value = typeof(options) != 'object'?options: options[key];
                return typeof value == 'undefined' ? match : value;
            });
        },
        //显示错误信息
        show: function(element){
            var el = $(element).parent().size()>0? $(element).parent():element,
                message = this.check(element) || '';
            this.parent = el;
            if(message !== '' ){
                this.options.tips.show(el,message );
                this.highlight(this.parent, this.options.errorClass, this.options.validClass);
                return false;
            }
            this.hide();
            return true;
        },
        ajaxValidate: function(url,val,callback){

            var t=true;

            if(this.res){
                this.res.abort();
            }

            this.res = $.ajax({
                type: "GET",
                url: url,
                data: "value="+val,
                async: false,
                success: function(data){
                    if(data.status){
                        t=data.data;
                        callback &&(callback(data.data) );
                    }

                }
            });

            return t;
        },
        //循环input的验证信息
        check: function(element){
            var options = $.extend(true,json.parse($(element).attr('data-validate-params')||'{}' ),this.options );
            var val = this.getValue(element),
                //rule = null,
                msg = '',
                element = element,
                text = null,
                messages = options.messages,
                defaultRules = options.defaultRules,
                rules = options.rules;

            for(var rule in rules){

                text = rules[rule];
                //text =typeof(text)!=='string' ? text : {text:text};
                if(typeof(text) == 'boolean'){
                    text = {};
                }
                if(!text.text){
                    text.text = messages[rule ];
                }

                if(text.url && text.url!='' ){
                    msg = this.ajaxValidate(text.url,val,text.params);
                    if(typeof(msg) !== 'string'){
                        msg = text.text;
                    }
                    break;
                }else if(!defaultRules[rule].call(this,val,element,text.params)  ){
                    msg = text.text;
                    break;
                }
            }
            return this.formatString(msg,(text &&text.params) || '');
        },
        //隐藏错误信息
        hide: function(){
            this.options.tips.hide();
            this.unhighlight(this.parent, this.options.errorClass, this.options.validClass);
            return true;
        },
        delegate: function(){

        },
        submit: function(){
            clearTimeout(this.__blurTimeobj);
            if(this.isForm() ){
                var elements = this.elements,
                    isSubmit = true;

                for(var i= 0,len=elements.size();i<len;i++){
                    if(!this.show(elements[i]) ){
                        elements[i].focus();
                        isSubmit = false;
                        break;
                    }
                }

                if(isSubmit && this.options.submitCallback()){
                    //this.options.submitCallback &&(this.options.submitCallback() );
                    this.element.submit();
                }
            }
            return false;
        },
        bindEvent: function(){
            this.elements.on('blur',this.options.onblur.bind(this) ).
                on('keyup',this.options.onkeyup.bind(this) ).
                on('focus',this.options.onfocus.bind(this) ).
                on('click',this.options.onclick.bind(this) );

            if(this.isForm() ){
                this.element.find('.ui-validate-submit,:submit').on('click',this.submit.bind(this) );
            }
        }
    });


    var rulesMap = {
        //'default':rules
    };

    return Validate;

});