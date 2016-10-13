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
        enableMove: false,
        //上下移回调,需要返回值用于操作页面元素
        moveCallback: $.noop,
        /*-----------------------------------------------------------------------------------------------------------
        渲染完成回调函数
        -----------------------------------------------------------------------------------------------------------*/
        callback: null,
        /*-----------------------------------------------------------------------------------------------------------
        icon图表偏移位置
        -----------------------------------------------------------------------------------------------------------*/
        iconPosition: 0,
        //是否允许搜索
        enableSearch: false
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
            var tableHtml = [];
            if (!columns) return;
            if (!Array.isArray(columns) || Object.prototype.toString.call(columns) !== '[object Array]') return;

            //如果有排序列参数则插入html
            if (opts.enableMove) {
                // $element.css('position', 'relative');
                tableHtml.push('<div class="change-sort" style="position:absolute;top:50%;right:0;font-size:30px;color:#337ab7">');
                tableHtml.push('<i class="glyphicon glyphicon-arrow-up move-up sort-change" style="display:block;margin-bottom:10px;cursor:pointer"></i>');
                tableHtml.push('<i class="glyphicon glyphicon-arrow-down move-down sort-change" style="display:block;cursor:pointer"></i></div>');
            };

            //创建表格
            tableHtml.push('<table class="table table-tree ' + opts.tableClass + '">');
            tableHtml.push('<thead><tr>');
            //创建表头
            $.each(columns, function(index, el) {
                var width = el.width || '50px';
                if (typeof(el.name) === "function") {
                    tableHtml.push('<th style="width:' + width + '">' + el.display_name + '</th>');
                } else {
                    tableHtml.push('<th name="' + el.name + '" style="width:' + width + '">' + el.display_name + '</th>');
                }
            });

            tableHtml.push('</tr>');
            //如果需要搜索则插入html
            if (opts.enableSearch) {
                tableHtml.push('<tr id="searchHead">');
                //更加colmodel数量插入相应th
                for (var i = 0; i < columns.length; i++) {
                    if (i === 0) {
                        tableHtml.push('<th><div class="input-group"><input type="text" class="form-control" id="keyword" placeholder="请输入"><span class="input-group-btn"><button class="btn btn-default" id="tree-search" type="button">搜索</button></span></div></th>');
                    } else {
                        tableHtml.push('<th></th>');
                    }
                }
                tableHtml.push('</tr>');
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
                    id = item[opts.keyFieldName],
                    map = obj.map;
                map[item[opts.keyFieldName]] = item;
                if (parentId === null || parentId === minParentId) {
                    map[id].route = item[opts.keyFieldName].toString();
                    item.route = item[opts.keyFieldName].toString();
                    obj.res.push(item);
                } else {
                    var parentItem = map[parentId];
                    if (parentItem) {
                        if (parentItem.hasOwnProperty('children')) {
                            item.route = parentItem.route + item[opts.keyFieldName].toString();
                            parentItem.children.push(item);
                        } else {
                            item.route = parentItem.route + item[opts.keyFieldName].toString();
                            parentItem.children = [item];
                        }
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
                trHtml.push('<tr data-id="' + val[opts.keyFieldName] + '" data-parentid="' + val[opts.parentKeyFieldName] + '" data-level="' + level + '" data-expended="false" data-route="' + val.route + '">');
                //生成td
                $.each(opts.colmodel, function(index, el) {
                    var colVal;
                    if (typeof(el.name) === 'function') {
                        colVal = el.name(val)
                        trHtml.push('<td>' + colVal + '</td>');
                    } else {
                        trHtml.push('<td data-name="' + el.name + '" class="tree-data">' + val[el.name] + '</td>');
                    }
                });
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
        },
        //返回是否是该层级顶行或底行
        TopOrBottom: function($element, id) {
            var $tr = $element.find('tbody tr[data-id="' + id + '"]');
            var $preTr, $nextTr;
            var parentId = $tr.data('parentid');
            $preTr = $tr.prevAll('tr[data-parentid="' + parentId + '"]').first();
            $nextTr = $tr.nextAll('tr[data-parentid="' + parentId + '"]').first();
            return {
                top: $preTr.length > 0 ? false : true,
                bottom: $nextTr.length > 0 ? false : true
            };
        },
        //控制上移下移按钮显示
        ControlSortArrow: function($element, obj) {
            if (obj.top) {
                $element.find('.move-up').addClass('hidden');
            } else {
                $element.find('.move-up').removeClass('hidden');
            }
            if (obj.bottom) {
                $element.find('.move-down').addClass('hidden');
            } else {
                $element.find('.move-down').removeClass('hidden');
            }
        },
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

            //点击选中效果
            $tbody.find('tr').on('click', function(event) {
                event.preventDefault();
                /* Act on the event */
                $tbody.find('tr').removeClass('info');
                $(this).addClass('info');
                var obj = privateMethod.TopOrBottom($element, $(this).data('id'));
                privateMethod.ControlSortArrow($element, obj);
            });

            //更改顺序事件
            $element.on('click', '.sort-change', function(event) {
                event.preventDefault();
                event.stopPropagation();
                /* Act on the event */
                var me = $(this);
                if (me.hasClass('hidden')) return false;
                if (me.hasClass('disabled')) return false;
                var success = false;
                var $tr = $tbody.find('tr.info');
                var id = $tr.data('id');
                var parentId = $tr.data('parentid');
                var level = $tr.data('level');
                var route = $tr.data('route');
                var $childs = $tbody.find('tr[data-route^="' + route + '"]');
                var param = {
                    id: id,
                    parentId: parentId,
                    level: level
                };
                var $tempTrs, $preTr, $nextTr, $insertTr;
                if ($tr.length === 0) return false;
                if (me.hasClass('move-up')) {
                    //向上移动
                    me.addClass('disabled').css('color', '#999999');
                    param.move = "up";
                } else if (me.hasClass('move-down')) {
                    //向上移动
                    me.addClass('disabled').css('color', '#999999');
                    param.move = "down";
                };
                options.moveCallback(param);
            });

            //点击搜索
            $thead.on('click', '#tree-search', function(event) {
                event.preventDefault();
                /* Act on the event */
                var me = $(this);
                var keyword = $.trim($("#keyword").val()) || "";
                var resultsTr = [];
                var tds = $tbody.find('.tree-data');
                //去除高亮
                $tbody.find('tr').css('color', '');
                if (keyword === "") return false;
                //获取满足条件的行
                $.each(tds, function(index, el) {
                    /* iterate through array or object */
                    if ($(el).text().indexOf(keyword) >= 0) {
                        resultsTr.push($(el).parent());
                    }
                });
                //高亮搜中的行并处理展开
                $.each(resultsTr, function(index, el) {
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
                //定位到第一条数据
                if (resultsTr.length > 0) {
                    $("html,body").animate({
                        scrollTop: $(resultsTr[0]).offset().top
                    }, 600);
                }
            });

            //回车触发搜索
            $thead.find('#searchHead input').on('keyup', function(event) {
                event.preventDefault();
                /* Act on the event */
                if (event.which == 13) {
                    $thead.find('#tree-search').click();
                }
            });

            //监听scroll
            $(window).scroll(function(event) {
                event.preventDefault();
                /* Act on the event */
                var scrollHeight = $(document).scrollTop();
                var windowHeight = $(window).height();
                $('.change-sort').css('top', scrollHeight + windowHeight / 2);
            });
        },
        /*-----------------------------------------------------------------------------------------------------------
        展开行
        -----------------------------------------------------------------------------------------------------------*/
        expendRow: function($row) {
            var $tbody = this.$element.find('table tbody'),
                currentRowId = $row.data('id'),
                $currentTd = $row.find('td:first'),
                $childrenTrs = $tbody.find('tr[data-parentid="' + currentRowId + '"]');
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
                $childrenTrs = $tbody.find('tr[data-parentid="' + currentRowId + '"]');
            $row.data('expended', 'false')
            $currentTd.find('i').removeClass(classSelf.options.collapseIcon).addClass(classSelf.options.expendIcon);
            $childrenTrs.css('display', 'none');
            if ($childrenTrs.length > 0)
                $.each($childrenTrs, function(index, el) {
                    classSelf.collapseRow($(el));
                });
            else
                return;
        },
        //同级向上移动
        Move: function(param) {
            if (!param || !param.id || !param.move) return false;
            var $element = this.$element;
            var $tbody = $element.find('table tbody');
            var $tr = $tbody.find('tr[data-id="' + param.id + '"]');
            var id = $tr.data('id');
            var parentId = $tr.data('parentid');
            var level = $tr.data('level');
            var route = $tr.data('route');
            var $childs = $tbody.find('tr[data-route^="' + route + '"]');
            var $tempTrs, $preTr, $nextTr, $insertTr, $arrow;
            var type = param.move.toString().toLowerCase()
            if (type === "up") {
                //向上移动
                $arrow = $element.find('.move-up');
                $preTr = $tr.prevAll('tr[data-parentid="' + parentId + '"]').first();
                if ($preTr.length === 0) return false;
                $tempTrs = $childs.clone(true, true);
                $tempTrs.insertBefore($preTr);
                $childs.remove();
            } else if (type === "down") {
                //向上移动
                $arrow = $element.find('.move-down');
                $nextTr = $tr.nextAll('tr[data-parentid="' + parentId + '"]').first();
                if ($nextTr.length === 0) return false;
                //找到下一层级最后一行
                var FindLastChildRow = function($element, $tr) {
                    var id = $tr.data('id');
                    var $lastChild = $element.find('tr[data-parentid="' + id + '"]').last();
                    if ($lastChild.length > 0) {
                        FindLastChildRow($element, $lastChild);
                    } else {
                        $insertTr = $tr;
                        return false;
                    }
                };
                FindLastChildRow($element, $nextTr);
                $tempTrs = $childs.clone(true, true);
                $tempTrs.insertAfter($insertTr);
                $childs.remove();
            };
            $arrow.removeClass('disabled').css('color', '#337ab7');
            //控制按钮显示隐藏
            var obj = privateMethod.TopOrBottom($element, id);
            privateMethod.ControlSortArrow($element, obj);
        },
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
