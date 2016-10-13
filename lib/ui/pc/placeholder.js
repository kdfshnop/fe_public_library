/**
  description	Placeholder
  @author	xiaomin@lifang.com
  @param
  例:
	require.async('common:widget/ui/placeholder/placeholder.js',function(Placeholder){
		var placeholder = new Placeholder({
			element:$('input'),
			tipsNode:'data-placeholder'
		});
		//判断是否为空
		var bool = placeholder.isEmpty(jQueryElement);
		//清空提示,如:在提交form表单的时候，有可能会把hold值带到后端。
		placeholder.clear();
	});
*/
define([
	'jQuery',
	'lib/ui/class'
],function($,Class){
	var Placeholder = Class.create({
		setOptions: function(opts){
			var options = {
				//需要绑定提示的元素
				element:null,
				//提示文案节点
				tipsNode:'data-placeholder',
				//样式
				selClass:'input-sel',
				selClassText:''
			};
			$.extend(true, this,options,opts);
		}
	},{
		init: function(options){
			this.setOptions(options);
			var _this = this,
				element = this.element;
			this.focusFlag = false;
			if(element && element.size()>0 ){
				element.each(function(){
					_this._showTips($(this) );
				});
				this.bindEvent();
			}
		},
		_showTips:function(target){
			this.focusFlag = true;
			if(this._checkValue(target) ){
				target
					.addClass(this.selClass)
					.val(target.attr(this.tipsNode) );
				target.get(0).style.cssText += this.selClassText;
			}else{
				if(this.selClass)target.removeClass(this.selClass);
				target[0].style.cssText = target[0].style.cssText.replace(this.selClassText,"","g");
			}
		},
		_hideTips:function(target){
			this.focusFlag = false;
			if(this._checkValue(target) ){
				var selClass = this.selClass;
				var selClassText = this.selClassText;
				if(selClass){
					target.removeClass(selClass);
				}
				target[0].style.cssText = target[0].style.cssText.replace(selClassText,"","g");
				target[0].value = "";
				target[0].select();
			}
		},
		_checkValue:function(target){
			return $.trim(target.val()) == "" || target.val() == target.attr(this.tipsNode);
		},
		isEmpty:function(target){
			return this._checkValue(target);
		},
		clear:function(){
			var _this = this;
			this.element.each(function(){
				if(_this._checkValue($(this ) ) ){
					this.value='';
				}
			});
		},
		bindEvent:function(){
			var _this = this;
			//this.element.
			
			this.element.bind("focus", function(){
				_this._hideTips($(this));
			});
			this.element.bind("blur",function(){
				_this._showTips($(this));
			});
		}
			
	});
	
	return Placeholder;
});
	
