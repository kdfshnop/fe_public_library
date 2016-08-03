/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. 插件名称：jquery.wktable
2. 插件描述：悟空找房异步数据表格
3. 版本：1.0
4.  对其他插件的依赖：jQuery
5. 备注：只支持最多两级head 
6. 未尽事宜：
7. 作者：唐旭阳(tangxuyang@lifang.com)
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*
opitons:{
	columns:[
		{
			text:"姓名",
			field:"name",
			sortable:true,
			subColumns:[],
			otherProperty:'',

		}
	],
	url:"",
	method:'get',
	data:[],
	params:{},//param
	displayFooter:true,
	displayPagination:true,
	displayNavigation:true,
	displayJump:true,
	displayPageSizeSelection:true,
	pageSizeSet:[20,50,100,200,500],
	paginationPageCount:5,
	pageSize:10,
	isRenderHead:false,
	pageInfoMapping:{
		pageSize:'pageSize',
		pageIndex:'pageIndex'
		sort:'sort',
		sortType:'sortType'	
	},
	parse:function(data){
	
	},
	ready:function(){
	
	},
	render:function(){
	
	},
	headerReady:function(){
	
	},
	bodyReady:function(){
	
	},
	footerReady:function(){
	
	},
	error:function(msg){
	
	},
	renderHeader:function(){
	
	},
	renderBody:function(data){
	
	},
	renderFooter:function(){
	
	}
}
*/

