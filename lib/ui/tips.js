define([
	'jQuery',
	'lib/ui/class',
	'lib/ui/template',
	'lib/ui/json'
],function($,Class,tmpl,json){
	
	var Tips = Class.create({
		setOptions: function(opts){
			var options = {
				template:'<div class="ui-tips">\
					<s class="icon-wrap"><i class="icon"></i></s>\
					<div class="content"><%=content%></div>\
				</div>',
				//四个方向的箭头对应四个不同的class
				iconClass:{
					'top':'icon-bottom',
					'left':'icon-right',
					'right':'icon-left',
					'bottom':'icon-top'
				},
				direction:'bottom',
				delay: 200,
				data:{},
				//是否需要显示箭头
				isArrow:!0,
				url:'',
                isHover:!0,
                zIndex:1000
			};
			
			$.extend( options, opts);
			return options;
		}
	},{
		init : function(element,options){
			this.element = $(element);
			//this.setOptions(options);
			this.params =this.setOptions( this.element.attr('data-tips-params')? json.parse(this.element.attr('data-tips-params') ) : options || {} );
			
			this.__isShow = !0;
			
			this.tipsId = 'data-tips-id';
			this.container = null;
			this.tipsList = {};
			this.setTpl();
			this.bindEvent();
		},
        setTpl: function(){
            this.tpl = this.params.template.indexOf('#')>=0?$(this.params.template).html():this.params.template;
        },
		setPos: function(){
			//四个方向的判断
			var element = this.element,
                $container = this.container,
                container = $container[0],
                ico = $container.find('.icon-wrap'),
				params = this.params,
				ch = container.offsetHeight,
				cw = container.offsetWidth,
				eh = element.get(0).offsetHeight,
				d = params.direction,
				left = 0,
				top = 0,
				offset =  element.offset(),
				oELeft =offset.left,
				oETop = offset.top,
				de = {},
				defaultDirection = null,
				ew = element.get(0).offsetWidth,
				wh = Math.max(
					document.documentElement.clientHeight,
					document.body.clientHeight
				),
				ww = Math.max(
					document.documentElement.clientWidth,
					document.body.clientWidth
				);

			de = {
				'top':{
					left : oELeft + (ew/2)-(cw/2),
					top : oETop - ch,
                    d : 'paddingBottom'
				},
				'bottom':{
					left : oELeft + (ew/2)-(cw/2),
					top : oETop + eh,
                    d : 'paddingTop'
				},
				'left':{
					left : oELeft - cw,
					top : oETop + (eh/2)-(ch/2),
                    d : 'paddingRight'
				},
				'right':{
					left : oELeft + ew,
					top : oETop + (eh/2)-(ch/2),
                    d : 'paddingLeft'
				}
			};
			//计算下面剧中显示

			//设置最终位置
			//方向箭头样式
			if(params.isArrow){
                var iconC = params.iconClass && params.iconClass[d ] ? params.iconClass[d ] :'',
                    iw = ico.get(0).offsetWidth,
                    ih = ico.get(0).offsetHeight;
				$.extend(true, de,{
					'top':{
						c:(cw/2)+(iw/2),
                        top:de.top.top-ih
					},
					'bottom':{
						c:(cw/2)+(iw/2),
                        top:de.bottom.top+ih
					},
					'left':{
						c:(ch/2)-(ih/2),
                        left:de.left.left-iw
					},
					'right':{
						c:(ch/2)-(ih/2),
                        left:de.right.left+iw
					}
				});

			}else if(ico.size() > 0){
				ico.hide();
			}
			//验证边缘
			defaultDirection = de[d=this.validateEdge(d,de,wh,ww ) ];

			//再次修正
			if(defaultDirection.left < 0 ){
				defaultDirection.c+=defaultDirection.left;
				defaultDirection.left = oELeft;

			}else if(defaultDirection.left+cw > ww){
				defaultDirection.c-=(defaultDirection.left-oELeft);
				defaultDirection.left = oELeft+ew-cw;
			}
			
			if(iconC && ico.size() > 0){
				
				if(ico[0]._oldClass){
					ico.removeClass(ico[0]._oldClass);
				}

				ico.addClass(iconC );
				
				ico[0]._oldClass = iconC;
				
				//算箭头的位置
				ico.css(/^(?:bottom|top)$/g.test(d) ?'left' :'top' ,defaultDirection.c-(params.offset||0) );
                //$container.css(defaultDirection.d, iw );
			}

			$container.css({
				top:defaultDirection.top,
                zIndex:this.params.zIndex,
				left:defaultDirection.left/*,
				'visibility':'visible',
				'display':'none'*/
			});
		},
		validateEdge: function(d,de,wh,ww){
			
			//判断
			switch (d){
				case 'top':
					if(de['top'].top < 0 && de['bottom'].top < wh ){
						d = 'bottom';
					}
					break;
				case 'bottom':
					if(de['bottom'].top > wh && de['top'].top > 0 ){
						d = 'top';
					}
					break;
				case 'left':
					if(de['left'].left < 0 && de['right'].left < ww ){
						d = 'right';
					}
					break;
				case 'right':
					if(de['right'].left > ww && de['left'].left > 0){
						d = 'left';
					}
					break;
			}
			
			return d;
		},
		getAsynData : function(url,callback){
			var _this = this;
			if(!this.isRender){
				$.ajax({
					url:this.url,
					dataType:'json',
					success:function(data){
						if(callback){
							callback.call(this,data);
						}else{
							if(data.status){
								_this.container.html(tmpl(_this.tpl,data.data) );
								_this.show();
							}
						}
					}
				});
			}else{
				_this.show();
			}
		},
		createWrap: function(status){
			if(!this.container){
				var id = 'j-tips-'+lifang.uid(),
                    container=null;
				container = document.createElement('div');
				container.className = 'ui-tips-container';
				container.id = id;
				container = $(container);
				container.css({
					'position':'absolute',
					'top':-9999,
					'left':-9999,
					'display': 'block',
					'visibility':'hidden'
				});
				$(document.body).append(container);
				//this.tipsList[id] = container;
				this.container = container;
				this.element.attr(this.tipsId,id);
				this.containerHandler();
			}
			this.removeAddClass(status);
		},
		removeAddClass:function(status){
			if(status==4){
				$(this.container).addClass("map-tip-container");
			}else{
				$(this.container).removeClass("map-tip-container");
				$(this.container).removeClass("map-loading");
			}

		},
		render: function(element,status){
            this.element = $(element);
            element = this.element;
			
			var params = this.params;
			this.createWrap(status);
			if(params.url && params.url!=''){
				this.getAsynData(params.url,params.ajaxCallback );
			}else{
				//渲染模板，
				!this.isRender && (
					this.container.html(tmpl(this.tpl,params.data) ),
					this.isRender = !0 
				);
				//显示出来
				this.show();
			}
			
		},
		show: function(){
            if(this.__isShow){
                this.setPos();
                this.container.css({
                    'visibility':'visible',
                    'display':'none'
                });
                this.container['fadeIn'](this.params.delay);
                this.__isShow = !1;
            }else{
                this.setPos();
            }
            this._type = 'show';
		},
		hide: function(){
            if(this.container && this.container.size()>0 ){
                this.container.fadeOut(this.params.delay,function(){
                    this.container.css({
                        'visibility':'hidden',
                        'display':'',
                        'top':-9999,
                        'left':-9999
                    });
                    this.__isShow = !0;
                }.bind(this) );
                this._type = 'hide';
            }
		},
		_move: function(e){
			var target = e.target;
			
			clearTimeout(this.leaveTimeObj);
			
			this.leaveTimeObj = setTimeout(function(){
				if(target!=this.container.get(0) && target!= this.element.get(0)){
					this.hide();
				}
			}.bind(this),200);
			
		},
		_leave: function(e){
			var target = e.target;
			clearTimeout(this.container[0]._timeout);
			
			this.container[0]._timeout = setTimeout(function(){
				this.hide();
			}.bind(this),200);
		},
		containerHandler: function(){
			var _this = this;
            if(this.params.isHover){
                this.container.on({
                    'mouseenter': function(){
                        clearTimeout(this._timeout);
                    },
                    'mouseleave': function(){
                        //_this.hide();
                        _this.__isShow = !!0;
                        _this.element[0]._timeout=setTimeout(function(){
                            _this.hide();
                        },200);
                    }
                });
            }
		},
		bindEvent: function(){
			//this.element.on();
			var _this = this;
            if(this.params.isHover){
                this.element.on({
                    'mouseenter': function(){
                        clearTimeout(this._timeout);
                        if(_this.__isShow){
                            _this.render($(this) );
                        }
                    },
                    'mouseleave': function(e){
                        _this._leave(e);
                    }
                });
            }
			$(window).on('resize scroll',function(){
				//_this.element[0].isRender= !1;
				//_this.__isShow = !0;
                if(_this._type && _this._type ==='show'){
                    _this.show();
                }
			});
		}
	});

    var tip = null;
	
	return {
		jmp: function(elements){
			elements.each(function(){
				new Tips($(this) );
			});
		},
		tip : function(d,template,zIndex){
			if(!tip){
                tip = new Tips()  ;
            }
            $.extend(true,tip.params,{
                template:template ? template: tip.params.template,
                direction : d ? d: tip.params.direction,
                isHover:false,
                zIndex:zIndex|| tip.params.zIndex
            });

            return {
                show:function(element,text,time,a){
                    /*data:{
                        content:message||''
                    },*/
					if(a!=4){
						tip.params.delay=0;
					}
					if(a){tip.params.zIndex=a;}
                    tip.params.data.content = text || '';
                    tip.element = $(element);
                    tip.setTpl();
                    tip.isRender = false;
                    tip.render(element,a);
                    clearTimeout(tip.__showtimeObj);
					if(tip._type=="show"){
						$(tip.container).css("display","block");
					}
                    if(time){
                        tip.__showtimeObj = setTimeout(function(){
                            tip.hide();
                        },time);
                    }

                },
                hide: function(){
                    tip.hide();
                },
                getContainer: function(){
                    return tip.container;
                }
            };
		}
	};
});
