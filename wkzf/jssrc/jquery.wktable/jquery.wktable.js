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
    sortClasses:{
        sortAscClass:"",
        sortDescClass:"",
        sortClass:""
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
    ready:function(data){
    
    },  
    error:function(msg){
    
    }   
}
*/

+ function($) {
    'use strict';
    //构造函数
    var DataTable = function(element, options) {
            this.options = options;
            this.isReady = false;
            this.pageInfo = {
                pageIndex: this.options.pageIndex,
                pageSize: this.options.pageSize,
                pageTotal: 0,
                total: 100,
                size: 0
            };
            this.sort = this.options.sort;
            this.sortType = this.options.sortType;
            init.call(this, element);
            renderHeader.call(this);
            this.options.autoRequestAtTheFirstTime && this.goto(1);
        }
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        私有方法
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        //初始化table的dom结构，会先清空table的内容
    function init(element) {
        this.$table = $(element);
        this.$table.empty();
        this.$thead = $('<thead></thead>');
        this.$tbody = $('<tbody></tbody>');
        this.$navigation = $('<div class="table-navigation"></div>');
        this.$empty = $('<div class="no-data text-danger"><i class="iconfont icon-chucuo"></i><span>抱歉，找不到您想要的数据！</span></div>').hide();
        this.$loading = $('<div class="loading"></loading>').hide();
        this.$table.append(this.$thead).append(this.$tbody);
        this.$table.after(this.$navigation);
        this.$table.after(this.$empty);
        this.$table.append(this.$loading);
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
            return p != "text" && p != "field" && p != "subColumns" && p != "value" && p != "sortable" && p != "sortField" && p!= "ascSort" && p!="descSort";
        });
    }

    function showEmptyMessage() {
        //this.$table.hide();
        this.$navigation.hide();
        this.$empty.show();
        this.$tbody.hide();
    }

    function showTable() {
        this.$table.show();
        this.$navigation.show();
        this.$empty.hide();
        this.$tbody.show();
    }

    //把列对象的自定义属性以字符串的形式返回
    function getCustomPropertiesStr(col) {
        var result = "";
        getCustomProperties(col).forEach(function(p) {
            result += " " + p + "='" + col[p] + "'";
        });
        return result;
    }

    function getSortField(col) {
        if (typeof(col.field) === 'string') {
            return col.field;
        }

        if (col.sortField) {
            return col.sortField;
        } else {
            throw "列[" + col.text + "]需要配置排序字段(sortField)";
        }
    }
    //绘制表头
    function renderHeader() {
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
                        level2 += "<th class='sort' data-field='" + getSortField(subCol) + "' " + getCustomPropertiesStr(subCol) + ">" + subCol.text + "</th>";
                    } else {
                        level2 += "<th " + getCustomPropertiesStr(subCol) + ">" + subCol.text + "</th>";
                    }
                });
            } else {
                if (col.sortable) {
                    level1 = "<th rowspan='$rows$' class='sort' data-field='" + getSortField(col) + "' " + getCustomPropertiesStr(col) + ">" + col.text + "</th>";
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

        row2 != '' && this.$thead.append(row2);
        bindSortEvent.call(this);
    };

    //绘制表体
    function renderBody(items) {
        var self = this;
        //清空表体
        this.$tbody.empty();
        var str = ""; //保存表体字符串
        items = items || [];
        items.forEach(function(item, index) {
            if (item[self.options.uniqueId] != undefined) {
                str += "<tr data-id='" + item[self.options.uniqueId] + "'>"
            } else {
                str += "<tr>";
            }
            self.columns.forEach(function(col) {
                var properties = getCustomProperties(col); //自定义属性，直接放到dom上
                var propertiesStr = "";
                properties.forEach(function(p) {
                    propertiesStr += "  " + p + "='" + col[p] + "'";
                });
                str += "<td " + propertiesStr + " >" + col.value(item, index) + "</td>";
            });
            str += "</tr>";
        });

        this.$tbody.append(str);
    };

    function getLessStr() {
        return '<a href="#" class="less">...</a>';
    }

    function getMoreStr() {
        return "<a href='#' class='more'>...</a>";
    }

    function getPaginationItem(ind, active) {
        if (active) {
            return '<a href="#" class="page-index active">' + ind + '</a>';
        } else {
            return '<a href="#" class="page-index">' + ind + '</a>';
        }

    }

    function getPrevStr() {
        return '<a href="#" class="prev">&lt;&lt;</a>';
    }

    function getNextStr() {
        return '<a href="#" class="next">&gt;&gt;</a>';
    }

    function clearHeadSortClass() {
        $('.' + this.options.sortClasses.sortClass, this.$thead).removeClass(this.options.sortClasses.sortAscClass).removeClass(this.options.sortClasses.sortDescClass);
    }

    //给表格底部的导航绑定事件
    function bindNavigationEvent() {
        var self = this;
        $('.page-index', this.$navigation).click(function(e) {
            var pi = $(this).text();
            e.preventDefault();
            if (pi == self.pageInfo.pageIndex) { //如果点击的是当前页码，不做处理
                return;
            }
            //clearHeadSortClass.call(self);
            self.goto(pi);
        });
        $('.next', this.$navigation).click(function(e) {
            var pi = self.pageInfo.pageIndex;
            //clearHeadSortClass.call(self);
            self.goto(pi + 1);
            e.preventDefault();
        });
        $('.prev', this.$navigation).click(function(e) {
            var pi = self.pageInfo.pageIndex;
            self.goto(pi - 1);
            e.preventDefault();
        });
        $('.page-size-select', this.$navigation).change(function() {
            self.pageInfo.pageSize = $(this).val();
            //clearHeadSortClass.call(self);
            self.goto(1);
        });
        $('.go', this.$navigation).click(function() {
            var pi = $(this).prev().val();
            //clearHeadSortClass.call(self);
            self.goto(pi);
        });
        $('.refresh', this.$navigation).click(function() {
            //var pi = $(this).prev().val();
            //clearHeadSortClass.call(self);
            self.refresh();
        });
        $('.less', this.$navigation).click(function(e) {
            //clearHeadSortClass.call(self);
            var half = Math.floor(self.options.tableNavigation.paginationPageCount / 2.0);
            self.goto(self.pageInfo.pageIndex - half);
            e.preventDefault();
        });
        $('.more', this.$navigation).click(function(e) {
            //clearHeadSortClass.call(self);
            var half = Math.floor(self.options.tableNavigation.paginationPageCount / 2.0);
            self.goto(self.pageInfo.pageIndex + half);
            e.preventDefault();
        });
        $('.page-jump input', this.$navigation).on('keypress', function(e) {
            if (e.keyCode == '13') {
                self.goto($(this).val());
            }
        }).on('keyup', function() {
            var val = this.value.replace(/\D/gi, "");
            if (val) {
                if (val < 1) {
                    val = 1;
                }
                if (val > self.pageInfo.pageTotal) {
                    val = self.pageInfo.pageTotal;
                }
            }

            this.value = val;
        });
    }

    //给列头绑定排序事件
    function bindSortEvent() {
        var self = this;
        $('.' + self.options.sortClasses.sortClass, this.$thead).off('click').click(function() {
            var $this = $(this);
            var fieldName = $this.data('field');
            self.sort = fieldName;
            if ($this.hasClass(self.options.sortClasses.sortAscClass)) { //当前升序，本次操作降序
                self.sortType = "desc";
                $('.' + self.options.sortClasses.sortClass, self.$thead).removeClass(self.options.sortClasses.sortDescClass).removeClass(self.options.sortClasses.sortAscClass);
                $this.addClass(self.options.sortClasses.sortDescClass);
            } else { //本次操作升序
                self.sortType = "asc";
                $('.' + self.options.sortClasses.sortClass, self.$thead).removeClass(self.options.sortClasses.sortDescClass).removeClass(self.options.sortClasses.sortAscClass);
                $this.addClass(self.options.sortClasses.sortAscClass);
            }

            //self.goto(1);
            self.refresh();
        });
    }

    //显示loading效果
    function showLoading() {
        //计算表格的中心位置
        var width = this.$loading.width(),
            height = this.$loading.height();
        var tableWidth = this.$table.width(),
            tableHeight = this.$table.height();
        /*if (height > tableHeight / 2) {
            return;
        }*/
        var left = (tableWidth - width) / 2,
            top = (tableHeight - height) / 2;
        this.$loading.css({ left: left, top: top }).show();
    }

    //隐藏loading效果
    function hideLoading() {
        this.$loading.hide();
    }

    //绘制分页
    function renderPagination() {
        //清空导航信息
        this.$navigation.empty();

        //不显示表格导航，直接返回
        if (!this.options.tableNavigation.displayTableNavigation) {
            return;
        }

        var self = this;
        var $pagination = $('<div class="pagination"></div>');
        var $pageSizeSelect = $('<select class="page-size-select"></select>');
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
                str = '<a href="#" class="page-index">1</a>' + str;
            }

            if (endIndex < this.pageInfo.pageTotal - 1) {
                str += more;
            }

            if (endIndex < this.pageInfo.pageTotal) {
                str += '<a href="#" class="page-index">' + this.pageInfo.pageTotal + '</a>';
            }

            var prev = getPrevStr(),
                next = getNextStr();

            if (this.pageInfo.pageIndex > 1) {
                str = prev + str;
            }

            if (this.pageInfo.pageIndex < this.pageInfo.pageTotal) {
                str += next;
            }

            $pagination.append(str);
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
        }else{
            this.$navigation.find('.page-size-div').hide();
        }

        //页跳转
        if (this.options.tableNavigation.displayPageJump) {
            $pageJump.append('<input type="text" value="' + this.pageInfo.pageIndex + '" /><button type="button" class="go">跳转</button>');
        }

        //刷新
        if (this.options.tableNavigation.displayPageJump) {
            $pageJump.append('<button type="button" class="refresh">刷新</button>');
        }

        this.$navigation.append("<div class='info'><span class=''>" + ((this.pageInfo.pageIndex - 1) * this.pageInfo.pageSize + 1) + "-" + ((this.pageInfo.pageIndex - 1) * this.pageInfo.pageSize + this.pageInfo.size) + "</span>/共<span>" + this.pageInfo.total + "</span>条</div>");
        //绑定导航的事件
        bindNavigationEvent.call(this);
    };

    //获取数据
    function fetch(pageIndex) {
        showTable.call(this);
        if (this.options.data) { //根据配置中的data来区分是远程获取数据还是使用本地数据
            localFetch.call(this, pageIndex);
        } else {
            remoteFetch.call(this, pageIndex);
        }
    };

    //远程获取数据
    function remoteFetch(pageIndex) {
        var self = this;
        //收集分页和排序参数
        var pi = pageIndex || this.pageInfo.pageIndex + 1;
        var ps = this.pageInfo.pageSize;
        var obj = {};
        var pageIndexParamName = this.options.pageInfoMapping.pageIndex;
        var pageSizeParamName = this.options.pageInfoMapping.pageSize;
        var sortParamName = this.options.pageInfoMapping.sort;
        var sortTypeParamName = this.options.pageInfoMapping.sortType;        
        if(self.options.tableNavigation.displayTableNavigation){
            obj[pageIndexParamName] = pi;
            obj[pageSizeParamName] = ps;
        }
        obj[sortParamName] = this.sort;
            obj[sortTypeParamName] = this.sortType;
        var params = $.extend({}, this.options.params, obj);

        //删除空字符串属性
        for(var v in params){
            if(params[v] == null || params[v]==""){
                delete params[v];
            }
        }

        //发送请求
        $.ajax({
            url: this.options.url,
            //坑爹后台，post非得要转成字符串
            data: (this.options.method.toLowerCase() == "post" && this.options.dataStringify) ? JSON.stringify(params) : params,
            type: this.options.method,
            dataType: "json",
            contentType: this.options.contentType,
            beforeSend: function() {
                showLoading.call(self);
            },
            success: function(data) {
                hideLoading.call(self);
                if(data && data.status == 1502){//for node项目
                    parent.window.location.reload();
                }
                if (data && data.status == 1) {
                    if(Object.prototype.toString.call(data.data) === "[object String]"){
                        if(data.data){
                            var resultData = JSON.parse(data.data);
                            if(resultData.messageNo == "1502"){
                                parent.window.location.reload();
                            }
                        }
                    }
                    data = self.options.parse && self.options.parse.call(self, data) || self.parse(data);
                    render.call(self, data);
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
    function localFetch(pageIndex) {
        var self = this;
        //收集分页和排序参数
        var pi = pageIndex || this.pageInfo.pageIndex + 1;
        var ps = this.pageInfo.pageSize;
        var sort = this.sort;
        var sortType = this.sortType;
        var params = this.options.params;
        var data = this.options.data.filter(function(ele) { //先过滤
            var properties = Object.getOwnPropertyNames(params);
            return properties.length === 0 || properties.filter(function(p) {
                return params[p] == null || params[p] == '' || ele[p] == params[p] || (ele[p] && (ele[p].toString()).indexOf((params[p]||"").toString())>-1);
            }).length === properties.length;
        });
        var total = data.length;
        var pageTotal = Math.ceil(this.pageInfo.total / this.pageInfo.pageSize);        

        var defaultAscSort = function(a, b) { //排序
            return a[sort].toString().localeCompare(b[sort].toString());            
        };
        var defaultDescSort = function(a, b) { //排序
            return b[sort].toString().localeCompare(a[sort].toString());            
        };
        if (sort !== '' && sort != undefined) {
            var column = this.options.columns.filter(function(col){
                return col.sortField == sort || col.field == sort;
            })[0];
            var ascSort = column.ascSort || defaultAscSort;
            var descSort = column.descSort || defaultDescSort;
            if(sortType ==="desc"){
                data = data.sort(descSort);
            }else{
                data = data.sort(ascSort);
            }
        }
        data = data.filter(function(ele, ind) { //分页
            return ind >= (pi - 1) * ps && ind < pi * ps;
        });

        render.call(this, { pageInfo: { total: total, pageTotal: pageTotal, pageIndex: pi }, items: data });
    };

    //绘制整个表格
    function render(data) {
        //分析返回数据
        this.pageInfo.pageIndex = data.pageInfo && data.pageInfo.pageIndex || this.pageInfo.pageIndex + 1;
        this.pageInfo.pageSize = data.pageInfo && data.pageInfo.pageSize || this.pageInfo.pageSize;
        this.pageInfo.total = data.pageInfo && data.pageInfo.total || 1;
        this.pageInfo.pageTotal = Math.ceil(this.pageInfo.total / this.pageInfo.pageSize);
        this.pageInfo.size = data.items && data.items.length || 0;

        if (!(data.items && data.items.length > 0)) {
            showEmptyMessage.call(this);
        }

        renderBody.call(this, data.items);
        renderPagination.call(this);

        //绘制成功触发ready回调
        this.options.ready && this.options.ready.call(this, data.items);
        this.isReady = true;
    };
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    公有方法
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    //跳转到指定页数
    DataTable.prototype.goto = function(pageIndex) {
        /*if(pageIndex == this.pageInfo.pageIndex){
            return;
        }*/
        if (pageIndex > this.pageInfo.pageTotal) {
            pageIndex = this.pageInfo.pageTotal;
        }
        if (pageIndex < 1) {
            pageIndex = 1;
        }

        this.pageInfo.pageIndex = pageIndex - 1;
        fetch.call(this, pageIndex);
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

    //刷新当前页
    DataTable.prototype.refresh = function() {
        this.goto(this.pageInfo.pageIndex);
    };

    //转换数据
    DataTable.prototype.parse = function(data) {
        //return data.data;
        return {
            pageInfo: {
                pageIndex: data.data.pageIndex,
                pageSize: data.data.pageSize,
                total: data.data.total
            },
            items: data.data.contents
        };
    };

    //设置options
    DataTable.prototype.setOptions = function(options) {
        this.options = extend(true, {}, this.options, options);
        return this;
    };

    //查询
    DataTable.prototype.search = function(params) {
        this.setOptions({ params: params });        
        this.goto(1);
    }

    /*
        helper方法extend
        之所以不用jQuery.extend是因为，jQuery.extend对于数组产生的结果不是我们想要的，比如有对象{arr:[1,2,3,6]},如果调用jQuery.extend(true,{},{arr:[1,2,3,6]},{arr:[3]})返回的结果是{arr:[3,2,3,6]}，它把两个对象的数组属性综合一下返回了，而我们想要的是用后一个的数组对象覆盖前一个的数组兑现跟，即返回{arr:[3]}。这里说明一下，这个extend是从jQuery中提取的，做了稍微的修改
    */
    function extend() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;

            // Skip the boolean and the target
            target = arguments[i] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {};
        }

        // Extend jQuery itself if only one argument is passed
        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {

            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {

                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (jQuery.isPlainObject(copy) ||
                            (copyIsArray = jQuery.isArray(copy)))) {

                        if (copyIsArray) {
                            copyIsArray = false;
                            //clone = src && jQuery.isArray(src) ? src : [];
                            clone = [];

                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

    //默认配置
    DataTable.DEFAULTS = {
        method: 'get', //发送请求的method
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: null, //本地数据
        params: {}, //请求参数  
        tableNavigation: {
            displayTableNavigation: true, //是否显示表格导航
            displayPagination: true, //是否显示分页信息         
            displayPageJump: true, //是否显示页跳转
            displayPageSizeSelection: true, //是否显示页面大小选择框
            displayRefresh: true, //显示刷新按钮
            pageSizeSet: [10, 20, 50, 100, 200, 500], //页面大小结合
            paginationPageCount: 5, //分页中显示的页数
        },
        sortClasses: {
            sortClass: 'sort',
            sortAscClass: 'sort-asc',
            sortDescClass: 'sort-desc'
        },
        pageSize: 10, //页大小
        pageIndex: 0,
        pageInfoMapping: {
            pageSize: 'pageSize',
            pageIndex: 'pageIndex',
            sort: 'sort',
            sortType: 'sortType'
        }, //查询参数中分页参数的映射
        uniqueId: "id",
        autoRequestAtTheFirstTime: true,
        dataStringify: true //
    };

    function Plugin(option, _relatedTarget) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('wk.table');
            var options = extend(true, {}, DataTable.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('wk.table', (data = new DataTable(this, options)));
            }
            if (typeof option == 'string') {
                data[option](_relatedTarget);
            }
        });
    }

    //暴露到jquery上
    var old = $.fn.wktable;
    $.fn.wktable = Plugin
    $.fn.wktable.Constructor = DataTable

    //解决冲突
    $.fn.wktable.noConflit = function() {
        $.fn.wktable = old;
        return this;
    };
}(jQuery);
