/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. 插件名称：treeViewSelect
2. 插件描述：树形下拉菜单选择插件
3. 版本：1.0
4. 原理：
5. 使用范例：  
    
6. 未尽事宜：
7. 作者：yuxiaochen@lifang.com
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
;
(function($, window, document, undefined) {

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    定义相关插件参数
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    var pluginName = 'treeViewSelect',
        defaults = {
            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            bootrap-treeview.js 引用路径
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            "sourceUrl": '',

            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        	请求的数据类型
        	-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            "dataType": "jsonp",

            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        	获取渲染tree数据的异步请求地址
        	-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            "apiUrl": '',

            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        	异步请求报文
        	-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            requestData: null,

            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            是否显示搜索框
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            "showSearch": true,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
             是否在节点上显示checkboxes。
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            "showCheckbox": false,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            接口请求出错时候的接口方法 
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            "onErrorInterface": null,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            当接口返回结果码不为200时候，调用的接口方法 
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            "onExceptionInterface": null,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            点击Tree Node 调用的接口方法 
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            "updateNodes": null,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
             bootstrap-treeview 参数配置
             --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            "bootstrapTreeParams": {
                /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                	设置继承树默认展开的级别,默认为2级
                	--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                "levels": 2,

                /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                	是否在节点上显示checkboxes
                	--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                showCheckbox: true,

                /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                	是否可以同时选择多个节点
                	--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                multiSelect: true,

                /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                	当选择节点时是否高亮显示
                	--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                highlightSelected: false
            }
        };

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    * ***************************************
    *
    *	构造函数与私有函数定义
    *
    *****************************************
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    定义treeNode Array containes
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    Array.prototype.containsNode = function(node) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].nodeId === node.nodeId) {
                return true;
            }
        }
        return false;
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    定义treeNode Array 排序方法
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    Array.prototype.sortNode = function() {
        var tmpNode;

        var tmpArr = this;

        for (var i = 0; i < tmpArr.length; i++) {
            for (var j = 0; j < tmpArr.length - i - 1; j++) {
                if (tmpArr[j].nodeId > tmpArr[j + 1].nodeId) {
                    tmpNode = tmpArr[j];
                    tmpArr[j] = tmpArr[j + 1];
                    tmpArr[j + 1] = tmpNode;
                }
            }
        }

        return tmpArr;
    }


    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    将flat Data format 转化为嵌套结构的数据
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    function flatToHierarchy(items) {
        //replace content name to text 
        var str = window.JSON.stringify(items);
        str = str.replace(/name/g, 'text');
        items = $.parseJSON(str);

        return items.reduce(insert, {
            res: [],
            map: {}
        }).res;

        function insert(obj, item) {
            var parent = item.pId;
            var map = obj.map;
            map[item.id] = item;

            if (item.open) {
                item.state = {
                    expanded: true
                };
            }

            if (parent === null || parent === 0) {
                obj.res.push(item);
            } else {
                var parentItem = map[parent];

                if (parentItem) {
                    if (parentItem.hasOwnProperty("nodes"))
                        parentItem.nodes.push(item);
                    else parentItem.nodes = [item];
                }
            }

            return obj;
        }
    }

    function up($tree, node, eventType) {
        var isBrothersSameState = true;

        $tree.treeview(eventType, [node.nodeId, {
            silent: true
        }]);

        //对于父节点的操作
        var parent = $tree.treeview('getParent', node);

        //get new node 
        var currentNode = $tree.treeview('getNode', node.nodeId);

        if (parent != undefined && parent.id) {
            if (parent['nodes'] != undefined) {
                var childrens = parent['nodes'];
                for (var i = 0; i < childrens.length; i++) {            
                    if (childrens[i].state.checked != currentNode.state.checked) {
                        isBrothersSameState = false;
                        break;
                    }
                }
            }
            if (isBrothersSameState) {
                if (currentNode.state.checked) {
                    up($tree, parent, 'checkNode');
                } else {
                    up($tree, parent, 'uncheckNode');
                }
            } else {
                up($tree, parent, 'uncheckNode');
            }

        } else {
            return;
        }
    }

    function down($tree, node, eventType) {
        if (node['nodes'] != undefined) {
            var children = node['nodes'];
            for (var i = 0; i < children.length; i++) {            
                $tree.treeview(eventType, [children[i].nodeId, {
                    silent: true
                }]);  

                down($tree, children[i], eventType);
            }

        } else {
            return;
        }
    }

    //获取当前节点的所有父节点
    function getParentNodes($tree, node, parentNodes) {
        var pNode = $tree.treeview('getParent', node);
        if (pNode != undefined && pNode.id) {
            parentNodes.push(pNode);

            getParentNodes($tree, pNode, parentNodes);
        } else {
            return parentNodes;
        }
    }

    function getSelectedNode($tree, nodeArr) {
        var tmpNode;
        var pNodesArr, pCheckedArr;
        var toShowNodeArr = new Array();

        //如果选中的节点包括根节点，则直接返回根节点
        if (nodeArr.length == 1 && nodeArr[0].nodeId == 0) {
            toShowNodeArr.push(nodeArr[0]);
        } else {
            for (var i = 0; i < nodeArr.length; i++) {
                tmpNode = nodeArr[i];
                pNodesArr = new Array();
                pCheckedArr = new Array();
                getParentNodes($tree, tmpNode, pNodesArr);

                //判断父节点中是否存在选中的节点
                for (var j = 0; j < pNodesArr.length; j++) {
                    if (pNodesArr[j].state.checked) {
                        pCheckedArr.push(pNodesArr[j]);
                    }
                }

                //如果存在父节点被选中
                if (pCheckedArr.length > 0) {
                    tmpNode = pCheckedArr.sortNode()[0];
                    if (!toShowNodeArr.containsNode(tmpNode)) {
                        toShowNodeArr.push(tmpNode);
                    }
                } else {
                    if (!toShowNodeArr.containsNode(tmpNode)) {
                        toShowNodeArr.push(tmpNode);
                    }
                }
            }
        }



        console.log(toShowNodeArr);
        return toShowNodeArr;
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    构造函数定义
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    function TreeViewSelect(element, options) {
        this.element = $(element);
        this.defaults = defaults;
        this.name = pluginName;

        this.init(options);

        return {
            settings: this.settings,

            init: $.proxy(this.init, this),
        };
    }


    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    入口方法
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.init = function(options) {
        if (this.settings) {
            this.settings = $.extend({}, this.settings, options);
        } else {
            this.settings = $.extend({}, this.defaults, options);
        }

        /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        reset element state
        --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        this.destroy();

        /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        初始化Handler
        --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        this.setElement();
    }


    TreeViewSelect.prototype.setElement = function() {
        var _ = this;

        //add class
        if (!_.element.hasClass('treeviewSelect-selection')) {
            _.element.addClass('treeviewSelect-selection');
        }

        _.treeContainer = $(_.template.treeContainer);
        _.tree = $(_.template.tree);
        _.searchInput = $(_.template.searchInput);

        //bind Events
        this.element.on('click', function() {
            //build tree
            if (!_.initialized) {
                _.setTree();
            } else {
                if (_.treeContainer.hasClass('hide')) {
                    _.treeContainer.removeClass('hide');
                } else {
                    _.treeContainer.addClass('hide');
                }
            }

            return false;
        });

        //outside click hide the treecontainer
        $('html').on('click', function(eventObject) {
            var $el = $(event.target);

            if (!$el.hasClass('list-group-item') && !$el.hasClass('check-icon') && !$el.hasClass('treeview-search-input') && !$el.hasClass('expand-icon') && !$el.hasClass('treeviewSelect-container')) {
                _.treeContainer.addClass('hide');
            }
        });
    }

    TreeViewSelect.prototype.addListenersToHanlder = function() {
        var _ = this;

        _.element.on('click', function() {

            var firstNodeId, $firstNode;

            //重置搜索框
            _.searchInput.val('');
            _.tree.treeview('clearSearch');


            if (!_.treeContainer.hasClass('hide')) {
                //折叠所有的节点，折叠整个树。
                _.tree.treeview('collapseAll', {
                    silent: true
                });

                //展开到第二级
                _.tree.treeview('expandAll', {
                    levels: 1,
                    silent: true
                });


                //循环遍历所有选中项，勾选对应节点，并展开
                _.element.find('.treeviewselect-selected-item').each(function(index, el) {
                    var nodeId = $(el).attr('nodeid');
                    var node = _.tree.treeview('getNode', nodeId);

                    if (node['nodes']) {
                        _.tree.treeview('expandNode', [node, {
                            levels: 1,
                            silent: true
                        }]);
                    } else {
                        var pNode = _.tree.treeview('getParent', node);
                        _.tree.treeview('expandNode', [pNode, {
                            levels: 1,
                            silent: true
                        }]);
                    }

                    if (index === 0) {
                        firstNodeId = nodeId;
                    }
                });

                //scroll to first checked node postion
                $firstNode = _.tree.find('li[data-nodeid=' + firstNodeId + ']');
                if ($firstNode.length > 0) {
                    //console.log($firstNode.position().top);
                    _.treeContainer.scrollTop($firstNode.position().top - 60);
                } else {
                    _.treeContainer.scrollTop(0);
                }
            }
        });
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    请求接口地址
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.setTree = function(data) {
        var _ = this;

        try {
            $.ajax({
                url: _.settings.apiUrl,
                type: 'GET',
                dataType: _.settings.dataType,
                data: _.settings.requestData,
                success: function(resp) {
                    if (resp && resp.status == '200') {
                        if (resp.data) {
                            require([_.settings.sourceUrl], function() {
                                _.initialized = true;

                                _.addListenersToHanlder();

                                _.renderTree(resp.data);
                                _.addListenersToTree();
                            });
                        }
                    } else {
                        if (_.settings.onExceptionInterface) {
                            _.settings.onExceptionInterface();
                        }
                    }
                },
                error: function() {
                    if (_.settings.onErrorInterface) {
                        _.settings.onErrorInterface();
                    }
                }
            })
        } catch (e) {
            logError(e);
        }
    }


    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    渲染tree View 
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.renderTree = function(data) {
        var _ = this;
        var tConfig = _.settings.bootstrapTreeParams;
        tConfig.data = flatToHierarchy(data);

        if (_.settings.showSearch) {
            _.treeContainer.append(_.searchInput);
        }

        _.tree.treeview(tConfig);
        _.treeContainer.append(_.tree);
        _.treeContainer.removeClass('hide');

        _.element.parent().append(_.treeContainer);

        _.setTreePosition();
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    给tree 绑定事件
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.addListenersToTree = function() {
        var _ = this;

        //搜索框绑定相关事件
        _.searchInput.keyup(function(event) {
            var _this = $(this);

            var sNodes = _.searchNodes($.trim(_this.val()));

            if (sNodes && sNodes.length > 0) {
                //scroll to first checked node postion
                var $firstNode = _.tree.find('li[data-nodeid=' + sNodes[0].nodeId + ']');
                if ($firstNode.length > 0) {
                    //console.log($firstNode.position().top);
                    _.treeContainer.scrollTop($firstNode.position().top - 60);
                } else {
                    _.treeContainer.scrollTop(0);
                }
            }

        });

        //tree Node
        _.tree.on('nodeSelected nodeChecked', function(event, data) {
            _.nodeChecked(data);
        });

        _.tree.on('nodeUnselected nodeUnchecked', function(event, data) {
            _.nodeunChecked(data);
        });
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    搜索节点
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.searchNodes = function(sText) {
        var options = {
            ignoreCase: true,
            exactMatch: false,
            revealResults: true
        };

        var sResults = this.tree.treeview('search', [sText, options]);

        return sResults;
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    Tree 节点点击事件
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.nodeChecked = function(node) {
        up(this.tree, node, 'checkNode');

        down(this.tree, node, 'checkNode');

        this.setTreeSelectItem();

        this.updateNodes('add', node);
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    comment
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.nodeunChecked = function(node) {
        up(this.tree, node, 'uncheckNode');

        down(this.tree, node, 'uncheckNode');

        this.setTreeSelectItem();

        this.updateNodes('remove', node);
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    根据tree选择节点，生成已选择项，并绑定相关事件
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.setTreeSelectItem = function() {
        var _ = this;

        var checkedNodes = _.tree.treeview('getChecked');
        var listNodes = getSelectedNode(_.tree, checkedNodes);
        var selectedItem;

        _.element.empty();

        if (listNodes && listNodes.length > 0) {
            for (var i = 0; i < listNodes.length; i++) {
                selectedItem = $(_.template.item);
                selectedItem.attr('nodeid', listNodes[i].nodeId);
                selectedItem.find('span').html(listNodes[i].text);

                selectedItem.find('.glyphicon-remove').on('click', function() {
                    var _this = $(this);
                    var node = _.tree.treeview('getNode', _this.parent().attr('nodeid'));

                    _.nodeunChecked(node);

                    _this.parent().remove();

                    return false;
                });

                _.element.append(selectedItem);
            }
        }

        _.setTreePosition();
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    设置treeConainer的位置
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.setTreePosition = function() {
        var _ = this;

        var sOffset = _.element.offset();
        var sPaddingTop = _.element.css('padding-top').replace('px', '');
        var sPaddingBottom = _.element.css('padding-bottom').replace('px', '');
        var sPaddingLeft = _.element.css('padding-left').replace('px', '');
        var sPaddingRight = _.element.css('padding-right').replace('px', '');

        var tHeight = 300; //treeView的高度,默认为300px
        var tWidth = _.element.width() + parseInt(sPaddingLeft) + parseInt(sPaddingRight); //treeView的宽度
        var tTop = sOffset.top + _.element.height() + parseInt(sPaddingTop) + parseInt(sPaddingBottom); + 5;
        var tLeft = sOffset.left;

        tHeight = _.treeContainer.find('li.list-group-item').length * 40 * 0.3;
        tWidth = tWidth < 300 ? 300 : tWidth;

        _.treeContainer.css({
            'top': tTop,
            'left': tLeft,
            'height': tHeight,
            'width': tWidth,
        });
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    更新选中项触发的callback
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.updateNodes = function(eventType, node) {
        var _ = this;

        if (_.settings.updateNodes) {
            _.settings.updateNodes(eventType, node);
        }
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    comment
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.destroy = function() {
        if (!this.initialized) return;

        this.element.empty();
        this.treeContainer.empty();

        // Switch off events
        this.element.off('click');
        $('html').off('click');
        this.treeContainer = null;
        this.tree = null;
        this.searchInput = null;

        // Reset this.initialized flag
        this.initialized = false;
    }

    TreeViewSelect.prototype.template = {
        inlineInput: '<li><input type="text" class="treeviewSelect-inline-input"></li>',
        item: '<li class="treeviewselect-selected-item"><i class="glyphicon glyphicon-remove"></i><span></span></li>',
        treeContainer: '<ul class="treeviewSelect-container"></ul>',
        searchInput: '<input class="treeview-search-input" placeholder="请搜索..."></input>',
        tree: '<div class="treeviewSelect-tree"></div>'
    }

    var logError = function(message) {
        if (window.console) {
            window.console.error(message);
        }
    };

    $.fn[pluginName] = function(options, args) {
        var result;

        this.each(function() {
            var _this = $.data(this, pluginName);

            if (typeof options === 'string') {
                if (!_this) {
                    logError('Not initialized, can not call method : ' + options);

                } else if (!$.isFunction(_this[options]) || options.charAt(0) === '_') {
                    logError('No such method : ' + options);
                } else {
                    result = _this[options].apply(_this, args);
                }
            } else if (typeof(options) === 'object') {
                if (!_this) {
                    $.data(this, pluginName, new TreeViewSelect(this, $.extend(true, {}, options)));
                } else {
                    _this['init'].call(_this, options);
                }
            }
        });

        return result || this;
    };

})(jQuery, window, document);
