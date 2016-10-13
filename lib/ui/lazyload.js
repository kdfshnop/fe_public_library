/**
 * @Class	Lazyload
 * @Package	util.lazyload
 * @Description	图片延迟加载
 * 				例：
 * 					require('util/lazyload',function(Lazyload){
 * 						new Lazyload({
 * 							lazy:$('img'),		//延迟加载对象集合
 * 							direction:'vertical', //方向（垂直vertical和水平horizontal）
 * 							placeholder:'图片未加载前的占位图',
 * 							original:'替代src的节点属性'
 * 						});
 * 					}
 * @Author	xiaomin@lifang.com
 * @Date	2015/3/16
 * */
define([
	'jQuery',
	'lib/ui/class'
], function($,Class) {

	var Lazyload = Class.create({
		//初始化参数
		setOptions:function(opts){
			var options = {
				container: window,
				//lazyload元素集合
				lazy: $('img'),
				//方向（垂直vertical和水平horizontal）
				direction: 'vertical',
				//延时时间
				delay: 100,
				//超出预期top值的元素依旧加载
				expect: 0,
				//加载图片前的占位图
				placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC',
				//效果 fadeIn/show/slideDown
				effect: 'fadeIn',
				effectTime: 400,
				//获取图片路径的节点
				original: 'data-original',
				//实例化完成后调用
				callback: function() {}
			};
			
			$.extend(this,options, opts);
		},
		/**构造器
		 * */
		init: function(options) {
			//默认参数重置
			this.setOptions(options);
			if ((!this.lazy || this.lazy.size() <= 0)) {
				return;
			}
			var _this = this;

			this.$container = (this.container === undefined ||
				this.container === window) ? $(window) : $(this.container);

			this.lazy.each(function() {
				var item = this,
					$item = $(this);
				if ($item.attr('src') === undefined || $item.attr('src') === false || $item.attr('src') == '') {
					if ($item.is('img')) {
						$item.attr('src', _this.placeholder).addClass('ui-lazyload');
					}
				}
				$item.one('appear', function() {
					//回调
					if (!this.loaded) {
						$("<img />").bind('load', function() {
							var original = $item.attr(_this.original);
							if (original) {
								$item.hide();
								if ($item.is("img")) {
									$item.attr("src", original);
								} else {
									$item.css("background-image", "url('" + original + "')");
								}
								$item[_this.effect](_this.effectTime);
								item.loaded = true;
								var temp = $.grep(_this.lazy, function(element) {
									return !element.loaded;
								});
								_this.lazy = $(temp);
							}
							//回调
						}).bind('error',function(){
							console.log('懒加载失败')
							$item.attr('src',_this.placeholder).addClass('ui-lazyerror');
						}).attr("src", $item.attr(_this.original));
					}
				});
			});

			//this._lazyScope  = $(document).scrollTop() + $(window).height()+this.expect;
			this.callback.call(this);
			this.bindEvent();
		},
		//运行延迟加载
		run: function() {
			var _this = this;
			_this.lazy.each(function() {
				_this[_this.direction](this) && $(this).trigger('appear');
			});
		},
		vertical: function(elem) {
			var doc = document.documentElement,
				dob = document.body,
				scrollTop = doc.scrollTop || dob.scrollTop;
			return $(elem).offset().top < scrollTop + this.$container.height() + this.expect;
		},/*
		horizontal: function() {

		},*/
		bindEvent: function() {
			var _this = this;
			$(document).ready(function() {
				_this.run();
			});
			$(window).on("resize", function() {
				_this.run();
			});
			this.$container.on('scroll', function() {
				return _this.run();
			});
		}
	});
	return Lazyload;
});