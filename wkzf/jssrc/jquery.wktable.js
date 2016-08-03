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
	tableNavigation: {
            displayTableNavigation: true, //是否显示表格导航
            displayPagination: true, //是否显示分页信息	        
            displayPageJump: true, //是否显示页跳转
            displayPageSizeSelection: true, //是否显示页面大小选择框
            pageSizeSet: [10, 20, 50, 100, 200, 500], //页面大小结合
            paginationPageCount: 5, //分页中显示的页数
        },
    sortInfo:{
		
    },
	pageSize:10,
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
	error:function(msg){
	
	}	
}
*/

+ function($) {
    'use strict';
    var DataTable = function(element, options) {
        this.options = options;
        this.pageInfo = {
            pageIndex: 1,
            pageSize: 10,
            pageTotal: 0,
            total: 100
        };
        this.sort = "";
        this.sortType = "";
        this.init(element);
        this.renderHeader();
        this.goto(1);
    }

    //初始化table的dom结构，会先清空table的内容
    DataTable.prototype.init = function(element) {
        this.$table = $(element);
        this.$table.empty();
        this.$thead = $('<thead></thead>');
        this.$tbody = $('<tbody></tbody>');
        this.$navigation = $('<div class="table-navigation"></div>');
        this.$empty = $('<div class="data-empty">请求数据为空:)</div>').hide();
        this.$loading = $('<div class="loading"><img src="http://dev01.fe.wkzf/fe_public_library/wkzf/css/images/loading.gif" /></loading>').hide();
        this.$cover = $('<div class="cover"></div>')
        this.$table.append(this.$thead).append(this.$tbody);
        this.$table.after(this.$navigation);
        this.$table.after(this.$empty);
        this.$table.append(this.$loading).append(this.$cover);
        this.$table.addClass('wktable');
    };

    //创建获取列数据的函数
    function createValueFunction(col) {
        return function(row) {
            return row[col.field];
        };
    }

    //从options中的columns中获取表格的列头数据，之所以需要这个方法是因为插件支持两级表头合并，所有options中的columns是树形的，需要展开
    function getColumns(columns) {
        var result = [];
        columns.forEach(function(col) {
            if (col.subColumns && col.subColumns.length > 0) {
                {
                    getColumns(col.subColumns).forEach(function(c) {
                        result.push(c);
                    });
                }
            } else {
                var obj = {
                    text: col.text,
                    value: typeof(col.field) === 'function' ? col.field : createValueFunction(col),
                    field: col.field
                };

                getCustomProperties(col).forEach(function(p) {
                    obj[p] = col[p];
                });

                result.push(obj);
            }
        });

        return result;
    }

    //获得列对象的自定义属性，排除插件使用的字段
    function getCustomProperties(col) {
        return Object.getOwnPropertyNames(col).filter(function(p) {
            return p != "text" && p != "field" && p != "subColumns" && p != "value" && p != "sortable" && p!="sortField";
        });
    }

    function showEmptyMessage(){
    	this.$table.hide();
    	this.$navigation.hide();
    	this.$empty.show();
    }

    function showTable(){
    	this.$table.show();
    	this.$navigation.show();
    	this.$empty.hide();
    }

    //把列对象的自定义属性以字符串的形式返回
    function getCustomPropertiesStr(col) {
        var result = "";
        getCustomProperties(col).forEach(function(p) {
            result += " " + p + "='" + col[p] + "'";
        });
        return result;
    }

    function getSortField(col){
    	if(typeof(col.field) === 'string'){
    		return col.field;
    	}

    	if(col.sortField){
    		return col.sortField;
    	}else{
    		throw "列["+col.text+"]需要配置排序字段(sortField)";
    	}
    }
    //绘制表头
    DataTable.prototype.renderHeader = function() {
        //清空表头
        this.$thead.empty();
        //收集columns
        this.columns = getColumns(this.options.columns);

        //为列生成列头数据{level1:xxx,level2}，level1表示第一行，level2表示第二行
        var columnDatas = this.options.columns.map(function(col) {
            var level1 = "";
            var level2 = "";
            var propertiesStr = "";
            if (col.subColumns && col.subColumns.length > 0) {
                level1 = "<th colspan='" + col.subColumns.length + "'>" + col.text + "</th>";
                col.subColumns.forEach(function(subCol) {
                    if (subCol.sortable) {
                        level2 += "<th class='sort' data-field='"+getSortField(subCol)+"' " + getCustomPropertiesStr(subCol) + ">" + subCol.text + "</th>";
                    } else {
                        level2 += "<th " + getCustomPropertiesStr(subCol) + ">" + subCol.text + "</th>";
                    }
                });
            } else {
                if (col.sortable) {
                    level1 = "<th rowspan='$rows$' class='sort' data-field='"+getSortField(col)+"' " + getCustomPropertiesStr(col) + ">" + col.text + "</th>";
                } else {
                    level1 = "<th rowspan='$rows$' " + getCustomPropertiesStr(col) + ">" + col.text + "</th>";
                }
            }

            return {
                level1: level1,
                level2: level2
            };
        });

        //获得列头行数
        var row = 1;
        columnDatas.forEach(function(c) {
            if (c.level2 !== '') {
                row = 2;
            }
        });

        for (var i = 0; i < columnDatas.length; i++) {
            columnDatas[i].level1 = columnDatas[i].level1.replace('$rows$', row);
        }

        var row1 = '',
            row2 = '';
        columnDatas.forEach(function(c) {
            row1 += c.level1;
            row2 += c.level2;
        });
        row1 = "<tr>" + row1 + "</tr>";
        if (row2 !== '') {
            row2 = "<tr>" + row2 + "</tr>";
        }

        this.$thead.append(row1);

        //
        bindSortEvent.call(this);

        row2 != '' && this.$thead.append(row2);
        this.needRerenderHeader = true;
    };

    //绘制表体
    DataTable.prototype.renderBody = function(items) {
        var self = this;
        //清空表体
        this.$tbody.empty();
        var str = ""; //保存表体字符串

        items.forEach(function(item) {
            str += "<tr>";
            self.columns.forEach(function(col) {
                var properties = getCustomProperties(col); //自定义属性，直接放到dom上
                var propertiesStr = "";
                properties.forEach(function(p) {
                    propertiesStr += "  " + p + "='" + col[p] + "'";
                });
                str += "<td " + propertiesStr + " >" + col.value(item) + "</td>";
            });
            str += "</tr>";
        });

        this.$tbody.append(str);
    };

    function getLessStr() {
        return '<li><a href="#" class="less">...</a></li>';
    }

    function getMoreStr() {
        return "<li><a href='#' class='more'>...</a></li>";
    }

    function getPaginationItem(ind, active) {
        if (active) {
            return '<li><a href="#" class="page-index active">' + ind + '</a></li>';
        } else {
            return '<li><a href="#" class="page-index">' + ind + '</a></li>';
        }

    }

    function getPrevStr() {
        return '<li><a href="#" class="prev">&lt;&lt;</a></li>';
    }

    function getNextStr() {
        return '<li><a href="#" class="next">&gt;&gt;</a></li>';
    }

    function headSortClass(){
    	$('.sort',this.$thead).removeClass('sort-asc').removeClass('sort-desc');
    }

    function bindNavigationEvent() {
        var self = this;
        $('.page-index', this.$navigation).click(function(e) {
            var pi = $(this).text();
            e.preventDefault();
            if (pi == self.pageInfo.pageIndex) { //如果点击的是当前页码，不做处理
                return;
            }       
            headSortClass.call(self);     
            self.goto(pi);
        });
        $('.next', this.$navigation).click(function() {
            var pi = self.pageInfo.pageIndex;
            headSortClass.call(self);     
            self.goto(pi + 1);
        });
        $('.prev', this.$navigation).click(function() {
            var pi = self.pageInfo.pageIndex;
            self.goto(pi - 1);
        });
        $('.page-size-select', this.$navigation).change(function() {
            self.pageInfo.pageSize = $(this).val();
            headSortClass.call(self);     
            self.goto(1);
        });
        $('.go', this.$navigation).click(function() {
            //验证输入数据
            var pi = $(this).prev().val();
            headSortClass.call(self);     
            self.goto(pi);
        });
        $('.less', this.$navigation).click(function() {
        	headSortClass.call(self);     
            self.goto(self.pageInfo.pageIndex - 2);
        });
        $('.more', this.$navigation).click(function() {
        	headSortClass.call(self);     
            self.goto(self.pageInfo.pageIndex + 2);
        });
    }

    function bindSortEvent(){
    	var self = this;
    	$('.sort',this.$thead).off('click').click(function(){ 
    		var $this = $(this); 
    		var fieldName = $this.data('field');  
    		self.sort = fieldName;		
    		if($this.hasClass('sort-asc')){//当前升序，本次操作降序
    			self.sortType = "desc";
    			$('.sort',self.$thead).removeClass('sort-desc').removeClass('sort-asc');    			
    			$this.addClass('sort-desc');
    		}else{//本次操作
    			self.sortType = "asc";
    			$('.sort',self.$thead).removeClass('sort-desc').removeClass('sort-asc');    			
    			$this.addClass('sort-asc');
    		}
    		
    		self.goto(1);    		
    	});
    }

    function showLoading(){
    	//计算表格的中心位置
    	var width = this.$loading.width(), height = this.$loading.height();
    	var tableWidth = this.$table.width(), tableHeight = this.$table.height();
    	if(height>tableHeight/2){
    		return;
    	}
    	var left = (tableWidth - width) /2, top = (tableHeight -height) /2;
    	this.$loading.css({left:left,top:top}).show();    	
    	//this.$cover.css({width:tableWidth,height:tableHeight}).show();
    }

    function hideLoading(){
    	this.$loading.hide();
    	this.$cover.hide();
    }

    //绘制分页
    DataTable.prototype.renderPagination = function() {
        //不显示表格导航，直接返回
        if (!this.options.tableNavigation.displayTableNavigation) {
            return;
        }

        var self = this;

        //清空导航信息
        this.$navigation.empty();

        var $pagination = $('<div></div>');
        var $ul = $('<ul class="pagination"></ul>');
        $pagination.append($ul);
        var $pageSizeSelect = $('<select class="page-size-select form-control"></select>');
        var $pageJump = $('<div class="page-jump"></div>');
        this.$navigation.append($pagination).append($('<div class="page-size-div"></div>').append($pageSizeSelect)).append($pageJump);
        $pageSizeSelect.before("每页显示 ").after(" 条").wrap($('<div></div>'));

        //分页信息	
        if (this.options.tableNavigation.displayPagination) {
            var half = Math.floor(this.options.tableNavigation.paginationPageCount / 2.0);
            var startIndex = this.pageInfo.pageIndex - half;
            startIndex = startIndex < 1 ? 1 : startIndex;
            var endIndex = this.pageInfo.pageIndex + half;
            endIndex = endIndex > this.pageInfo.pageTotal ? this.pageInfo.pageTotal : endIndex;
            var str = '';
            var less = getLessStr(),
                more = getMoreStr();
            for (var i = startIndex; i <= endIndex; i++) {
                str += getPaginationItem(i, this.pageInfo.pageIndex == i);
            }

            if (startIndex > 2) {
                str = less + str;
            }

            if (startIndex > 1) {
                str = '<li><a href="#" class="page-index">1</a></li>' + str;
            }

            if (endIndex < this.pageInfo.pageTotal - 1) {
                str += more;
            }

            if (endIndex < this.pageInfo.pageTotal) {
                str += '<li><a href="#" class="page-index">' + this.pageInfo.pageTotal + '</a></li>';
            }

            var prev = getPrevStr(),
                next = getNextStr();

            if (this.pageInfo.pageIndex > 1) {
                str = prev + str;
            }

            if (this.pageInfo.pageIndex < this.pageInfo.pageTotal) {
                str += next;
            }

            $ul.append(str);
            $pagination.after("<div class='info'><span>" + this.pageInfo.pageIndex + "/" + this.pageInfo.pageTotal + "</span></div>");
        }
        //选择页大小下拉框
        if (this.options.tableNavigation.displayPageSizeSelection) {
            str = "";
            this.options.tableNavigation.pageSizeSet.forEach(function(ele) {
                if (ele == self.pageInfo.pageSize) {
                    str += "<option value='" + ele + "' selected>" + ele + "</option>";
                } else {
                    str += "<option value='" + ele + "'>" + ele + "</option>";
                }
            });
            $pageSizeSelect.append(str);
        }

        //页跳转
        if (this.options.tableNavigation.displayPageJump) {
            $pageJump.append('<input type="text" class="form-control" value="' + this.pageInfo.pageIndex + '" /><button class="go">Go</button>');
        }

        //绑定导航的事件
        bindNavigationEvent.call(this);
    };

    //获取数据
    DataTable.prototype.fetch = function(pageIndex) {
    	showTable.call(this);
        if (this.options.data) { //根据配置中的data来区分是远程获取数据还是使用本地数据
            this.localFetch(pageIndex);
        } else {
            this.remoteFetch(pageIndex);
        }       
    };

    //远程获取数据
    DataTable.prototype.remoteFetch = function(pageIndex) {
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
        var params = $.extend({}, this.options.params, obj);

        //发送请求
        $.ajax({
            url: this.options.url,
            data: params,
            type: this.options.method,
            dataType: "json",
            beforeSend:function(){
            	showLoading.call(self);
            },
            success: function(data) {
            	hideLoading.call(self);
                if (data && data.status == 1) {
                    data = self.options.parse && self.options.parse.call(self, data) || self.parse(data);                    
                    self.render(data);
                } else {
                    var msg = data && data.message || "查询数据失败";
                    self.options.error && self.options.error.call(self, msg);
                }
            },
            error: function() {
            	hideLoading.call(self);
                if (self.options.error) {
                    self.options.error.call(self, '网络错误，请稍后重试');
                }               
            }
        });
    };

    //本地获取数据
    DataTable.prototype.localFetch = function(pageIndex) {
        //收集分页和排序参数
        var pi = pageIndex || this.pageInfo.pageIndex + 1;
        var ps = this.pageInfo.pageSize;
        var sort = this.sort;
        var sortType = this.sortType;
        var params = this.options.params;
        var data = this.options.data.filter(function(ele) { //先过滤
            var properties = Object.getOwnPropertyNames(params);
            return properties.length === 0 || properties.filter(function(p) {
                return ele[p] == params[p];
            }).length === properties.length;
        });
        var total = data.length;
        var pageTotal = Math.ceil(this.pageInfo.total / this.pageInfo.pageSize);
        if (sort !== '') {
            data = data.sort(function(a, b) { //排序
                if (sortType === "desc") {
                    return b[sort].toString().localCompare(a[sort].toString());
                } else {
                    return a[sort].toString().localCompare(b[sort].toString());
                }
            });
        }
        data = data.filter(function(ele, ind) { //分页
            return ind >= (pi - 1) * ps && ind < pi * ps;
        });

        this.render({ pageInfo: { total: total, pageTotal: pageTotal, pageIndex: pi }, items: data });
    };

    //跳转到指定页数
    DataTable.prototype.goto = function(pageIndex) {
        this.fetch(pageIndex);
    };

    //下一页
    DataTable.prototype.next = function() {
        var pageIndex = this.pageInfo.pageIndex + 1;
        this.goto(pageIndex > this.pageInfo.pageTotal ? this.pageInfo.pageTotal : pageIndex);
    };

    //上一页
    DataTable.prototype.prev = function() {
        var pageIndex = this.pageInfo.pageIndex - 1;
        this.goto(pageIndex < 1 ? 1 : pageIndex);
    };

    //绘制整个表格
    DataTable.prototype.render = function(data) {
        //分析返回数据
        this.pageInfo.pageIndex = data.pageInfo.pageIndex || this.pageInfo.pageIndex + 1;
        this.pageInfo.pageSize = data.pageInfo.pageSize || this.pageInfo.pageSize;
        this.pageInfo.total = data.pageInfo.total;
        this.pageInfo.pageTotal = Math.ceil(this.pageInfo.total / this.pageInfo.pageSize);

        if(!(data.items&&data.items.length>0)){
        	showEmptyMessage.call(this);
        }

        this.renderBody(data.items);
        this.renderPagination();

        //绘制成功触发ready回调
        this.options.ready && this.options.ready.call(this);
    };

    //刷新当前页
    DataTable.prototype.refresh = function() {
        this.goto(this.pageInfo.pageIndex);
    };

    //转换数据
    DataTable.prototype.parse = function(data) {
        return data.data;
    };

    DataTable.DEFAULTS = {
        method: 'get', //发送请求的method
        data: null, //本地数据
        params: {}, //请求参数  
        tableNavigation: {
            displayTableNavigation: true, //是否显示表格导航
            displayPagination: true, //是否显示分页信息	        
            displayPageJump: true, //是否显示页跳转
            displayPageSizeSelection: true, //是否显示页面大小选择框
            pageSizeSet: [10, 20, 50, 100, 200, 500], //页面大小结合
            paginationPageCount: 5, //分页中显示的页数
        },
        pageSize: 10, //页大小
        pageInfoMapping: {
            pageSize: 'pageSize',
            pageIndex: 'pageIndex',
            sort: 'sort',
            sortType: 'sortType'
        } //查询参数中分页参数的映射
    };

    //设置options
    DataTable.prototype.setOptions = function(options) {
        this.options = $.extend({}, this.options, options);
        return this;
    };

    //查询
    DataTable.prototype.search = function(params) {
        this.setOptions({ params: params });
        this.goto(1);
    }

    function Plugin(option, _relatedTarget) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('wk.table');
            var options = $.extend({}, DataTable.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('wk.table', (data = new DataTable(this, options)));
            }
            if (typeof option == 'string') {
                data[option](_relatedTarget);
            }
        });
    }

    //暴露到jquery上，并提供处理冲突的方法
    var old = $.fn.wktable;
    $.fn.wktable = Plugin
    $.fn.wktable.Constructor = DataTable

    $.fn.wktable.noConflit = function() {
        $.fn.wktable = old;
        return this;
    };
}(jQuery);