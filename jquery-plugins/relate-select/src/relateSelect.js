;(function(window,$){

			/**
			 * 级联下拉采用中间件的方式上一个选项被change
			 * 则会将这次的值传递下去且执行change 回调
			 *
			 * 本插件的级联核心是两两关联，不存在越级关联。像链表关系一样，监听本
			 * 下拉的状态触发下一个级联的回调。
			 * 
			 */
			function RelateSelect ($selector,initFn){
				this.$selector = $selector;
				this._inx = 1;
				this.next = [];
				this.listenChange($selector);

				setTimeout(initFn.bind($selector));
			}

			RelateSelect.prototype = {
				/**
				 * 监听下拉变更，不过事件为后绑定，无绑定则无执行
				 * @param  {jQuery}    $selector 选择器
				 * @param  {number } index    当前索引
				 * @return {RelateSelect}     
				 */
				listenChange:function($selector,index){
					var that = this;
					index = index || 0;

					$selector.on('change',function(){
						var fn = that.next[index];
						fn && fn(this.value,this);
					});
					return this;
				},
				/**
				 * 
				 * @param {String} selector      选择器字符串
				 * @param {Function} changCallback 上一个被改变的回调方法
				 *                                不是本身被变更的回调而是上一个关联的对象
				 */
				add:function(selector,changCallback){
					changCallback = changCallback || $.noop;
					var $selector = $(selector);
					this.listenChange($selector,this._inx++);

					this.next.push(changCallback.bind($selector));
					return this;
				}
			}

			$.fn.relateSelect = function(initFn){
				//将relateSelect 保存到__relateSelect中防止重复创建
				var __relateSelect = this.data('__relateSelect');
				if(!__relateSelect){
					__relateSelect = new RelateSelect(this,initFn);
					this.data('__relateSelect',__relateSelect);
				}
				return __relateSelect;
			}
		})(this,jQuery);