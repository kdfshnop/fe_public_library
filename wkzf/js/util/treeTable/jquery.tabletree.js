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
        hiddenCells: []
    };

    /*-----------------------------------------------------------------------------------------------------------
    定义私有方法
    -----------------------------------------------------------------------------------------------------------*/
    var privateMethod = {
        /*-----------------------------------------------------------------------------------------------------------
        渲染表头
        -----------------------------------------------------------------------------------------------------------*/
        renderHeader: function($element, opts) {
            var columns = opts.colmodel,
                tableHtml = [];
            if (!columns) return;
            tableHtml.push('<table class="table table-tree ' + opts.tableClass + '">');
            tableHtml.push('<thead><tr>');
            $.each(columns, function(index, el) {
                var width = el.width || 50;
                tableHtml.push('<th name="' + el.name + '" style="width:' + width + 'px">' + el.display_name + '</th>');
            });
            tableHtml.push('</tr></thead>');
            tableHtml.push('<tbody></tbody>')
            tableHtml.push('</table>');
            $element.append(tableHtml.join(''));
        },
        /*-----------------------------------------------------------------------------------------------------------
        渲染数据
        -----------------------------------------------------------------------------------------------------------*/
        renderData: function($element, opts) {
            if (!opts.data || !opts.keyFieldName || !opts.parentKeyFieldName) return;
            var nestedData = this.flatToHierarchy(opts);
            if (!nestedData) return;
            var tbodyHtml = []
            this.buildTr(tbodyHtml, nestedData, opts, 0);
            $.each(tbodyHtml, function(index, el) {
                $element.find('tbody').append(el);
            });
            if (opts.hiddenCells.length > 0) {
                $.each(opts.hiddenCells, function(index, el) {
                    $element.find('tr[data-id="' + el.id + '"]').find('td[data-name="' + el.columnName + '"]').css('display', 'none');;
                });
            }
        },
        /*-----------------------------------------------------------------------------------------------------------
        数据转换
        -----------------------------------------------------------------------------------------------------------*/
        flatToHierarchy: function(opts) {
            var minParentId = opts.data.sort(function(a, b) {
                return a[opts.parentKeyFieldName] - b[opts.parentKeyFieldName]
            })[0][opts.parentKeyFieldName];
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
                trHtml.push('<tr data-id="' + val[opts.keyFieldName] + '" data-parentId="' + val[opts.parentKeyFieldName] + '" data-level="' + level + '" data-expended="false">');
                $.each(opts.colmodel, function(index, el) {
                    trHtml.push('<td data-name="' + el.name + '">' + val[el.name] + '</td>');
                });
                trHtml.push('</tr>')
                $tr = $(trHtml.join(''));

                if (hidden) {
                    $tr.css('display', 'none');
                }
                if (val.children) {
                    $tr.find('td:first').prepend('<i class="' + opts.expendIcon + '"></i>');
                }
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
        },
        /*-----------------------------------------------------------------------------------------------------------
        绑定事件
        -----------------------------------------------------------------------------------------------------------*/
        bindEvent: function() {
            var $element = this.$element,
                $tbody = $element.find('table tbody'),
                options = this.options,
                classSelf = this;
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
