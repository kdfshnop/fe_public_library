/*-----------------------------------------------------------------------------------------------------------
1. 插件名称：treeTable
2. 插件描述：树形表哥
3. 版本：1.0
4. 原理：
5. 使用范例：  
    
6. 未尽事宜：
7. 作者：luwei@lifang.com
-----------------------------------------------------------------------------------------------------------*/
;
(function($) {
    'use strict';

    /*-----------------------------------------------------------------------------------------------------------
    定义插件的构造方法
    @param element 选择器对象
    @param options 配置项
    @constructor
    -----------------------------------------------------------------------------------------------------------*/
    var Plugin = function(element, options) {
        //合并参数设置
        this.options = $.extend({}, Plugin.defaults, options);

        //将选择器对象赋值给插件，方便后续调用
        this.$element = $(element);

        //进行一些初始化工作
        this.init();
    };

    /*-----------------------------------------------------------------------------------------------------------
    插件名称，即调用时的名称（$.fn.pluginName）
    @type {string}
    -----------------------------------------------------------------------------------------------------------*/
    Plugin.pluginName = "tableTree";

    /*-----------------------------------------------------------------------------------------------------------
    插件缓存名称，插件通过 data 方法缓存在 dom 结构里，存储数据的名称
    @type {string}
    -----------------------------------------------------------------------------------------------------------*/
    Plugin.dataName = "table-tree";

    /*-----------------------------------------------------------------------------------------------------------
    插件版本
    @type {string}
    -----------------------------------------------------------------------------------------------------------*/
    Plugin.version = "1.0.0";

    /*-----------------------------------------------------------------------------------------------------------
    插件默认配置项
    @type {{}}
    -----------------------------------------------------------------------------------------------------------*/
    Plugin.defaults = {
        /*-----------------------------------------------------------------------------------------------------------
        显示的数据
        -----------------------------------------------------------------------------------------------------------*/
        data: null,
        /*-----------------------------------------------------------------------------------------------------------
        表头配置数据(对象数组),例如[{"name":"category_id","display_name":"类目","width":"100"},{xxxx}...]
        -----------------------------------------------------------------------------------------------------------*/
        colmodel: null,
        /*-----------------------------------------------------------------------------------------------------------
        keyFieldName
        -----------------------------------------------------------------------------------------------------------*/
        keyFieldName: '',
        /*-----------------------------------------------------------------------------------------------------------
        parentKeyFieldName
        -----------------------------------------------------------------------------------------------------------*/
        parentKeyFieldName: '',
        /*-----------------------------------------------------------------------------------------------------------
        收起标签
        -----------------------------------------------------------------------------------------------------------*/
        collapseIcon: 'glyphicon glyphicon-minus',
        /*-----------------------------------------------------------------------------------------------------------
        展开标签
        -----------------------------------------------------------------------------------------------------------*/
        expendIcon: 'glyphicon glyphicon-plus',
        /*-----------------------------------------------------------------------------------------------------------
        table class
        -----------------------------------------------------------------------------------------------------------*/
        tableClass: 'table-bordered',
        /*-----------------------------------------------------------------------------------------------------------
        默认展开
        -----------------------------------------------------------------------------------------------------------*/
        defaultexpend: null,
        /*-----------------------------------------------------------------------------------------------------------
        需要隐藏的单元格配置(对象数组)－[{"id":111,"columnName":'test'}]
        -----------------------------------------------------------------------------------------------------------*/
        hiddenCells: [],
        /*-----------------------------------------------------------------------------------------------------------
        是否添加设置排序按钮
        -----------------------------------------------------------------------------------------------------------*/
        enableSort: false,
        //上移回调
        upSortCallback: $.noop(),
        //下移回调
        downSortCallback: $.noop(),
        //置顶回调
        topSortCallback: $.noop(),
        //置底回调
        bottomSortCallback: $.noop(),
        /*-----------------------------------------------------------------------------------------------------------
        是否添加编辑删除查看按钮{add:"url",edit:"url",delete:"url",detail:"url"}
        -----------------------------------------------------------------------------------------------------------*/
        enableOperation: null,
        //新增回调
        addOpCallback: $.noop(),
        //编辑回调
        editOpCallback: $.noop(),
        //删除回调
        deleteOpCallback: $.noop(),
        //明细回调
        detailOpCallback: $.noop(),
        /*-----------------------------------------------------------------------------------------------------------
        渲染完成回调函数
        -----------------------------------------------------------------------------------------------------------*/
        callback: null,
        /*-----------------------------------------------------------------------------------------------------------
        icon图表偏移位置
        -----------------------------------------------------------------------------------------------------------*/
        iconPosition: 0,
        //配置需要搜索的列,colmodel中的名称一致,["columnA","cloumnB"]
        searchColumns: []
    };

    /*-----------------------------------------------------------------------------------------------------------
    定义私有方法
    -----------------------------------------------------------------------------------------------------------*/
    var privateMethod = {
        /*-----------------------------------------------------------------------------------------------------------
        渲染表头
        -----------------------------------------------------------------------------------------------------------*/
        renderHeader: function($element, opts) {
            var columns = opts.colmodel;
            var searchCol = opts.searchColumns;
            var tableHtml = [];
            if (!columns) return;
            if (!Array.isArray(columns) || Object.prototype.toString.call(columns) !== '[object Array]') return;
            if (!searchCol) return;
            if (!Array.isArray(searchCol) || Object.prototype.toString.call(searchCol) !== '[object Array]') return;

            //创建表格
            tableHtml.push('<table class="table table-tree ' + opts.tableClass + '">');
            tableHtml.push('<thead><tr>');
            //创建表头
            $.each(columns, function(index, el) {
                var width = el.width || '50px';
                tableHtml.push('<th name="' + el.name + '" style="width:' + width + '">' + el.display_name + '</th>');
            });
            //如果有操作列参数则插入html
            if (opts.enableOperation) {
                tableHtml.push('<th name="operation" style="100px">操作</th>');
            }
            //如果有排序列参数则插入html
            if (opts.enableSort) {
                tableHtml.push('<th name="sort" style="100px">排序</th>');
            }
            tableHtml.push('</tr>');
            //如果有需要搜索的列则插入html
            if (searchCol.length > 0) {
                var searchRow = [];
                var $search;
                searchRow.push('<tr id="searchHead">');
                //更加colmodel数量插入相应th
                for (var i = 0; i < columns.length; i++) {
                    //插入搜索框
                    if (searchCol.indexOf(columns[i].name) >= 0) {
                        searchRow.push('<th id="' + columns[i].name + '"><input type="text" class="form-control input-sm" style="max-width:150px;"></th>');
                    } else {
                        searchRow.push('<th id="' + columns[i].name + '"></th>');
                    }
                }
                if (opts.enableOperation) {
                    searchRow.push('<th></th>');
                };
                if (opts.enableSort) {
                    searchRow.push('<th></th>');
                };
                searchRow.push('</tr>');
                $search = $(searchRow.join(''));
                //添加搜索按钮
                $search.find('th:last').append('<button type="submit" id="tree-search" class="btn btn-primary btn-sm">搜索</button>');
                tableHtml.push($search[0].outerHTML);
            };
            tableHtml.push('</thead>');
            tableHtml.push('<tbody></tbody>')
            tableHtml.push('</table>');
            $element.append(tableHtml.join(''));
        },
        /*-----------------------------------------------------------------------------------------------------------
        渲染数据
        -----------------------------------------------------------------------------------------------------------*/
        renderData: function($element, opts) {
            if (!opts.data || !opts.keyFieldName || !opts.parentKeyFieldName) return;
            //数据转换
            var nestedData = this.flatToHierarchy(opts);
            if (!nestedData) return;
            var tbodyHtml = []
                //生成tr
            this.buildTr(tbodyHtml, nestedData, opts, 0);
            $.each(tbodyHtml, function(index, el) {
                $element.find('tbody').append(el);
            });
            //处理需要隐藏的单元格
            if (opts.hiddenCells.length > 0) {
                $.each(opts.hiddenCells, function(index, el) {
                    $element.find('tr[data-id="' + el.id + '"]').find('td[data-name="' + el.columnName + '"]').empty();
                });
            }
        },
        /*-----------------------------------------------------------------------------------------------------------
        数据转换
        -----------------------------------------------------------------------------------------------------------*/
        flatToHierarchy: function(opts) {
            var copyArray = opts.data.slice(0, opts.data.length);
            var sortedData = copyArray.sort(function(a, b) {
                return a[opts.parentKeyFieldName] - b[opts.parentKeyFieldName]
            });
            var minParentId = sortedData[0][opts.parentKeyFieldName];
            var nestedData = opts.data.reduce(function(obj, item) {
                var parentId = item[opts.parentKeyFieldName],
                    map = obj.map;
                map[item[opts.keyFieldName]] = item;
                if (parentId === null || parentId === minParentId) {
                    obj.res.push(item);
                } else {
                    var parentItem = map[parentId];
                    if (parentItem) {
                        if (parentItem.hasOwnProperty('children'))
                            parentItem.children.push(item);
                        else
                            parentItem.children = [item];
                    }
                }
                return obj
            }, {
                res: [],
                map: {}
            });
            return nestedData.res;
        },
        /*-----------------------------------------------------------------------------------------------------------
        创建row
        -----------------------------------------------------------------------------------------------------------*/
        buildTr: function(tbodyHtml, datas, opts, level, hidden) {
            var me = this;
            level += 1;
            $.each(datas, function(index, val) {
                var trHtml = [],
                    $tr;
                //生成tr
                trHtml.push('<tr data-id="' + val[opts.keyFieldName] + '" data-parentId="' + val[opts.parentKeyFieldName] + '" data-level="' + level + '" data-expended="false">');
                //生成td
                $.each(opts.colmodel, function(index, el) {
                    trHtml.push('<td data-name="' + el.name + '">' + val[el.name] + '</td>');
                });
                //生成操作按钮
                if (opts.enableOperation) {
                    trHtml.push('<td data-name="operation">');
                    var tdsHtml = []
                    $.each(opts.enableOperation, function(index, el) {
                        if (index === "add" && el && el.length > 0) {
                            tdsHtml.push('<a href="javascript:;" class="operation add" data-href="' + el + '">编辑</a>')
                        } else if (index === "edit" && el && el.length > 0) {
                            tdsHtml.push('<a href="javascript:;" class="operation edit" data-href="' + el + '">编辑</a>')
                        } else if (index === "delete" && el && el.length > 0) {
                            tdsHtml.push('<a href="javascript:;" class="operation delete" data-href="' + el + '">删除</a>')
                        } else if (index === "detail" && el && el.length > 0) {
                            tdsHtml.push('<a href="javascript:;" class="operation detail" data-href="' + el + '">查看</a>')
                        };
                    });
                    trHtml.push(tdsHtml.join('&nbsp;&nbsp;'))
                    trHtml.push('</td>');
                };
                //生成排序按钮
                if (opts.enableSort) {
                    trHtml.push('<td data-name="sort"><a href="javascript:;" class="sort up">上移</a>&nbsp;&nbsp;<a href="javascript:;" class="sort down">下移</a>&nbsp;&nbsp;<a href="javascript:;" class="sort top">置顶</a>&nbsp;&nbsp;<a href="javascript:;" class="sort bottom">置底</a></td>');
                };
                trHtml.push('</tr>')
                $tr = $(trHtml.join(''));

                //行隐藏
                if (hidden) {
                    $tr.css('display', 'none');
                };

                //增加展开收起按钮
                if (val.children) {
                    $tr.find('td:first').prepend('<i class="' + opts.expendIcon + '" style="top:' + opts.iconPosition + 'px"></i>');
                }
                //缩进处理
                for (var i = level - 1; i > 0; i--) {
                    $tr.find('td:first').prepend('<span class="indent"></span>');
                }
                tbodyHtml.push($tr[0]);
                if (!val.children)
                    return;
                else {
                    me.buildTr(tbodyHtml, val.children, opts, level, !val.expendRow);
                }
            });
        }
    };

    /*-----------------------------------------------------------------------------------------------------------
    定义插件的方法
    @type {{}}
    -----------------------------------------------------------------------------------------------------------*/
    Plugin.prototype = {
        //初始化插件
        init: function() {
            var classSelf = this;
            privateMethod.renderHeader(this.$element, this.options);
            privateMethod.renderData(this.$element, this.options);
            if (Array.isArray(this.options.defaultexpend) || Object.prototype.toString.call(this.options.defaultexpend) === '[object Array]') {
                $.each(this.options.defaultexpend, function(index, val) {
                    /* iterate through array or object */
                    var $expendedRow = $('tr[data-id="' + val + '"]').first();
                    if ($expendedRow.length > 0) {
                        classSelf.expendRow($expendedRow);
                    };
                });
            }
            this.bindEvent();
            if (classSelf.options.callback) classSelf.options.callback();
        },
        /*-----------------------------------------------------------------------------------------------------------
        绑定事件
        -----------------------------------------------------------------------------------------------------------*/
        bindEvent: function() {
            var $element = this.$element,
                $tbody = $element.find('table tbody'),
                $thead = $element.find('table thead'),
                options = this.options,
                classSelf = this;
            //点击第一个单元格展开或收起
            $tbody.find('tr').on('click', 'td:first', function(event) {
                event.preventDefault();
                /* Act on the event */
                var $me = $(this),
                    $currentRow = $me.parent(),
                    currentExpended = $currentRow.data('expended').toString() === "false" ? false : true;

                if (!currentExpended) {
                    classSelf.expendRow($currentRow);
                } else {
                    classSelf.collapseRow($currentRow);
                }
            });

            //点击搜索
            $thead.find('#tree-search').on('click', function(event) {
                event.preventDefault();
                /* Act on the event */
                var me = $(this);
                var obj = {};
                //去除高亮
                $tbody.find('tr').css('color', '');
                //获取搜索条件
                $.each(me.parents('tr').find('th'), function(index, val) {
                    var el = $(val);
                    var ipt = el.find('input');
                    if (ipt.length > 0 && ipt.val().length > 0) {
                        obj[el.attr('id')] = el.find('input').val() || "";
                    };
                });
                var trs = $tbody.find('tr');
                //获取满足条件的行
                var results = $.map(trs, function(item, index) {
                    var found = false;
                    $.each(obj, function(key, val) {
                        var text = $(item).find('td[data-name="' + key + '"]').text() || "";
                        //文本匹配
                        if (text.indexOf(val) >= 0) {
                            found = true;
                        } else {
                            found = false;
                            return false;
                        }
                    });
                    if (found) return item;
                });
                //高亮搜中的行并处理展开
                $.each(results, function(index, el) {
                    $(el).css('color', 'red');
                    var parentId = $(el).data('parentid');
                    var expend = function(id) {
                        var $parentTr = $tbody.find('tr[data-id="' + id + '"]');
                        var nextParentId = $parentTr.data('parentid');
                        var currentLevel = $parentTr.data('level');
                        classSelf.expendRow($parentTr);
                        if (!nextParentId) return false;
                        if (currentLevel && currentLevel !== 1) {
                            expend(nextParentId);
                        } else {
                            return false;
                        }
                    };
                    expend(parentId);
                });
            });

            //回车触发搜索
            $thead.find('#searchHead input').on('keyup', function(event) {
                event.preventDefault();
                /* Act on the event */
                if (event.which == 13) {
                    $thead.find('#tree-search').click();
                }
            });

            //排序事件
            $tbody.find('tr').on('click', '.sort', function(event) {
                event.preventDefault();
                /* Act on the event */
                var me = $(this);
                var $tr = me.parents('tr')
                var obj = {
                    id: $tr.data('id'),
                    parentId: $tr.data('parentid'),
                    level: $tr.data('level')
                };
                if (me.hasClass('up')) {
                    options.upSortCallback(obj);
                } else if (me.hasClass('down')) {
                    options.downSortCallback(obj);
                } else if (me.hasClass('top')) {
                    options.topSortCallback(obj);
                } else if (me.hasClass('bottom')) {
                    options.bottomSortCallback(obj);
                }
            });

            //操作事件
            $tbody.find('tr').on('click', '.operation', function(event) {
                event.preventDefault();
                /* Act on the event */
                var me = $(this);
                var $tr = me.parents('tr')
                var obj = {
                    id: $tr.data('id'),
                    parentId: $tr.data('parentid'),
                    level: $tr.data('level')
                };
                if (me.hasClass('add')) {
                    options.addOpCallback(obj);
                } else if (me.hasClass('edit')) {
                    options.editOpCallback(obj);
                } else if (me.hasClass('delete')) {
                    options.deleteOpCallback();
                } else if (me.hasClass('details')) {
                    options.detailsOpCallback(obj);
                }
            });
        },
        /*-----------------------------------------------------------------------------------------------------------
        展开行
        -----------------------------------------------------------------------------------------------------------*/
        expendRow: function($row) {
            var $tbody = this.$element.find('table tbody'),
                currentRowId = $row.data('id'),
                $currentTd = $row.find('td:first'),
                $childrenTrs = $tbody.find('tr[data-parentId="' + currentRowId + '"]');
            if ($childrenTrs.length <= 0) return;
            $row.data('expended', 'true');
            $currentTd.find('i').removeClass(this.options.expendIcon).addClass(this.options.collapseIcon);
            $childrenTrs.css('display', '');
        },
        /*-----------------------------------------------------------------------------------------------------------
        收起行
        -----------------------------------------------------------------------------------------------------------*/
        collapseRow: function($row) {
            var classSelf = this,
                $tbody = classSelf.$element.find('table tbody'),
                currentRowId = $row.data('id'),
                $currentTd = $row.find('td:first'),
                $childrenTrs = $tbody.find('tr[data-parentId="' + currentRowId + '"]');
            $row.data('expended', 'false')
            $currentTd.find('i').removeClass(classSelf.options.collapseIcon).addClass(classSelf.options.expendIcon);
            $childrenTrs.css('display', 'none');
            if ($childrenTrs.length > 0)
                $.each($childrenTrs, function(index, el) {
                    classSelf.collapseRow($(el));
                });
            else
                return;
        }
    };

    /*-----------------------------------------------------------------------------------------------------------
    缓存同名插件
    -----------------------------------------------------------------------------------------------------------*/
    var old = $.fn[Plugin.pluginName];

    /*-----------------------------------------------------------------------------------------------------------
    定义插件，扩展$.fn，为jQuery对象提供新的插件方法
    调用方式：$.fn.pluginName()
    @param option {string/object}
    @param args {string/object}
    -----------------------------------------------------------------------------------------------------------*/
    $.fn[Plugin.pluginName] = function(option, args) {
        return this.each(function() {
            var $this = $(this);

            var data = $this.data(Plugin.dataName);
            var options = typeof option == 'object' && option;

            //只实例化一次，后续如果再次调用了该插件时，则直接获取缓存的对象
            if (!data) {
                $this.data(Plugin.dataName, (data = new Plugin(this, options)));
            }
            //如果插件的参数是一个字符串，则直接调用插件的名称为此字符串方法
            if (typeof option == 'string') data[option](args);
            return this;
        });
    };

    $.fn[Plugin.pluginName].Constructor = Plugin;

    /*-----------------------------------------------------------------------------------------------------------
    为插件增加 noConflict 方法，在插件重名时可以释放控制权
    @returns {*}
    -----------------------------------------------------------------------------------------------------------*/
    $.fn[Plugin.pluginName].noConflict = function() {
        $.fn[Plugin.pluginName] = old;
        return this
    };
})(jQuery);
