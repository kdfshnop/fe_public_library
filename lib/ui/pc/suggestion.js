/**
 *@description 搜索联想、建议 
 * 		new Suggestion($('#search'),{
			url:'/pc/lifang/page/test/suggestion.php'
		});
		其他参数参照defaultoptions注释
 **/
define([
	'jQuery',
	'lib/ui/class',
	'lib/ui/template'
], function($, Class, tmpl) {
	var Suggestion = Class.create({
		setOptions: function(opts) {
			var options = {
				url: '',
				houseType:"",
				cityId:"",
				//列表模板
				template: '\
					<%for(var i=0,len=list.length;i<len;i++){%>\
						<a href="javascript:void(0);" class="item <%=itemClass%>" data-index=<%=i%>><%=list[i].text%></a>\
					<%}%>\
				',
				//外层模板
				wrapHtml: '<div class="ui-suggestion"></div>',
				//是否分页（暂时未实现此功能）
				isPage: false,
				//定位偏移量
				offset: {
					x: 0,
					y: 0,
					width: 0,
					height: 0
				},
				//无值情况下默认显示的列表
				defaultItems:null,
				//列表被选中的样式
				activeItemClass: 'hover',
				itemClass:'j-suggestion-item',
				filter:'j-suggestion-input',
				zIndex: 200,
				//触发搜索的时间
				delay: 200,
				//高亮选中某项做的处理
				onActiveItemCallback: function() {},
				//用户按回车却没有选择sug项
				onEnterCallback: function() {},
				//用户按下回车并选择了sug项
				onConfirmCallback: function() {},
				onHideCallback: function() {
					return true;
				},
				onShowCallback: function() {
					return true;
				},
				getDataCallback: function(val, callback) {
					//ajax获取数据
					var _this=this;
					this.xhr && this.xhr.abort();
					/*this.xhr = $.get(this.url, {
						key: val,
						t: +(new Date())
					}, function(data) {
						callback(data);
					}, 'json');*/
					this.xhr = $.ajax({
						data:{
							key: val,
							t: +(new Date()),
							houseType:$(_this.houseType).val(),
							cityId:$(_this.cityId).val()
						},
						url:this.url,
						dataType:'json',
						success:function(data){
							if(data.status){
								callback(data.data);
							}
							
						}
					});
				}
			};
			$.extend(true, this, options, opts);
		}
	}, {
		init: function(element, opts) {
			this.element = $(element);
			if (this.element.size() <= 0) {
				return;
			}
			this.setOptions(opts);

			//保存用户输入的信息
			this.tmp = 'default';
			this._tmplList = {};
			this.isShow = false;

			//this.container = null;

			this.cityIdVal=$(this.cityId).val();

			this.element.attr('autocomplete', 'off').addClass(this.filter);

			this.container = null;
			this.activeIndex = -1;
			this.timeOutId = null;
			this.items = [];
			//this.container = $(this.wrapHtml);
			if(this.defaultItems){
				this._tmplList[this.tmp] = tmpl(this.template, {list:this.defaultItems,itemClass:this.itemClass});
			}

			this.bindEvent();
		},
		setOffset: function() {
            if(!this.container || this.container.size()<=0 ){
                return this;
            }
			//显示的位置是在上面还是在下面，判断边缘高度是否够
			//获取element的offsetTop和自身的高度
			//计算container的高度是否大于上面的高度或者下面的高度(窗口)
			var element = this.element,
				elmWidth = parseInt(element.get(0).offsetWidth, 10),
				elmHeight = parseInt(element.get(0).offsetHeight, 10),
				elmOffset = element.offset(),
				wrapTop = elmHeight + elmOffset.top * 1 + this.offset.y,
				wrapLeft = elmOffset.left * 1 + this.offset.x;

			this.container.css({
				position: 'absolute',
				left: wrapLeft,
				top: wrapTop,
				zIndex: this.zIndex,
				width: elmWidth + this.offset.width-(parseInt(this.container.css('borderRightWidth'),10 )+parseInt(this.container.css('borderLeftWidth'),10 ) )
			});
			var windowHeight = Math.max(
					document.documentElement.clientHeight,
					document.body.clientHeight
				),
				wh = this.container.height() * 1,
				wrapOffsetTop = wrapTop + wh,
				o = windowHeight - wrapOffsetTop;

			//判断下面的高度是否可以显示完container
			if (o < wh && wrapOffsetTop > wh) {
				this.container.css('top', (wrapTop - wh));
			}
		},
		moveActive: function(type) {
			var activeIndex,
				items = this.items,
				len = items.length,
				activeIndex = type === 'up' ? this.activeIndex - 1 : this.activeIndex + 1;
			//处理边界情况
			if (activeIndex < 0) {
				activeIndex = len - 1;
			} else if (activeIndex === len) {
				activeIndex = 0;
			}
			this.element.val($.trim($(this.items[activeIndex]).html() ) );
			this.changeActive(activeIndex);
		},
		changeActive: function(activeIndex) {
			var items = this.items,
				activeItem = null;

			this.container.find('.'+this.activeItemClass).removeClass(this.activeItemClass);
			(activeItem = $(items[activeIndex])).addClass(this.activeItemClass);

			//储存高亮索引
			this.activeIndex = activeIndex;

			this.onActiveItemCallback(activeItem[0]);
		},
		handler: function(event) {
			if (event.type != 'keydown') {
				var val = $.trim(this.element.val());
				if (val === '') {
					this.hide();
					return;
				}
				
				switch (event.keyCode) {
					case 27:
						this.hide();
						return;
					case 38: //up键
						this.show();
						this.moveActive('up');
						return;
					case 40: //down键
						this.show();
						this.moveActive('down');
						return;
					case 13: //回车
						event.preventDefault();
						event.stopPropagation();
						if (this.activeIndex === -1) {
							//当用户没有选择任何sug项而直接按回车时
							this.onEnterCallback(val);
						} else {
							//当用户通过上下键选择了某一项sug项后按回车时
							//this.element.val($(this.items[this.activeIndex]).html() );
							//this.onConfirmCallback(this.items[this.activeIndex], this.activeIndex);
							this.selectSug($(this.items[this.activeIndex]).html(),this.activeIndex );
						}
						this.hide();
						return;
					default:
						this.valChange(val);
				}
			}
		},
		selectSug: function(val,index){
			this.element.val($.trim(val) );
			this.onConfirmCallback(val,this.items[index], index);
			this.element.get(0).blur();
		},
		hide: function() {
			if (this.isShow && this.onHideCallback() !== false) {
				this.container.hide();
				this.activeIndex = -1;
				this.isShow = false;
			}
		},
		show: function() {
			if (!this.isShow && this.onShowCallback() !== false) {
				this.container.show();
				//this.setPosition();
				this.isShow = true;
			}
		},
		mousedownItem: function(){
			var _this = this;
			$(this.container).on('mousedown','.'+this.itemClass,function(){
	        		var index = $(this).attr('data-index')*1;
	
	            _this.changeActive(index);
	            _this.selectSug(this.innerHTML,index);
	            _this.hide();
	            return false;
	        }).on('mouseenter','.'+this.itemClass,function(){
	        		//记录下hover的坐标
	        		//_this.activeIndex = $(this).attr('data-index')*1;
	        		_this.changeActive($(this).attr('data-index')*1);
	        });
		},
		addList: function(html,val){
			var wrap = this.container;
			if(typeof(val) === 'string' && val!==''){
				this._tmplList[val] = html;
			}
			
			wrap.html(html);
			this.items = wrap.children();
			this.setOffset();
			this.show();
		},
		valChange: function(val) {
			var html = this._tmplList[val],
				wrap = this.container;
				
			if(typeof(val)!== 'string' || val===''){
				if(this.defaultItems){
					html = this._tmplList[this.tmp];
				}else{
					return ;
				}
				
			}

			//换了城市就清空
			if(this.cityIdVal!=$(this.cityId).val()){
				this._tmplList={};
				this.cityIdVal=$(this.cityId).val();
			}

			if (!this.container) {
				wrap = $(this.wrapHtml);
				$(document.body).append(wrap);
				this.container = wrap;
				this.hide();
				this.mousedownItem();
			}

			if (typeof(html) === 'string') {
				this.addList(html);
			} else {
				clearTimeout(this.timeOutId);
				this.timeOutId = setTimeout(function() {
					this.getDataCallback(val, function(data) {
						html = tmpl(this.template, {list:data,itemClass:this.itemClass});
						this.addList(html,val);
						
					}.bind(this));
				}.bind(this), this.delay);
			}
			//this.activeIndex = -1;
		},
		bindEvent: function() {
			var _this = this;
			this.element.on('keyup change keydown', this.handler.bind(this) ).on('focus',function(){
				_this.valChange($.trim(this.value) );
				return false;
			});
			//点击页面其他地方时隐藏suggestion
	        $(document).on('click', function(e){
	        		var target = e.target,
	        			nodeName = target.nodeName.toLowerCase();
	        		if((nodeName === 'input' && !$(target).hasClass(_this.filter) ) || nodeName !== 'input' ){
	        			_this.hide();
	        		}
	        		//this.hide.bind(this);
	        } );
	        $(window).on('resize',this.setOffset.bind(this) );
		}
	});
	
	return Suggestion;
});