/**
  description	滑动
  @author	xiaomin@lifang.com
  @param	
  例:
  var slider = new SliderBar({
		container:$('#demo'),			//容器										(必选)
		pageNumber:$('#j-ad-num li'),	//分页元素									(可选)
		direction:'top',				//滑动方向(top|bottom|left|right|opacity)	(可选)
		interval:3000,					//滑动间隔时间								(可选)
		timer:400,						//动画滑动最大时间							(可选)
		isStart:true,					//是否实例化后自动执行滑动					(可选)
		prevButton:null,				//上翻一页									(可选)
		nextButton:null,				//下翻一页									(可选)
		pageNumberHover:'hover',		//页码hover的样式							(可选)	
		callback:function(){},			//实例化对象后执行的方法					(可选)
		beginCallback:function(){},		//动画执行前需要执行的代码					(可选)
		runCallback:function(){},		//执行中需要执行的代码						(可选)
		endCallback:function(){}		//动画执行完毕需要执行的代码				(可选)
	});
	//其他可操快捷方法
	slider.start();	//开始执行
	slider.stop();//暂停
	slider.reset();//重新从第一页开始
	slider.prev();//上一个显示区间
	slider.next();//下一个显示区间
	slider.go(0);直接跳转至
*/
define([
	'jQuery',
	'lib/ui/class'
],function($,Class){
	var Slider = Class.create({
		setOptions: function(opts){
			var options = {
				//是否实例化后开始动画isStart
				isStart:true,
				//时间间隔
				interval:4*1000,
				direction:'left',
				//动画持续时间
				timer:600,
				//容器
				container:null,
				//页码
				pageNumber:null,
				//上一页下一页的button
				prevButton:null,
				nextButton:null,
				//页码hover的样式
				pageNumberHover:'hover',
				isPlay:true,
				//
				callback:function(){},
				runCallback:function(){},
				beginCallback:function(curItem,nextItem){
					this.direction=='opacity' &&(nextItem.show() );
				},
				endCallback:function(curItem,nextItem){
					this.direction=='opacity' &&(curItem.hide() );
				}
			};
			$.extend(true, this,options,opts);
		}
	},{
		init: function(options){
			this.setOptions(options);
			//获取容器里面的元素
			if(!this.container || this.container.size()<=0){
				return false;
			}
			this.elements = this.container.children();
			this.len = this.elements.size();
			this._hover ="j-sliderbar-hover";
			if(this.len<=0) {
				return this;
			}
			this.width = this.elements.eq(0).width()+10;
			this.height = this.elements.eq(0).height()+10;
			this._curIndex = 0;
			this.intervalObj = false;
			this.elements.eq(0).css(this.direction,this.direction=='opacity'?1:0).show();
			if(!this.elements.eq(0).hasClass(this._hover) ){
				this.elements.eq(0).addClass(this._hover);
			}
			this.pageNumber && this.pageNumber.size()>0 && !this.pageNumber.eq(0).hasClass(this.pageNumberHover) &&(this.pageNumber.eq(0).addClass(this.pageNumberHover) );
			//默认开始
			if(this.isStart){
				this.start(this.direction);
			}
			this.callback.call(this);
			this.bindEvent();
		},
		top:function(){
			this.step('top');
		},
		opacity:function(){
			this.height = 1;
			this.step('opacity',function(d,param,curItem,nextItem){
				param.next[d]=1;
				param.cur[d]=0;
				return param;
			});
		},
		bottom:function(){
			this.step('top',function(d,param,curItem,nextItem){
				param.next[d]=-param.distance;
				nextItem.css(param.next);
				param.next[d]=0;
				param.cur[d]=+param.distance;
				return param;
			});
		},
		left:function(){
			this.step('left');
		},
		right:function(){
			this.step('left',function(d,param,curItem,nextItem){
				param.next[d]=-param.distance;
				nextItem.css(param.next);
				param.next[d]=0;
				param.cur[d]=+param.distance;
				return param;
			});
		},
		step:function(d,callback){
			//获取方向
			var	curIndex = this._curIndex,
			 	curItem = this.elements.filter('.'+this._hover),
			 	param = {
			 		cur:{},
			 		next:{},
			 		distance:/bottom|top|opacity/i.test(d)?this.height:this.width
			 	},
			 	nextItem = null;
			curIndex = /left|top|opacity/i.test(d)?
						(
							++curIndex>=this.len?0:curIndex
						):(
						   	/right|bottom/i.test(d)&&--curIndex<0 ?this.len-1:curIndex
						);
	
			nextItem = this.elements.eq(curIndex);
			this._curIndex = curIndex;
	
			//算出
			//移动
			if(typeof(callback)!="undefined"){
				param = callback.call(this,d,param,curItem,nextItem);
			}else{
				param.next[d]=param.distance;
				nextItem.css(param.next);
				param.next[d]=0;
				param.cur[d]=-param.distance;
			}
			this.beginCallback.call(this,curItem,nextItem,this.__drec);
			nextItem.addClass(this._hover).stop(true).animate(param.next, this.timer,'',this.endCallback.bind(this,curItem,nextItem,this.__drec) );
			curItem.removeClass(this._hover).stop(true).animate(param.cur, this.timer );
			if(this.pageNumber){
				this.pageNumber.eq(this._curIndex).addClass(this.pageNumberHover).siblings().removeClass(this.pageNumberHover);
			}
		},
		//开始
		start:function(){
            this.stop();
			this.len>1&&this.isPlay &&(this.intervalObj=setInterval(this[this.direction].bind(this,this.direction),this.interval) );
		},
		//上一页
		prev:function(){
			var index = this._curIndex-1;
			index = index <0?this.len-1:index;
            this.__drec = 'prev';
			this.go(index,'<');
		},
		//下一页
		next:function(){
			var index = this._curIndex+1;
			index = index >this.len?0:index;
            this.__drec = 'next';
			this.go(index,'>');
		},
		//重置
		reset:function(){
			this.go(0,'>');
		},
		//停止
		stop:function(){
			clearInterval(this.intervalObj);
		},
		setCurrentIndex:function(index){
			this._curIndex = index;
		},
		getCurrentIndex:function(){
			return this._curIndex;
		},
		go:function(index,t){
			var d = this.direction,
				curIndex = this._curIndex,
				direction={
					'<right':'left',
					'>right':'right',
					'<left':'right',
					'>left':'left',
					'<top':'bottom',
					'>top':'top',
					'<bottom':'top',
					'>bottom':'bottom',
					'<opacity':'opacity',
					'>opacity':'opacity'
				};
			//top bottom left right 
			this.stop();
			if(index!=curIndex){
				t = typeof(t)!='undefined'?t:(index<curIndex ?'<':'>');
				this._curIndex = index-1;
				this[direction[t+this.direction]](direction[t+this.direction]);
			}
			this.start();
	
		},
		bindEvent:function(){
			var _this = this;
			//鼠标移动至
			this.container.bind('mouseenter',function(){
				_this.prevButton &&(_this.prevButton.show());
				_this.nextButton &&(_this.nextButton.show());
				_this.stop();
			}).bind('mouseleave',function(){
				_this.prevButton &&(_this.prevButton.hide());
				_this.nextButton &&(_this.nextButton.hide());
				_this.start();
			});
	
			this.pageNumber && (
				this.pageNumber.bind('click',function(){
					_this.go($(this).index());
				})
			);
			this.prevButton &&(
				this.prevButton.on({
					mouseenter : function(){
						_this.nextButton &&(_this.nextButton.show());
						$(this).show();
					},
					mouseleave : function(){
						_this.nextButton &&(_this.nextButton.hide());
						$(this).hide();
					},
					click:function(){ 
						/*var index = _this._curIndex-1;
						index = index <0?_this.len-1:index;
						_this.go(index,'<');*/
						_this.prev();
					}
				})
			);
			this.nextButton &&(
				this.nextButton.on({
					mouseenter : function(){
						_this.prevButton &&(_this.prevButton.show());
						$(this).show();
					},
					mouseleave : function(){
						_this.prevButton &&(_this.prevButton.hide());
						$(this).hide();
					},
					click:function(){ 
						/*var index = _this._curIndex+1;
						index = index >_this.len?0:index;
						_this.go(index,'>');*/
						_this.next();
					}
				})
			);
		}
	});
    return Slider;
});