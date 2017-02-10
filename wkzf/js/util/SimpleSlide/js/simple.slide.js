/*
描述：点击缩略图预览大图
仅支持ie9以上浏览器
*/
(function($){
	$.fn.drag = function(){
		this.on('mousedown',function(e){
			e.preventDefault();
			var disX = e.clientX - $(this).position().left,
				disY = e.clientY - $(this).position().top,
				$self = $(this);
			$(document).on('mousemove',function(e){
				$self.css('left',e.clientX - disX);
				$self.css('top',e.clientY - disY);
			})
			$(document).on('mouseup',function(){
				$(document).off();
			})
		});
	}
	$.fn.simpleSlide = function (options) {
		//加载图片
		var loadingImage = 'data:image/gif;base64,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';
		var defaults = {
            "opacity": 0.6,
            "loadingImage": loadingImage,
			"src":"data-src",
			"minWidthHeight":200
        };
        var OPTIONS = $.extend(defaults, options);
		var imgList = this;
		//遮罩
		var simpleSlideMask = $('<div class="simpleSlideBox"></div>').css({'background-color':'rgba(0,0,0,'+OPTIONS.opacity+')'}).show();
		//显示的图片
		var showImg = $(document.createElement("img"));
		showImg.addClass("showImg");
		simpleSlideMask.append(showImg);
		//按钮
		//关闭
		var close = $('<div class="buttonStyle closeButton"></div>');
		simpleSlideMask.append(close);
		//旋转
		var rotate = $('<div class="buttonStyle rotate"></div>');
		simpleSlideMask.append(rotate);
		//放大
		var enlarge = $('<div class="buttonStyle enlarge"></div>');
		simpleSlideMask.append(enlarge);
		//缩小
		var narrow = $('<div class="buttonStyle narrow"></div>');
		simpleSlideMask.append(narrow);
		/*
		//上移动
		var up = $('<div class="buttonStyle up"></div>');
		simpleSlideMask.append(up);
		//下移动
		var down = $('<div class="buttonStyle down"></div>');
		simpleSlideMask.append(down);
		//左移动
		var left = $('<div class="buttonStyle left"></div>');
		simpleSlideMask.append(left);
		//右移动
		var right = $('<div class="buttonStyle right"></div>');
		simpleSlideMask.append(right);
		*/
		//点击显示
		var showImgIndex = 0;
		for(var i=0;i<imgList.length;i++){
			(function(i){
				imgList.eq(i).on("click",function(){
					showImgIndex = i;
					$(document.body).append(simpleSlideMask);
					var simpleSlideMasks = $(".simpleSlideBox");
					if(simpleSlideMasks.length>1){
						simpleSlideMasks.not( simpleSlideMasks.eq(simpleSlideMasks.length-1)).detach();
					}
					resetAll(imgList.eq(showImgIndex).attr(OPTIONS.src));
					document.documentElement.style.overflowY = 'hidden';
				});
			})(i);
		}
		
		//点击关闭
		//关闭
		close.on("click",function(){
			simpleSlideMask.detach();
			document.documentElement.style.overflowY = 'auto';
		});
		
		//封装图片加载
		function LoadImg(src,fn){
			var Img = document.createElement("img");
			Img.src = src;
			Img.onload = function(){
				fn(Img);
			}
		}
		
		//重置显示图片样式
		function resetImage(src){
			LoadImg(src,function(Img){
				var edg = 0;
				showImg.attr("style","");
				showImg.attr({
					"src":Img.src,
					"data-edg":edg
				}).css({
					"width":Img.width+"px",
					"height":Img.height+"px",
					"left":"50%",
					"top":"50%",
					"margin-left":Img.width/-2+"px",
					"margin-top":Img.height/-2+"px"
				}).drag();
			});
		}
		//接收图片路径，显示图片
		function resetAll(src){
			resetImage(OPTIONS.loadingImage);//设置成加载动画
			resetImage(src);//设置成要显示的图片
		}
		
		//设置旋转角度
		function setRotate(edg){
			showImg.attr({
				"data-edg":edg//旋转角度
			}).css({
				'transition': 'width .5s,height .5s,transform .5s',
				'-moz-transition': 'width .5s,height .5s,-moz-transform .5s',
				'-webkit-transition': 'width .5s,height .5s,-webkit-transform .5s',
				'-o-transition': 'width .5s,height .5s,-o-transform .5s',
				'-ms-transition': 'width .5s,height .5s,-ms-transform .5s',
				'transform':'rotate('+edg+'deg)',
				'-ms-transform':'rotate('+edg+'deg)',
				'-moz-transform':'rotate('+edg+'deg)',
				'-webkit-transform':'rotate('+edg+'deg)',
				'-o-transform':'rotate('+edg+'deg)'
			});
		}
		
		//鼠标滚轮滚动切换图片
		simpleSlideMask.on("mousewheel DOMMouseScroll", function (e) {
			var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
						(e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox
			if (delta > 0) {
				// 上一张
				if(showImgIndex > 0){
					--showImgIndex
					//console.log(imgList.eq(showImgIndex).attr(OPTIONS.src)+"-----"+showImgIndex);
					resetAll( imgList.eq(showImgIndex).attr(OPTIONS.src) );
				}
			} else if (delta < 0) {
				//下一张
				if(showImgIndex < imgList.length-1){
					showImgIndex++
					//console.log(imgList.eq(showImgIndex).attr(OPTIONS.src)+"-----"+showImgIndex);
					resetAll( imgList.eq(showImgIndex).attr(OPTIONS.src) );
				}
			}
		});
		
		//点击旋转
		rotate.on("click",function(){
			var edg = Number(showImg.attr("data-edg"));
			setRotate(edg+90);
		});
		//点击放大
		enlarge.on("click",function(){
			var w = showImg.width()+200;
			var h = showImg.height()+200;
			showImg.css({
				"width":w+"px",
				"height":h+"px",
				"left":"50%",
				"top":"50%",
				"margin-left":w/-2+"px",
				"margin-top":h/-2+"px"
			});
		});
		//点击缩小
		narrow.on("click",function(){
			var w = showImg.width()-200;
			var h = showImg.height()-200;
			if(w < OPTIONS.minWidthHeight || h < OPTIONS.minWidthHeight){
				return
			}
			showImg.css({
				"width":w+"px",
				"height":h+"px",
				"left":"50%",
				"top":"50%",
				"margin-left":w/-2+"px",
				"margin-top":h/-2+"px"
			});
		});
		/*
		var t;
		//上移动
		up.on("mouseover",function(){
			var top = parseFloat( showImg.css("top") );
			t = setInterval(function(){
				top = top-2;
				showImg.css("top",top)
			},1);
		});
		up.on("mouseout",function(){
			clearTimeout(t)
		});
		//下移动
		down.on("mouseover",function(){
			var top = parseFloat( showImg.css("top") );
			t = setInterval(function(){
				top = top+2;
				showImg.css("top",top)
			},1);
		});
		down.on("mouseout",function(){
			clearTimeout(t)
		});
		//左移动
		left.on("mouseover",function(){
			var left = parseFloat( showImg.css("left") );
			t = setInterval(function(){
				left = left-2;
				showImg.css("left",left)
			},1);
		});
		left.on("mouseout",function(){
			clearTimeout(t)
		});
		//右移动
		right.on("mouseover",function(){
			var left = parseFloat( showImg.css("left") );
			t = setInterval(function(){
				left = left+2;
				showImg.css("left",left)
			},1);
		});
		right.on("mouseout",function(){
			clearTimeout(t)
		});
		*/
	}
})(jQuery);