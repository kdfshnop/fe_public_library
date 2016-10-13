/**
 * @Class	Drag
 * @Package	util.drag
 * @Description	设置元素拖动
 * 				例：
 * 					require('util/drag',function(drag){
 * 						drag('可以拖动的对象',{
 * 							current:'实际拖动的对象',
 * 							upCallback:'鼠标释放后触发的回调',
 * 							downCallback:'鼠标按下后触发的回调',
 * 							moveCallback:'鼠标移动时触发的回调'
 * 						});
 * 						
 * 					}
 * @Author	xiaomin@lifang.com
 * */
define([
	'jQuery'
],function($){
	/**
	*@param obj{Object} 可以拖动的对象
	*@param fn{Function} 动作完成后的callback(可选)
	*@param current{实际改变的元素} (可选)
	*/
	var drag=function (drag,opts) {
		//鼠标按下获取到鼠标所在的x，y轴
		//鼠标移动计算xy轴
		//鼠标松开释放操作
		opts = $.extend({
			current: null,
			callback: function(){},
			upCallback: function(){},
			downCallback: function(){},
			moveCallback: function(){}
		},opts||{});
		var obj = opts.current ? opts.current : drag;
		if (obj instanceof Array && obj.length > 1) {
			return;
		}
		opts.callback.call(obj);
		drag.css('cursor', 'move');
		drag.on('mousedown', function (e) {
			if (!document.all) { e.preventDefault(); }
			var pos = obj.offset(),
				client ={
					x:e.pageX,
					y:e.pageY
				},
				flag = true;
			opts.downCallback.call(obj);
			$(document).on({
				'mouseup':function () {
					flag = false;
					$(document).off('mouseup');
					$(document).off('mousemove');
					opts.upCallback.call(obj);
				},
				'mousemove':function (e) {
					//event = window.event ? window.event : event;
					if (flag) {
						var cl = {
							x:e.pageX,
							y:e.pageY
						};
						obj.css({
							left: (cl.x - client.x + pos.left) + 'px',
							top: (cl.y - client.y + pos.top) + 'px'
						});
						opts.moveCallback.call(obj);
					}
					return false;
				}
			});
	
		});
	};
	return drag;
});