+function($){
	'use strict';
	var DataTable = function(element,options){
		this.options = options;
		this.pageInfo = {
			pageIndex:1,
			pageSize:10,
			pageTotal:0,
			total:100
		};
		this.sort = "";
		this.sortType = "";
		this.init(element);
		this.options.renderHeader && this.options.renderHeander.call(this) || this.renderHeader();
		this.goto(1);
	}

	DataTable.prototype.init = function(element){
		this.$table = $(element);
		this.$table.empty();		
		this.$thead = $('<thead></thead>');
		this.$tbody = $('<tbody></tbody>');
		this.$tfoot = $('<tfoot></tfoot>');
		this.$table.append(this.$thead).append(this.$tbody).append(this.$tfoot);

		this.$table.addClass('wktable');
	};

	function createValueFunction(col){
		return function(row){
			return row[col.field];
		};
	}

	function getColumns(columns){
		var result = [];
		columns.forEach(function(col){
			if(col.subColumns&&col.subColumns.length>0){
				{
					getColumns(col.subColumns).forEach(function(c){
						result.push(c);
					});
				}
			}else{
				var obj = {
					text:col.text,
					value:typeof(col.field) ==='function' ? col.field : createValueFunction(col),
					field:col.field			
				};
				
				getCustomProperties(col).forEach(function(p){
					obj[p] = col[p];
				});

				result.push(obj);
			}
		});

		return result;
	}

	function getCustomProperties(col){
		return Object.getOwnPropertyNames(col).filter(function(p){
			return p!="text" && p!="field" && p!="subColumns" && p!="value";	
		});
	}

	function getCustomPropertiesStr(col){
		var result = "";
		getCustomProperties(col).forEach(function(p){
			result += " " + p +"='"+col[p]+"'";
		});
		return result;
	}
	//
	DataTable.prototype.renderHeader = function(){
		//this.$thead
		this.$thead.empty();
		/*
			this.columns = [
				{
					text:"姓名",
					value:function(row){
						
					},
					otherProperty:''
				}
			];
		*/
		//收集columns
		this.columns = getColumns(this.options.columns);
		var columnDatas = this.options.columns.map(function(col){
			var level1 = "";
			var level2 = "";
			var propertiesStr = "";
			if(col.subColumns && col.subColumns.length > 0){
				level1 = "<th colspan='"+col.subColumns.length+"'>"+col.text+"</th>";
				col.subColumns.forEach(function(subCol){					
					level2 += "<th "+getCustomPropertiesStr(subCol)+">"+subCol.text+"</th>";
				});				
			} else{
				level1 = "<th rowspan='$rows$' "+ getCustomPropertiesStr(col) + ">" + col.text+"</th>";
			}

			return {
				level1:level1,
				level2:level2
			};
		});

		var row = 1;
		columnDatas.forEach(function(c){
			if(c.level2 !== ''){
				row = 2;
			}
		});

		for(var i = 0; i < columnDatas.length ; i++){
			columnDatas[i].level1  = columnDatas[i].level1.replace('$rows$',row);
		}
		
		var row1='',row2='';
		columnDatas.forEach(function(c){
			row1 += c.level1;
			row2 += c.level2;
		});
		row1 = "<tr>" + row1 + "</tr>";
		if(row2 !==''){
			row2 = "<tr>" + row2 + "</tr>";
		}

		this.$thead.append(row1);
		row2 !='' && this.$thead.append(row2);
		this.options.headerReady && this.options.headerReady.call(this);
	};

	//
	DataTable.prototype.renderBody = function(items){
		//this.$tbody
		var self = this;
		this.$tbody.empty();
		var str = "";

		items.forEach(function(item){
			str += "<tr>";
			self.columns.forEach(function(col){
				var properties = getCustomProperties(col);
				var propertiesStr = "";
				properties.forEach(function(p){
					propertiesStr += "  " + p + "='"+col[p]+"'";
				});
				str += "<td "+propertiesStr+" >"+col.value(item)+"</td>";
			});
			str += "</tr>";
		});

		this.$tbody.append(str);
		this.options.bodyReady && this.options.bodyReady.call(this);
	};

	//
	DataTable.prototype.renderFooter = function(){
		/*
			displayFooter:true,
			displayPagination:true,
			displayNavigation:true,
			displayJump:true,
			displayPageSizeSelection
		*/
		if(!this.options.displayFooter){
			return;
		}

		//this.$tfoot
		this.$tfoot.empty();
		var $tr = $('<tr><td colspan="'+this.columns.length+'"></td></tr>');
		this.$tfoot.append($tr);
		var $div = $('<div></div>');
		$tr.find('td').append($div);

		//pagination	
		if(this.options.displayPagination){
			var half = Math.floor(this.options.paginationPageCount/2.0);
			var startIndex = this.pageInfo.pageIndex - half;
			startIndex = startIndex < 1 ? 1 : startIndex;
			var endIndex = this.pageInfo.pageIndex + half;
			endIndex = endIndex > this.pageInfo.pageTotal ? this.pageInfo.pageTotal: endIndex;
			var str = "";
			var less = '<a href="#" class="less">...</a>',more = "<a href='#' class='more'>...</a>";
			for(var i = startIndex; i <= endIndex; i++){
				if(this.pageInfo.pageIndex == i){
					str += '<a href="#'+i+'" class="page-index active">'+i+'</a>';
				}else{
					str += '<a href="#'+i+'" class="page-index">'+i+'</a>';
				}
			}

			if(startIndex > 2){
				str = less + str;
			} 

			if(startIndex > 1){
				str = '<a href="#1" class="page-index">1</a>' + str;
			}

			if(endIndex < this.pageInfo.pageTotal -1){
				str += more;
			}

			if(endIndex < this.pageInfo.pageTotal){
				str += '<a href="#'+this.pageInfo.pageTotal+'" class="page-index">'+this.pageInfo.pageTotal+'</a>';
			}

			//$div.append(str);
		}
		//navigation
		if(this.options.displayNavigation){
			var prev = '<a href="#" class="prev">&lt;&lt;</a>',next = '<a href="#" class="next">&gt;&gt;</a>';

			if(this.pageInfo.pageIndex > 1){
				str = prev+str;				
			}

			if(this.pageInfo.pageIndex < this.pageInfo.pageTotal){				
				str += next;
			}
		}

		var self = this;
		//pageSizeSelection
		if(this.options.displayPageSizeSelection){
			str += "<select class='pageSizeSet'>";
			this.options.pageSizeSet.forEach(function(ele){
				if(ele == self.pageInfo.pageSize){
					str += "<option value='"+ele+"' selected>"+ele+"</option>";
				}else{
					str += "<option value='"+ele+"'>"+ele+"</option>";
				}
			});
			str += "</select>";
		}

		//jump
		if(this.options.displayJump){
			str += '<input type="number" min="1" max="'+this.pageInfo.pageTotal+'" value="'+this.pageInfo.pageIndex+'" /><button class="go">Go</button>';
		}
		
		$div.append(str);
		//this.$tfoot.append($div);
		//
		
		$('.page-index',$div).click(function(){			
			var pi = $(this).text();
			if(pi == self.pageInfo.pageIndex){
				return;
			}
			console.log('click on'+pi+" and pageindex is " + self.pageInfo.pageIndex);
			self.goto(pi);
		});
		$('.next',$div).click(function(){
			var pi = self.pageInfo.pageIndex;
			self.goto(pi+1);
		});
		$('.prev',$div).click(function(){
			var pi = self.pageInfo.pageIndex;
			self.goto(pi-1);
		});
		$('.pageSizeSet',$div).change(function(){
			self.pageInfo.pageSize = $(this).val();
			self.refresh();
		});
		$('.go',$div).click(function(){
			var pi = $(this).prev().val();
			self.goto(pi);
		});
		$('.less',$div).click(function(){
			self.goto(self.pageInfo.pageIndex-2);
		});
		$('.more',$div).click(function(){
			self.goto(self.pageInfo.pageIndex + 2);
		});

		this.options.footerReady && this.options.footerReady.call(this);
	};

	//获取数据
	DataTable.prototype.fetch = function(pageIndex){
		if(this.options.data){//根据配置中的data来区分是远程获取数据还是使用本地数据
			this.localFetch(pageIndex);
		}else{
			this.remoteFetch(pageIndex);
		}		
	};

	//远程获取数据
	DataTable.prototype.remoteFetch = function(pageIndex){
		var self = this;
		//收集分页和排序参数
		var pi = pageIndex || this.pageInfo.pageIndex + 1;
		var ps = this.pageInfo.pageSize;
		var obj = {};
		var pageIndexParamName = this.options.pageInfoMapping.pageIndex;
		var pageSizeParamName = this.options.pageInfoMapping.pageSize;
		var sortParamName = this.options.pageInfoMapping.sort;
		var sortTypeParamName = this.options.pageInfoMapping.sortType;
		obj[pageIndexParamName] = pi;
		obj[pageSizeParamName] = ps;
		obj[sortParamName] = this.sort;
		obj[sortTypeParamName] = this.sortType;
		var params = $.extend({},this.options.params,obj);
		
		//发送请求
		$.ajax({
			url:this.options.url,
			data:params,
			type:this.options.method,
			dataType:"json",
			success:function(data){
				if(data && data.status ==1){
					data = self.options.parse && self.options.parse.call(self,data) || self.parse(data);
					self.options.render && self.options.render.call(self,data) || self.render(data);
				}else{
					var msg = data && data.message || "查询数据失败";
					self.options.error && self.options.error.call(self,msg);
				}
			},
			error:function(){
				if(self.options.error){
					self.options.error.call(self,'网络错误，请稍后重试');
				}
			}
		});	
	};

	//本地获取数据
	DataTable.prototype.localFetch = function(pageIndex){
		//收集分页和排序参数
		var pi = pageIndex || this.pageInfo.pageIndex + 1;
		var ps = this.pageInfo.pageSize;
		var sort = this.sort;
		var sortType = this.sortType;
		var params = this.options.params;
		var data = this.options.data.filter(function(ele){//先过滤
					var properties = Object.getOwnPropertyNames(params);
					return properties.length === 0 || properties.filter(function(p){
						return ele[p] == params[p];
					}).length === properties.length;
				});
		//this.pageInfo.total = data.length;
		//this.pageInfo.pageTotal = Math.ceil(this.pageInfo.total/this.pageInfo.pageSize);
		var total = data.length;
		var pageTotal = Math.ceil(this.pageInfo.total/this.pageInfo.pageSize);
		if(sort!==''){
			data = data.sort(function(a,b){//排序
				if(sortType === "desc"){
					return b[sort].toString().localCompare(a[sort].toString());
				}else{
					return a[sort].toString().localCompare(b[sort].toString()); 
				}
			});
		}
		data = data.filter(function(ele,ind){//分页
			return ind >= (pi-1) * ps && ind < pi * ps;
		});

		this.render({pageInfo:{total:total,pageTotal:pageTotal,pageIndex:pi},items:data});
	};

	//expose
	DataTable.prototype.goto = function(pageIndex){
		this.fetch(pageIndex);
	};

	//expose
	DataTable.prototype.next = function(){
		var pageIndex = this.pageInfo.pageIndex + 1;
		this.goto(pageIndex > this.pageInfo.pageTotal ? this.pageInfo.pageTotal: pageIndex);
	};

	//expose
	DataTable.prototype.prev = function(){
		var pageIndex = this.pageInfo.pageIndex - 1;
		this.goto(pageIndex < 1 ? 1 : pageIndex);
	};

	DataTable.prototype.render = function(data){
		//分析返回数据
		this.pageInfo.pageIndex = data.pageInfo.pageIndex || this.pageInfo.pageIndex + 1;
		this.pageInfo.pageSize = data.pageInfo.pageSize || this.pageInfo.pageSize;
		this.pageInfo.total = data.pageInfo.total;
		this.pageInfo.pageTotal = Math.ceil(this.pageInfo.total / this.pageInfo.pageSize);
		
		this.isRerenderHeader && this.renderHeader.call(this);

	    this.options.renderBody && this.options.renderBody.call(this,data.items) || this.renderBody(data.items);
	    this.options.renderFooter && this.options.renderFooter.call(this) || this.renderFooter();		
	    this.options.ready && this.options.ready.call(this);
	};

	//expose
	DataTable.prototype.refresh = function(){
		this.goto(1);
	};

	//转换数据
	DataTable.prototype.parse = function(data){
		return data.data;
	};

	DataTable.DEFAULTS = {		
		method:'get',//发送请求的method
		//data:[],//本地数据
		params:{},//请求参数
		displayFooter:true,//是否显示底部信息
		displayPagination:true,//是否显示分页信息
		displayNavigation:true,//是否显示前一页/后一页
		displayJump:true,//是否显示跳转页
		displayPageSizeSelection:true,//是否显示页面大小选择框
		pageSizeSet:[10,20,50,100,200,500],//页面大小结合
		paginationPageCount:5,//分页中显示的页数
		pageSize:10,//页大小
		pageInfoMapping:{
			pageSize:'pageSize',
			pageIndex:'pageIndex',
			sort:'sort',
			sortType:'sortType'	
		}	
	};

	DataTable.prototype.setOptions = function(options){
		this.options = $.extend({},this.options,options);
		return this;
	};

	function Plugin(option,_relatedTarget){
		return this.each(function(){
			var $this = $(this);
			var data = $this.data('wk.table');
			var options = $.extend({},DataTable.DEFAULTS,$this.data(),typeof option == 'object' && option);

			if(!data){
				$this.data('wk.table',(data=new DataTable(this,options)));
			}
			if(typeof option == 'string'){
				data[option](_relatedTarget);
			}
		});
	}

	var old = $.fn.wktable;
	$.fn.wktable = Plugin
	$.fn.wktable.Constructor = DataTable

	$.fn.wktable.noConflit = function(){
		$.fn.wktable = old;
		return this;
	};
}(jQuery);