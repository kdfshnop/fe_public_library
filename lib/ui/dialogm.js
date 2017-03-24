/**
 * @Class	Dialog
 * @Package	util.dialog
 * @Description	模拟系统自带的alert或confirm弹出框，或直接弹出已存在页面中的弹出层
 * 				例：
 * 					require('util/dialog',function(Dialog){
 * 						Dialog.confirm('我是测试例子',{
 * 							template:''						//模板配置
 * 							isMask:true,						//是否显示遮罩层
 * 							isDrag:true,						//是否可以拖动，注意的是要设置拖动需要在被拖动的对象上添加class=“ui-drag”
 * 							isClose:false,					//是否有关闭按钮
 * 							cancelCallback: function() {		//点击取消后的回调函数
								this.hide();
							},
							successCallback: function(){		//点击确认按钮后的回调函数
								this.hide();
							},
							closeCallback: function() {		//点击关闭按钮后的回调函数
								this.hide();
							}
 * 						});
 * 						Dialog.alert('我是测试例子');
 * 						Dialog.mask($('#id'));
 * 					}
 * @Author	xiaomin@lifang.com
 * @Date	2015/3/22
 * */
define([
	'jQuery',
	'lib/ui/class',
	'lib/ui/drag',
	'lib/ui/template'
], function($, Class,drag,tmpl) {
	var Dialog = Class.create({
		setOptions: function(opts) {
			var options = {
				template: '\
					<div class="ui-dialog  <%=customClassName%>">\
						<div class="title <%if(isDrag){%>ui-drag<%}%>">\
							<%if(isClose){%>\
							<a class="dialog-close" href="javascript:void(0);">×</a>\
							<%}%>\
							<h3><%=title%></h3>\
						</div>\
						<div class="wrap">\
							<div class="content">\
								<%=message%>\
							</div>\
						</div>\
						<%if(confirm || cancel){%>\
							<div class="buttons">\
								<%if(confirm){%>\
									<button class="dialog-ok"><%=confirm%></button>\
								<%}%>\
								<%if(cancel){%>\
									<button class="dialog-cancel"><%=cancel%></button>\
								<%}%>\
							</div>\
						<%}%>\
					</div>\
				',
				'element': null,
				container: null,
				name: '',
				isMask: true,
				loading: '',
				customClassName:'',
				message: '这是您新创建的窗口',
				newclass:'',
				isDrag: false,
				'isClose': true,
				'title': '温馨提示',
				'icon': 'ico_info_l',
				'confirm': '确 定',
				'cancel': '取 消',
				duration: 200,
				beforeCallback: function() {
					return this;
				},
				resizeCallback: function(){},
				cancelCallback: function() {
					this.hide();
				},
				successCallback: function(){
					this.hide();
				},
				closeCallback: function() {
					this.hide();
				}
			};

			$.extend(true, this, options, opts);
		}
	}, {
		init: function(options) {

			this.setOptions(options);
			this.element = $(this.element);
			this.template = typeof this.template === 'object' ? this.template.html():this.template;
			
			this.create();
			this.bindEvent();
		},
		createMask: function() {
			var id = 'ui-iframe-container';
			if ($('#'+id).size() <= 0) {
				var iframeContainer = document.createElement('div');
				iframeContainer.id = id;

				$(iframeContainer).css({
					opacity: 0.6,
					display: 'none',
					backgroundColor: '#000000',
					zIndex: 7000,
					position: 'absolute',
					left: 0,
					top: 0
				});
				$(document.body).append(iframeContainer);
				//this.maskAnim = this.animate.createAnimObject(iframeContainer.id);
			}
			this.iframeContainer = $('#'+id);
			this.isMask = this.iframeContainer.length > 0;
			return this.iframeContainer;
		},
		create:function(){
			var c = {};
			if(this.isMask){
				this.createMask();
			}
			if(!this.container && (!this.element || this.element.size()<=0) ){
				var div = document.createElement('div');
				div.id = 'ui-dialog-'+lifang.uid();
				div.className = this.newclass;
				$(document.body).append(div);
				this.name =div.id;
				this.container = $(div);
				this._remove = true;
				//this.container.html($.tmpl.render(this.template,this ) );
			}
			if(this.element && this.element.size() > 0 ){
				this.element.show();
				c.width = this.element.width();
				c.height = this.element.height();
				this.container = this.element;
				//this.container.append(this.element.clone(true) );
			}else{
				this.container.html(tmpl(this.template,this ) );
			}
			this.container.css($.extend({
				position:'fixed',
				visibility:'hidden',
				zIndex:'7001'
			},c) );
			if(this.isDrag){
				var uiDrag = this.container.find('.ui-drag');
				drag(uiDrag.size()<=0 ? this.container : uiDrag,{
					current:this.container,
					downCallback: function(){
						if($(this).css('position')=='fixed'){
							$(this).css({
								position:'absolute',
								top:document.documentElement.scrollTop*1+document.body.scrollTop*1+parseFloat(this.css('top'))
							});
						}
						
					}
				});
			}
			this.setCenter();
		},
		show: function(){
			this.container.css({
				visibility:'visible'
			});

			if(this.iframeContainer){
				//this.iframeContainer.fadeIn(this.duration);
				this.iframeContainer.css({
					'opacity':1,
					'display':'block'
				});
			}
			
			this.container.fadeIn(this.duration);
			this.display = 'hide';
		},
		//隐藏
		hide: function(t){
			var _this = this;
			if(this.iframeContainer){
				//this.iframeContainer.fadeOut(this.duration);
				this.iframeContainer.css({
					'opacity':0,
					'display':'none'
				});
			}
			
			this.container.fadeOut(this.duration,function(){
				_this.dispose();
			});
			this.display = 'show';
		},
		toggle:function(){
			this[this.display]();
		},
		dispose: function(){
			if(!this.element){
				this.container.remove();
			}
		},
		setCenter: function(){
			//debugger;
			var o = {
			  left:Math.max(0,(document.documentElement.clientWidth-this.container.width()*1)/2) ,
			  top: Math.max(0,(document.documentElement.clientHeight-this.container.height()*1)/2)
			},
			m = {
				width: Math.max(document.documentElement.clientWidth, document.documentElement.scrollWidth, document.body.clientWidth, document.body.scrollWidth),
				height: Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight, document.body.clientHeight, document.body.scrollHeight)
			}
			if(this.isMask){
				this.iframeContainer.css({
					width:m.width,
					height:m.height
				});
			}
			this.container.css({
				position:'fixed',
				left:o.left,
				top:o.top
			});
		},
		resizeHandler: function(){
			this.setCenter();
			this.resizeCallback();
		},
		bindEvent: function(){
			var _this = this,
				_click = this.isDrag ? 'mousedown' : 'click';
				this.container.off();
			this.container.on(_click,'.dialog-close',this.closeCallback.bind(this) );
			this.container.on(_click,'.dialog-ok',this.successCallback.bind(this) );
			this.container.on(_click,'.dialog-cancel',this.cancelCallback.bind(this) );
			$(window).on('resize scroll', this.resizeHandler.bind(this) );
		}
	});
	//静态方法
	$.extend(Dialog,{
		alert: function(msg,options){
			options = $.extend({
				title : '提示',
				cancel:'',
				type:'alert'
			}, options || {});
			options.message = msg ? msg: options.message;
			var d = new Dialog(options);
			d.show();
			return d;
		},
		confirm:function(msg,options){
			options = $.extend({
			}, options || {});
			options.message = msg ? msg: options.message;
			var d = new Dialog(options);
			d.show();
			return d;
		},
		mask: function(id,options){
			options = $.extend({
				isMask:true,
				element:id||'',
				type:'mask'
			}, options || {});
			var d = new Dialog(options);
			d.show();
			return d;
		}
	});
	
	return Dialog;
});