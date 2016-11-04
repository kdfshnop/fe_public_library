/* =========================================================
 * bootstrap-treeview.js v1.2.0
 * =========================================================
 * Copyright 2013 Jonathan Miles
 * Project URL : http://www.jondmiles.com/bootstrap-treeview
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

;
(function($, window, document, undefined) {

    /*global jQuery, console*/

    'use strict';

    var pluginName = 'treeview';

    var _default = {};

    _default.settings = {

        injectStyle: true,

        levels: 2,

        expandIcon: 'glyphicon glyphicon-plus',
        collapseIcon: 'glyphicon glyphicon-minus',
        emptyIcon: 'glyphicon',
        nodeIcon: '',
        selectedIcon: '',
        checkedIcon: 'glyphicon glyphicon-check',
        uncheckedIcon: 'glyphicon glyphicon-unchecked',

        color: undefined, // '#000000',
        backColor: undefined, // '#FFFFFF',
        borderColor: undefined, // '#dddddd',
        onhoverColor: '#F5F5F5',
        selectedColor: '#FFFFFF',
        selectedBackColor: '#428bca',
        searchResultColor: '#D9534F',
        searchResultBackColor: undefined, //'#FFFFFF',

        enableUpCascade: true,
        enableDownCascade: true,
        enableLinks: false,
        highlightSelected: true,
        highlightSearchResults: true,
        showBorder: true,
        showIcon: true,
        showSearch: false,
        showCheckbox: false,
        showTags: false,
        multiSelect: false,

        // Event handlers
        onNodeChecked: undefined,
        onNodeCollapsed: undefined,
        onNodeDisabled: undefined,
        onNodeEnabled: undefined,
        onNodeExpanded: undefined,
        onNodeSelected: undefined,
        onNodeUnchecked: undefined,
        onNodeUnselected: undefined,
        onSearchComplete: undefined,
        onSearchCleared: undefined
    };

    _default.options = {
        silent: false,
        ignoreChildren: false
    };

    _default.searchOptions = {
        ignoreCase: true,
        exactMatch: false,
        revealResults: true
    };

    var Tree = function(element, options) {

        this.$element = $(element);
        this.elementId = element.id;
        this.styleId = this.elementId + '-style';

        this.init(options);

        return {

            // Options (public access)
            options: this.options,

            // Initialize / destroy methods
            init: $.proxy(this.init, this),
            remove: $.proxy(this.remove, this),

            // Get methods
            getNode: $.proxy(this.getNode, this),
            getAllNodes: $.proxy(this.getAllNodes, this),
            getParent: $.proxy(this.getParent, this),
            getParents: $.proxy(this.getParents, this),
            getSiblings: $.proxy(this.getSiblings, this),
            getSelected: $.proxy(this.getSelected, this),
            getUnselected: $.proxy(this.getUnselected, this),
            getExpanded: $.proxy(this.getExpanded, this),
            getCollapsed: $.proxy(this.getCollapsed, this),
            getChecked: $.proxy(this.getChecked, this),
            getUnchecked: $.proxy(this.getUnchecked, this),
            getDisabled: $.proxy(this.getDisabled, this),
            getEnabled: $.proxy(this.getEnabled, this),

            // Select methods
            selectNode: $.proxy(this.selectNode, this),
            unselectNode: $.proxy(this.unselectNode, this),
            toggleNodeSelected: $.proxy(this.toggleNodeSelected, this),

            // Expand / collapse methods
            collapseAll: $.proxy(this.collapseAll, this),
            collapseNode: $.proxy(this.collapseNode, this),
            expandAll: $.proxy(this.expandAll, this),
            expandNode: $.proxy(this.expandNode, this),
            toggleNodeExpanded: $.proxy(this.toggleNodeExpanded, this),
            revealNode: $.proxy(this.revealNode, this),

            // Expand / collapse methods
            checkAll: $.proxy(this.checkAll, this),
            checkNode: $.proxy(this.checkNode, this),
            uncheckAll: $.proxy(this.uncheckAll, this),
            uncheckRealAll: $.proxy(this.uncheckRealAll, this),
            uncheckNode: $.proxy(this.uncheckNode, this),
            toggleNodeChecked: $.proxy(this.toggleNodeChecked, this),

            // Disable / enable methods
            disableAll: $.proxy(this.disableAll, this),
            disableNode: $.proxy(this.disableNode, this),
            enableAll: $.proxy(this.enableAll, this),
            enableNode: $.proxy(this.enableNode, this),
            toggleNodeDisabled: $.proxy(this.toggleNodeDisabled, this),

            // Search methods
            search: $.proxy(this.search, this),
            clearSearch: $.proxy(this.clearSearch, this)
        };
    };

    Tree.prototype.init = function(options) {

        this.tree = [];
        this.nodes = [];
        this.childsNodes = []; // nodes array from getting recursion childs  
        this.parentNodes = []; //// nodes array from getting recursion parents 

        if (options.data) {
            if (typeof options.data === 'string') {
                options.data = $.parseJSON(options.data);
            }
            this.tree = $.extend(true, [], options.data);
            delete options.data;
        }
        this.options = $.extend({}, _default.settings, options);

        this.destroy();
        this.subscribeEvents();
        this.setInitialStates({
            nodes: this.tree
        }, 0);
        this.render();
    };

    Tree.prototype.remove = function() {
        this.destroy();
        $.removeData(this, pluginName);
        $('#' + this.styleId).remove();
    };

    Tree.prototype.destroy = function() {

        if (!this.initialized) return;

        this.$wrapper.remove();
        this.$wrapper = null;

        // Switch off events
        this.unsubscribeEvents();

        // Reset this.initialized flag
        this.initialized = false;
    };

    Tree.prototype.unsubscribeEvents = function() {

        this.$element.off('click');
        this.$element.off('nodeChecked');
        this.$element.off('nodeCollapsed');
        this.$element.off('nodeDisabled');
        this.$element.off('nodeEnabled');
        this.$element.off('nodeExpanded');
        this.$element.off('nodeSelected');
        this.$element.off('nodeUnchecked');
        this.$element.off('nodeUnselected');
        this.$element.off('searchComplete');
        this.$element.off('searchCleared');
    };

    Tree.prototype.subscribeEvents = function() {

        this.unsubscribeEvents();

        this.$element.on('click', $.proxy(this.clickHandler, this));

        if (typeof(this.options.onNodeChecked) === 'function') {
            this.$element.on('nodeChecked', this.options.onNodeChecked);
        }

        if (typeof(this.options.onNodeCollapsed) === 'function') {
            this.$element.on('nodeCollapsed', this.options.onNodeCollapsed);
        }

        if (typeof(this.options.onNodeDisabled) === 'function') {
            this.$element.on('nodeDisabled', this.options.onNodeDisabled);
        }

        if (typeof(this.options.onNodeEnabled) === 'function') {
            this.$element.on('nodeEnabled', this.options.onNodeEnabled);
        }

        if (typeof(this.options.onNodeExpanded) === 'function') {
            this.$element.on('nodeExpanded', this.options.onNodeExpanded);
        }

        if (typeof(this.options.onNodeSelected) === 'function') {
            this.$element.on('nodeSelected', this.options.onNodeSelected);
        }

        if (typeof(this.options.onNodeUnchecked) === 'function') {
            this.$element.on('nodeUnchecked', this.options.onNodeUnchecked);
        }

        if (typeof(this.options.onNodeUnselected) === 'function') {
            this.$element.on('nodeUnselected', this.options.onNodeUnselected);
        }

        if (typeof(this.options.onSearchComplete) === 'function') {
            this.$element.on('searchComplete', this.options.onSearchComplete);
        }

        if (typeof(this.options.onSearchCleared) === 'function') {
            this.$element.on('searchCleared', this.options.onSearchCleared);
        }
    };

    /*
        Recurse the tree structure and ensure all nodes have
        valid initial states.  User defined states will be preserved.
        For performance we also take this opportunity to
        index nodes in a flattened structure
    */
    Tree.prototype.setInitialStates = function(node, level) {

        if (!node.nodes) return;
        level += 1;

        var parent = node;
        var _this = this;
        $.each(node.nodes, function checkStates(index, node) {

            // nodeId : unique, incremental identifier
            node.nodeId = _this.nodes.length;

            // parentId : transversing up the tree
            node.parentId = parent.nodeId;

            // if not provided set selectable default value
            if (!node.hasOwnProperty('selectable')) {
                node.selectable = true;
            }

            // where provided we should preserve states
            node.state = node.state || {};

            // set checked state; unless set always false
            if (!node.state.hasOwnProperty('checked')) {
                node.state.checked = false;
            }

            // set enabled state; unless set always false
            if (!node.state.hasOwnProperty('disabled')) {
                node.state.disabled = false;
            }

            // set expanded state; if not provided based on levels
            if (!node.state.hasOwnProperty('expanded')) {
                if (!node.state.disabled &&
                    (level < _this.options.levels) &&
                    (node.nodes && node.nodes.length > 0)) {
                    node.state.expanded = true;
                } else {
                    node.state.expanded = false;
                }
            }

            // set selected state; unless set always false
            if (!node.state.hasOwnProperty('selected')) {
                node.state.selected = false;
            }

            // index nodes in a flattened structure for use later
            _this.nodes.push(node);

            // recurse child nodes and transverse the tree
            if (node.nodes) {
                _this.setInitialStates(node, level);
            }
        });
    };

    Tree.prototype.clickHandler = function(event) {
        if (!this.options.enableLinks) event.preventDefault();

        var target = $(event.target);
        var node = this.findNode(target);
        if (!node) return;

        var classList = target.attr('class') ? target.attr('class').split(' ') : [];
        if ((classList.indexOf('expand-icon') !== -1)) {
            this.toggleExpandedState(node, _default.options);
            this.render();
        } else if ((classList.indexOf('check-icon') !== -1)) {
            if (node.state.disabled) {
                return;
            }
            this.toggleCheckedState(node, _default.options);
            this.render();
        } else {

            if (node.selectable) {
                this.toggleSelectedState(node, _default.options);
            } else {
                this.toggleExpandedState(node, _default.options);
            }

            this.render();
        }
    };

    // Looks up the DOM for the closest parent list item to retrieve the
    // data attribute nodeid, which is used to lookup the node in the flattened structure.
    Tree.prototype.findNode = function(target) {

        var nodeId = target.closest('li.list-group-item').attr('data-nodeid');
        var node = this.nodes[nodeId];

        if (!node) {
            console.log('Error: node does not exist');
        }
        return node;
    };

    Tree.prototype.toggleExpandedState = function(node, options) {
        if (!node) return;
        this.setExpandedState(node, !node.state.expanded, options);
    };

    Tree.prototype.setExpandedState = function(node, state, options) {

        if (state === node.state.expanded) return;

        if (state && node.nodes) {

            // Expand a node
            node.state.expanded = true;
            if (!options.silent) {
                this.$element.trigger('nodeExpanded', $.extend(true, {}, node));
            }
        } else if (!state) {

            // Collapse a node
            node.state.expanded = false;
            if (!options.silent) {
                this.$element.trigger('nodeCollapsed', $.extend(true, {}, node));
            }

            // Collapse child nodes
            if (node.nodes && !options.ignoreChildren) {
                $.each(node.nodes, $.proxy(function(index, node) {
                    this.setExpandedState(node, false, options);
                }, this));
            }
        }
    };

    Tree.prototype.toggleSelectedState = function(node, options) {
        if (!node) return;
        this.setSelectedState(node, !node.state.selected, options);
    };

    Tree.prototype.setSelectedState = function(node, state, options) {

        if (state === node.state.selected) return;

        if (state) {

            // If multiSelect false, unselect previously selected
            if (!this.options.multiSelect) {
                $.each(this.findNodes('true', 'g', 'state.selected'), $.proxy(function(index, node) {
                    this.setSelectedState(node, false, options);
                }, this));
            }

            // Continue selecting node
            node.state.selected = true;
            if (!options.silent) {
                this.$element.trigger('nodeSelected', $.extend(true, {}, node));
            }
        } else {

            // Unselect node
            node.state.selected = false;
            if (!options.silent) {
                this.$element.trigger('nodeUnselected', $.extend(true, {}, node));
            }
        }
    };

    Tree.prototype.toggleCheckedState = function(node, options) {
        if (!node) return;
        this.setCheckedState(node, !node.state.checked, options);
    };

    Tree.prototype.setCheckedState = function(node, state, options) {
        var _this = this;
        var stateFlag, eventType;

        if (state === node.state.checked) return;

        stateFlag = state ? true : false;
        eventType = state ? 'nodeChecked' : 'nodeUnchecked';

        node.state.checked = stateFlag;

        if (_this.options.enableUpCascade || _this.options.enableDownCascade) {
            //reset nodes array
            _this.childsNodes = [];
            _this.parentNodes = [];

            if (_this.options.enableDownCascade) {
                //Recurse the tree structure and get all child nodes
                _this.getChilds(node);

                if (_this.childsNodes && _this.childsNodes.length) {
                    $.each(_this.childsNodes, function(index, el) {
                        if (!el.state.disabled) {
                            el.state.checked = stateFlag;
                        }
                    });
                }
            }

            if (_this.options.enableUpCascade) {
                //Recurse the tree structure and get all parent nodes
                _this.getParents(node);

                $.each(_this.parentNodes, function(index, node) {
                    if (!node.state.disabled) {
                        var checkedNodes = _this.getChecked(node);
                        if (checkedNodes.length == node.nodes.length) {
                            node.state.checked = true;
                        } else {
                            node.state.checked = false;
                        }
                    }
                });
            }
        }

        //Trigger the Event

        if (!options.silent) {
            _this.$element.trigger(eventType, $.extend(true, {}, node));
        }
    };

    Tree.prototype.setDisabledState = function(node, state, options) {

        if (state === node.state.disabled) return;

        if (state) {

            // Disable node
            node.state.disabled = true;

            // Disable all other states
            this.setExpandedState(node, false, options);
            this.setSelectedState(node, false, options);
            this.setCheckedState(node, false, options);

            if (!options.silent) {
                this.$element.trigger('nodeDisabled', $.extend(true, {}, node));
            }
        } else {

            // Enabled node
            node.state.disabled = false;
            if (!options.silent) {
                this.$element.trigger('nodeEnabled', $.extend(true, {}, node));
            }
        }
    };

    Tree.prototype.render = function() {

        if (!this.initialized) {

            // Setup first time only components
            this.$element.addClass(pluginName);
            this.$wrapper = $(this.template.list);

            this.injectStyle();

            this.initialized = true;
        }

        this.$element.empty().append(this.$wrapper.empty());

        // Build tree
        this.buildTree(this.tree, 0);
    };

    // Starting from the root node, and recursing down the
    // structure we build the tree one node at a time
    Tree.prototype.buildTree = function(nodes, level) {

        if (!nodes) return;
        level += 1;

        var _this = this;
        $.each(nodes, function addNodes(id, node) {

            var treeItem = $(_this.template.item)
                .addClass('node-' + _this.elementId)
                .addClass(node.state.checked ? 'node-checked' : '')
                .addClass(node.state.disabled ? 'node-disabled' : '')
                .addClass(node.state.selected ? 'node-selected' : '')
                .addClass(node.searchResult ? 'search-result' : '')
                .attr('data-nodeid', node.nodeId)
                .attr('style', _this.buildStyleOverride(node));

            // Add indent/spacer to mimic tree structure
            for (var i = 0; i < (level - 1); i++) {
                treeItem.append(_this.template.indent);
            }

            // Add expand, collapse or empty spacer icons
            var classList = [];
            if (node.nodes) {
                classList.push('expand-icon');
                if (node.state.expanded) {
                    classList.push(_this.options.collapseIcon);
                } else {
                    classList.push(_this.options.expandIcon);
                }
            } else {
                classList.push(_this.options.emptyIcon);
            }

            treeItem
                .append($(_this.template.icon)
                    .addClass(classList.join(' '))
                );


            // Add node icon
            if (_this.options.showIcon) {

                var classList = ['node-icon'];

                classList.push(node.icon || _this.options.nodeIcon);
                if (node.state.selected) {
                    classList.pop();
                    classList.push(node.selectedIcon || _this.options.selectedIcon ||
                        node.icon || _this.options.nodeIcon);
                }

                treeItem
                    .append($(_this.template.icon)
                        .addClass(classList.join(' '))
                    );
            }

            // Add check / unchecked icon
            if (_this.options.showCheckbox) {

                var classList = ['check-icon'];
                if (node.state.checked) {
                    classList.push(_this.options.checkedIcon);
                } else {
                    classList.push(_this.options.uncheckedIcon);
                }

                treeItem
                    .append($(_this.template.icon)
                        .addClass(classList.join(' '))
                    );
            }

            // Add text
            if (_this.options.enableLinks) {
                // Add hyperlink
                treeItem
                    .append($(_this.template.link)
                        .attr('href', node.href)
                        .append(node.text)
                    );
            } else {
                // otherwise just text
                treeItem
                    .append(node.text);
            }

            // Add tags as badges
            if (_this.options.showTags && node.tags) {
                $.each(node.tags, function addTag(id, tag) {
                    treeItem
                        .append($(_this.template.badge)
                            .append(tag)
                        );
                });
            }

            // Add item to the tree
            _this.$wrapper.append(treeItem);

            // Recursively add child ndoes
            // edit by yuxiaochen 2016-06-23
            // when node.state.expanded is true and nodes.state.disabled is true, node can expand
            // if (node.nodes && node.state.expanded && !node.state.disabled){
            //  return _this.buildTree(node.nodes, level);
            // }

            if (node.nodes && node.state.expanded) {
                return _this.buildTree(node.nodes, level);
            }
        });
    };

    // Define any node level style override for
    // 1. selectedNode
    // 2. node|data assigned color overrides
    Tree.prototype.buildStyleOverride = function(node) {

        // if (node.state.disabled) return '';

        var color = node.color;
        var backColor = node.backColor;

        if (this.options.highlightSelected && node.state.selected) {
            if (this.options.selectedColor) {
                color = this.options.selectedColor;
            }
            if (this.options.selectedBackColor) {
                backColor = this.options.selectedBackColor;
            }
        }

        //edit by yuxiaochen 2016-06-23
        // if (this.options.highlightSearchResults && node.searchResult && !node.state.disabled) {
        //     if (this.options.searchResultColor) {
        //         color = this.options.searchResultColor;
        //     }
        //     if (this.options.searchResultBackColor) {
        //         backColor = this.options.searchResultBackColor;
        //     }
        // }

        if (this.options.highlightSearchResults && node.searchResult) {
            if (this.options.searchResultColor) {
                color = this.options.searchResultColor;
            }
            if (this.options.searchResultBackColor) {
                backColor = this.options.searchResultBackColor;
            }
        }

        return 'color:' + color +
            ';background-color:' + backColor + ';';
    };

    // Add inline style into head
    Tree.prototype.injectStyle = function() {

        if (this.options.injectStyle && !document.getElementById(this.styleId)) {
            $('<style type="text/css" id="' + this.styleId + '"> ' + this.buildStyle() + ' </style>').appendTo('head');
        }
    };

    // Construct trees style based on user options
    Tree.prototype.buildStyle = function() {

        var style = '.node-' + this.elementId + '{';

        if (this.options.color) {
            style += 'color:' + this.options.color + ';';
        }

        if (this.options.backColor) {
            style += 'background-color:' + this.options.backColor + ';';
        }

        if (!this.options.showBorder) {
            style += 'border:none;';
        } else if (this.options.borderColor) {
            style += 'border:1px solid ' + this.options.borderColor + ';';
        }

        style += '}';

        if (this.options.onhoverColor) {
            style += '.node-' + this.elementId + ':not(.node-disabled):hover{' +
                'background-color:' + this.options.onhoverColor + ';' +
                '}';
        } else {
            style += '.node-' + this.elementId + '{cursor:default !important}';
        }

        return this.css + style;
    };

    Tree.prototype.template = {
        list: '<ul class="list-group"></ul>',
        item: '<li class="list-group-item"></li>',
        indent: '<span class="indent"></span>',
        icon: '<span class="icon"></span>',
        link: '<a href="#" style="color:inherit;"></a>',
        badge: '<span class="badge"></span>'
    };

    Tree.prototype.css = '.treeview .list-group-item{cursor:pointer}.treeview span.indent{margin-left:10px;margin-right:10px}.treeview span.icon{width:12px;margin-right:5px}.treeview .node-disabled{color:silver;cursor:not-allowed}'


    /**
        Returns a single node object that matches the given node id.
        @param {Number} nodeId - A node's unique identifier
        @return {Object} node - Matching node
    */
    Tree.prototype.getNode = function(nodeId) {
        return this.nodes[nodeId];
    };


    //add by yuxiaochen 2016-06-28
    /**
        Returns a single node object that matches the given node id.
        @param {Number} id - A node's unique identifier property
        @return {Object} node - Matching node
    */
    Tree.prototype.getAllNodes = function(id) {
        return this.nodes;
    };

    /**
        Returns the parent node of a given node, if valid otherwise returns undefined.
        @param {Object|Number} identifier - A valid node or node id
        @returns {Object} node - The parent node
    */
    Tree.prototype.getParent = function(identifier) {
        var node = this.identifyNode(identifier);
        return this.nodes[node.parentId];
    };


    /**
        get the parent node of a given node recursively
        store the nodes in this.parentNodes;
        @param {Object|Number} identifier - A valid node or node id
    */
    Tree.prototype.getParents = function(identifier) {
        var node = this.getParent(identifier);

        if (!node) {
            return;
        }

        this.parentNodes.push(node);

        this.getParents(node);
    }


    Tree.prototype.getChilds = function(identifier) {
        var _this = this;
        var node = this.identifyNode(identifier);
        if (!node.nodes) {
            return;
        }

        $.each(node.nodes, function(index, el) {
            _this.childsNodes.push(el);

            _this.getChilds(el);
        });
    }

    /**
        Returns an array of sibling nodes for a given node, if valid otherwise returns undefined.
        @param {Object|Number} identifier - A valid node or node id
        @returns {Array} nodes - Sibling nodes
    */
    Tree.prototype.getSiblings = function(identifier) {
        var node = this.identifyNode(identifier);
        var parent = this.getParent(node);
        var nodes = parent ? parent.nodes : this.tree;
        return nodes.filter(function(obj) {
            return obj.nodeId !== node.nodeId;
        });
    };

    /**
        Returns an array of selected nodes.
        @returns {Array} nodes - Selected nodes
    */
    Tree.prototype.getSelected = function() {
        return this.findNodes('true', 'g', 'state.selected');
    };

    /**
        Returns an array of unselected nodes.
        @returns {Array} nodes - Unselected nodes
    */
    Tree.prototype.getUnselected = function() {
        return this.findNodes('false', 'g', 'state.selected');
    };

    /**
        Returns an array of expanded nodes.
        @returns {Array} nodes - Expanded nodes
    */
    Tree.prototype.getExpanded = function() {
        return this.findNodes('true', 'g', 'state.expanded');
    };

    /**
        Returns an array of collapsed nodes.
        @returns {Array} nodes - Collapsed nodes
    */
    Tree.prototype.getCollapsed = function() {
        return this.findNodes('false', 'g', 'state.expanded');
    };

    /**
        Returns an array of checked nodes.
        @params:a given node
        @returns {Array} nodes - Checked nodes
    */
    Tree.prototype.getChecked = function(node) {
        if (!node || !node.nodes) {
            return this.findNodes('true', 'g', 'state.checked');
        } else {
            return node.nodes.filter(function(obj) {
                return obj.state.checked;
            });
        }
    };

    /**
        Returns an array of unchecked nodes.
        @returns {Array} nodes - Unchecked nodes
    */
    Tree.prototype.getUnchecked = function() {
        return this.findNodes('false', 'g', 'state.checked');
    };

    /**
        Returns an array of disabled nodes.
        @returns {Array} nodes - Disabled nodes
    */
    Tree.prototype.getDisabled = function() {
        return this.findNodes('true', 'g', 'state.disabled');
    };

    /**
        Returns an array of enabled nodes.
        @returns {Array} nodes - Enabled nodes
    */
    Tree.prototype.getEnabled = function() {
        return this.findNodes('false', 'g', 'state.disabled');
    };


    /**
        Set a node state to selected
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.selectNode = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setSelectedState(node, true, options);
        }, this));

        this.render();
    };

    /**
        Set a node state to unselected
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.unselectNode = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setSelectedState(node, false, options);
        }, this));

        this.render();
    };

    /**
        Toggles a node selected state; selecting if unselected, unselecting if selected.
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.toggleNodeSelected = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.toggleSelectedState(node, options);
        }, this));

        this.render();
    };


    /**
        Collapse all tree nodes
        @param {optional Object} options
    */
    Tree.prototype.collapseAll = function(options) {
        var identifiers = this.findNodes('true', 'g', 'state.expanded');
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setExpandedState(node, false, options);
        }, this));

        this.render();
    };

    /**
        Collapse a given tree node
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.collapseNode = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setExpandedState(node, false, options);
        }, this));

        this.render();
    };

    /**
        Expand all tree nodes
        @param {optional Object} options
    */
    Tree.prototype.expandAll = function(options) {
        options = $.extend({}, _default.options, options);

        if (options && options.levels) {
            this.expandLevels(this.tree, options.levels, options);
        } else {
            var identifiers = this.findNodes('false', 'g', 'state.expanded');
            this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
                this.setExpandedState(node, true, options);
            }, this));
        }

        this.render();
    };

    /**
        Expand a given tree node
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.expandNode = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setExpandedState(node, true, options);
            if (node.nodes && (options && options.levels)) {
                this.expandLevels(node.nodes, options.levels - 1, options);
            }
        }, this));

        this.render();
    };

    Tree.prototype.expandLevels = function(nodes, level, options) {
        options = $.extend({}, _default.options, options);

        $.each(nodes, $.proxy(function(index, node) {
            this.setExpandedState(node, (level > 0) ? true : false, options);
            if (node.nodes) {
                this.expandLevels(node.nodes, level - 1, options);
            }
        }, this));
    };

    /**
        Reveals a given tree node, expanding the tree from node to root.
        @param {Object|Number|Array} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.revealNode = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            var parentNode = this.getParent(node);
            while (parentNode) {
                this.setExpandedState(parentNode, true, options);
                parentNode = this.getParent(parentNode);
            };
        }, this));

        this.render();
    };

    /**
        Toggles a nodes expanded state; collapsing if expanded, expanding if collapsed.
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.toggleNodeExpanded = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.toggleExpandedState(node, options);
        }, this));

        this.render();
    };


    /**
        Check all tree nodes
        @param {optional Object} options
    */
    Tree.prototype.checkAll = function(options) {
        var identifiers = this.findNodes('false', 'g', 'state.checked');
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setCheckedState(node, true, options);
        }, this));

        this.render();
    };

    /**
        Check a given tree node
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.checkNode = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setCheckedState(node, true, options);
        }, this));

        this.render();
    };

    /**
        Uncheck all tree nodes
        @param {optional Object} options
    */
    Tree.prototype.uncheckAll = function(options) {
        var identifiers = this.findNodes('true', 'g', 'state.checked');
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setCheckedState(node, false, options);
        }, this));

        this.render();
    };


    Tree.prototype.uncheckRealAll = function(options) {
        var identifiers = this.findNodes('true', 'g', 'state.checked');
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            if (!node.state.disabled) {
                this.setCheckedState(node, false, options);
            }
        }, this));

        this.render();
    };

    /**
        Uncheck a given tree node
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.uncheckNode = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setCheckedState(node, false, options);
        }, this));

        this.render();
    };

    /**
        Toggles a nodes checked state; checking if unchecked, unchecking if checked.
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.toggleNodeChecked = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.toggleCheckedState(node, options);
        }, this));

        this.render();
    };


    /**
        Disable all tree nodes
        @param {optional Object} options
    */
    Tree.prototype.disableAll = function(options) {
        var identifiers = this.findNodes('false', 'g', 'state.disabled');
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setDisabledState(node, true, options);
        }, this));

        this.render();
    };

    /**
        Disable a given tree node
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.disableNode = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setDisabledState(node, true, options);
        }, this));

        this.render();
    };

    /**
        Enable all tree nodes
        @param {optional Object} options
    */
    Tree.prototype.enableAll = function(options) {
        var identifiers = this.findNodes('true', 'g', 'state.disabled');
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setDisabledState(node, false, options);
        }, this));

        this.render();
    };

    /**
        Enable a given tree node
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.enableNode = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setDisabledState(node, false, options);
        }, this));

        this.render();
    };

    /**
        Toggles a nodes disabled state; disabling is enabled, enabling if disabled.
        @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
        @param {optional Object} options
    */
    Tree.prototype.toggleNodeDisabled = function(identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function(node, options) {
            this.setDisabledState(node, !node.state.disabled, options);
        }, this));

        this.render();
    };


    /**
        Common code for processing multiple identifiers
    */
    Tree.prototype.forEachIdentifier = function(identifiers, options, callback) {

        options = $.extend({}, _default.options, options);

        if (!(identifiers instanceof Array)) {
            identifiers = [identifiers];
        }

        $.each(identifiers, $.proxy(function(index, identifier) {
            callback(this.identifyNode(identifier), options);
        }, this));
    };

    /*
        Identifies a node from either a node id or object
    */
    Tree.prototype.identifyNode = function(identifier) {
        return ((typeof identifier) === 'number') ?
            this.nodes[identifier] :
            identifier;
    };

    /**
        Searches the tree for nodes (text) that match given criteria
        @param {String} pattern - A given string to match against
        @param {optional Object} options - Search criteria options
        @return {Array} nodes - Matching nodes
    */
    Tree.prototype.search = function(pattern, options) {
        options = $.extend({}, _default.searchOptions, options);

        this.clearSearch({
            render: false
        });

        var results = [];
        if (pattern && pattern.length > 0) {

            if (options.exactMatch) {
                pattern = '^' + pattern + '$';
            }

            var modifier = 'g';
            if (options.ignoreCase) {
                modifier += 'i';
            }

            results = this.findNodes(pattern, modifier);

            // Add searchResult property to all matching nodes
            // This will be used to apply custom styles
            // and when identifying result to be cleared
            $.each(results, function(index, node) {
                node.searchResult = true;
            })
        }

        // If revealResults, then render is triggered from revealNode
        // otherwise we just call render.
        if (options.revealResults) {
            this.revealNode(results);
        } else {
            this.render();
        }

        this.$element.trigger('searchComplete', $.extend(true, {}, results));

        return results;
    };

    /**
        Clears previous search results
    */
    Tree.prototype.clearSearch = function(options) {

        options = $.extend({}, {
            render: true
        }, options);

        var results = $.each(this.findNodes('true', 'g', 'searchResult'), function(index, node) {
            node.searchResult = false;
        });

        if (options.render) {
            this.render();
        }

        this.$element.trigger('searchCleared', $.extend(true, {}, results));
    };

    /**
        Find nodes that match a given criteria
        @param {String} pattern - A given string to match against
        @param {optional String} modifier - Valid RegEx modifiers
        @param {optional String} attribute - Attribute to compare pattern against
        @return {Array} nodes - Nodes that match your criteria
    */
    Tree.prototype.findNodes = function(pattern, modifier, attribute) {

        modifier = modifier || 'g';
        attribute = attribute || 'text';

        var _this = this;
        return $.grep(this.nodes, function(node) {
            var val = _this.getNodeValue(node, attribute);
            if (typeof val === 'string') {
                return val.match(new RegExp(pattern, modifier));
            }
        });
    };

    /**
        Recursive find for retrieving nested attributes values
        All values are return as strings, unless invalid
        @param {Object} obj - Typically a node, could be any object
        @param {String} attr - Identifies an object property using dot notation
        @return {String} value - Matching attributes string representation
    */
    Tree.prototype.getNodeValue = function(obj, attr) {
        var index = attr.indexOf('.');
        if (index > 0) {
            var _obj = obj[attr.substring(0, index)];
            var _attr = attr.substring(index + 1, attr.length);
            return this.getNodeValue(_obj, _attr);
        } else {
            if (obj.hasOwnProperty(attr)) {
                return obj[attr].toString();
            } else {
                return undefined;
            }
        }
    };

    var logError = function(message) {
        if (window.console) {
            window.console.error(message);
        }
    };

    // Prevent against multiple instantiations,
    // handle updates and method calls
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
                    if (!(args instanceof Array)) {
                        args = [args];
                    }
                    result = _this[options].apply(_this, args);
                }
            } else if (typeof options === 'boolean') {
                result = _this;
            } else {
                $.data(this, pluginName, new Tree(this, $.extend(true, {}, options)));
            }
        });

        return result || this;
    };

})(jQuery, window, document);

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
            获取渲染tree数据的异步请求地址
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            apiUrl: '',

            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            请求方法，Get OR POST
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            type: 'GET',

            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            请求的数据类型
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            dataType: "jsonp",

            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            设置ajax请求的timeout 时间,默认为1分钟
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            timeout: 60000,

            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            异步请求报文
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            data: null,

            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            是否显示搜索框
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            showSearch: true,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            placeholder 文本
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            placeholder: '请选择...',

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            defaultVals 默认值s
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            defaultVals: null,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            enableUpCascade 设置勾选节点是否影响上级节点,即向上递归
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            enableUpCascade: true,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            enableUpCascade 设置勾选节点是否影响上级节点,即向上递归
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            enableDownCascade: true,

            /*-----------------------------------------------------------------------------------------------------------
            设置默认是否显示树形
            -----------------------------------------------------------------------------------------------------------*/
            showTree: false,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            是否显示级联的文本，目前只支持单选的前提下。
            默认为false ,表示 点击长宁区节点，选中项文本为 [长宁区]
            为true时，选中项文本为[上海市-长宁区]
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            cascadeText: false,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            cascadeText 为true 的时候，选中项文本的分隔符
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            cascadeTextSeparator: '-',

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            树渲染完成后，执行的回调方法 
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            successCallback: null,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            ajax接口请求出错时候的回调方法 
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            errorCallback: null,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            ajax当接口返回结果码不为200时候，调用的接口方法 
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            exceptionCallback: null,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            勾选或者选中，选中项生成好了，回调事件
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            onCompleted: undefined,

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
             bootstrap-treeview 参数配置
             --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            "bootstrapTreeParams": {
                /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                设置继承树默认展开的级别,默认为2级
                --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                "levels": 2,
                /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                是否可以同时选择多个节点
                --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                multiSelect: true,
                /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                设置处于checked状态的复选框图标。
                --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                checkedIcon: "glyphicon glyphicon-stop",

                /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                是否在节点上显示边框
                --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                showBorder: false
            }
        };

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    * ***************************************
    *
    *   构造函数与私有函数定义
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
            var parent = item.pid;
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
                } else {
                    obj.res.push(item);
                }
            }

            return obj;
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

        //console.log(toShowNodeArr);
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

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            获取所有的选中项或选择项
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            getChecked: $.proxy(this.getChecked, this),

            /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
            设置默认值
            --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            setDefaults: $.proxy(this.setDefaults, this)
        };
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    入口方法
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.init = function(options) {
        if (this.settings) {
            this.settings = $.extend({}, this.settings, options);
        } else {
            this.settings = $.extend(true, {}, this.defaults, options);
        }

        this.treeContainer = $(this.template.treeContainer);
        this.tree = $(this.template.tree);
        this.searchInput = $(this.template.searchInput);
        this.placeholder = $(this.template.placeholder).html(this.settings.placeholder);
        this.defaultVals = this.element.attr("data-id") ? this.element.attr("data-id").split(',') : [];

        /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        reset element state
        --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        this.destroy();

        /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        订阅事件
        --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        this.subscribeEvents();

        /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        设置或请求渲染树的数据
        --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        this.setInitialStates();
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    重置控件相关设置
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.destroy = function() {
        // Switch off events
        this.element.off('click');
        $('html').off('click');
        this.searchInput.off('keyup');

        this.element.empty();
        this.treeContainer.empty();

        // Reset this.initialized flag
        this.initialized = false;
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    订阅事件
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.subscribeEvents = function() {

        this.unsubscribeEvents();

        if (typeof(this.settings.onCompleted) === 'function') {
            this.element.on('completed', this.settings.onCompleted);
        }
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    取消所有订阅事件
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.unsubscribeEvents = function() {
        this.element.off('nodeChecked');
        this.element.off('nodeUnchecked');
        this.element.off('nodeSelected');
        this.element.off('nodeUnselected');
        this.element.off('nodesCleared');
        this.element.off('completed');
    };


    TreeViewSelect.prototype.setInitialStates = function() {
        var _ = this;

        if (_.element.attr('data-tree')) {
            _.initialized = true;
            _.treeData = $.parseJSON(_.element.attr('data-tree'));
            _.buildTreeSelect();

            if (_.settings.successCallback) {
                _.settings.successCallback(_.rendredNodes);
            }
        } else {
            try {
                $.ajax({
                    url: _.settings.apiUrl,
                    type: _.settings.type,
                    timeout: _.settings.timeout,
                    dataType: _.settings.dataType,
                    data: _.settings.data,
                    success: function(resp) {
                        if (resp && resp.status == '1') {
                            if (resp.data) {
                                _.initialized = true;
                                if (typeof resp.data === "string") {
                                    _.treeData = $.parseJSON(resp.data);
                                } else {
                                    _.treeData = resp.data;
                                }

                                _.buildTreeSelect();

                                if (_.settings.successCallback) {
                                    _.settings.successCallback(_.rendredNodes);
                                }
                            }
                        } else {
                            if (_.settings.exceptionCallback) {
                                _.settings.exceptionCallback();
                            }
                        }
                    },
                    error: function(e) {
                        if (_.settings.errorCallback) {
                            _.settings.errorCallback();
                        }
                    }
                })
            } catch (e) {
                logError(e);
                if (_.settings.errorCallback) {
                    _.settings.errorCallback();
                }
            }
        }

    }

    TreeViewSelect.prototype.buildTreeSelect = function() {
        var treeContainerId;

        //选项项容器部分
        this.element.addClass('treeviewSelect-selection');
        this.element.append($(this.placeholder));
        this.element.append($(this.template.listGroup));
        this.element.append($(this.template.listOpGroup));

        //tree
        treeContainerId = 'treeContainerId_' + parseInt($('.treeviewSelect-container').length + 1);
        this.treeContainer.attr('id', treeContainerId);
        if (this.settings.showSearch) {
            this.treeContainer.append(this.searchInput);
        }

        if (this.settings.showTree) {
            this.treeContainer.removeClass('hide');
        }

        this.treeContainer.append(this.tree);
        this.element.parent().append(this.treeContainer);



        this.setTree();

        this.setSelectList();

        this.renderItems(true);
    }

    TreeViewSelect.prototype.setTree = function() {
        var tConfig = this.settings.bootstrapTreeParams;

        tConfig.data = flatToHierarchy(this.treeData);
        tConfig.showCheckbox = this.settings.bootstrapTreeParams.multiSelect;
        tConfig.highlightSelected = !this.settings.bootstrapTreeParams.multiSelect;
        tConfig.onhoverColor = this.settings.bootstrapTreeParams.multiSelect ? "" : "#F5F5F5";
        tConfig.enableUpCascade = this.settings.enableUpCascade;
        tConfig.enableDownCascade = this.settings.enableDownCascade;

        this.tree.treeview(tConfig);

        this.bindTreeEvents();

        this.setTreePosition();
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    给tree 绑定事件
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.bindTreeEvents = function() {
        var _ = this;

        //搜索框绑定相关事件
        _.searchInput.off('keypress');
        _.searchInput.on('keypress', function(event) {
            var _this = $(this);
            if (event.keyCode == "13") {
                //对于| 这个值进行特殊处理
                if (_this.val() == "|") {
                    return false;
                }

                var sNodes = _.searchNodes($.trim(_this.val()));

                if (sNodes && sNodes.length > 0) {
                    //scroll to first checked node postion
                    var $firstNode = _.tree.find('li[data-nodeid=' + sNodes[0].nodeId + ']');

                    //get node index in the node container;
                    var n_Index = $firstNode.index();

                    //get node real height 
                    var n_Height = $firstNode.height() + parseInt($firstNode.css('padding-top').replace('px', '')) * 2;

                    if ($firstNode.length > 0) {
                        _.tree.scrollTop((n_Index - 1) * n_Height);
                    } else {
                        _.tree.scrollTop(0);
                    }
                } else {
                    _.tree.scrollTop(0);
                }

                return false;
            }
        });

        if (_.settings.bootstrapTreeParams.multiSelect) {
            _.tree.on('nodeChecked nodeUnchecked', function(event, node) {

                _.clicked = true;

                _.renderItems();

                return false;
            });

        } else {
            _.tree.on('nodeSelected', function(event, node) {
                if (!_.settings.showTree) {
                    _.treeContainer.addClass('hide');
                }
                _.clicked = true;

                _.renderItems();

                return false;
            });
        }
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    初始化已选择列表
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.setSelectList = function() {
        var _ = this;

        //如果默认是显示树形控件的，则无需绑定点击事件
        if (_.settings.showTree) {
            return;
        }

        //绑定点击事件
        _.element.on('click', function() {
            var firstNodeId, $firstNode;
            //先隐藏掉其他treeViewSelect
            $('.treeviewSelect-container').each(function(index, el) {
                if ($(el).attr('id') != _.treeContainer.attr('id')) {
                    $(el).addClass('hide');
                }
            });

            //设置tree 点击是否显示
            if (_.treeContainer.hasClass('hide') && _.initialized) {

                //显示tree
                _.treeContainer.removeClass('hide');

                //重置搜索框
                _.searchInput.val('');
                _.tree.treeview('clearSearch');


                //循环遍历所有选中项，勾选对应节点，并展开
                _.element.find('.treeviewselect-item').each(function(index, el) {
                    var nodeId = $(el).attr('nodeid'),
                        node;

                    if (nodeId) {
                        node = _.getNodeById(nodeId);
                        _.setNodeState(node, true);

                        //展开节点
                        if (node['nodes']) { //如存在子节点
                            _.tree.treeview('expandNode', [node, {
                                levels: 1,
                                silent: true
                            }]);

                        } else { //不存在子节点，就展开对应的父节点
                            var pNode = _.tree.treeview('getParent', node);
                            if (pNode.nodeId) {
                                _.tree.treeview('expandNode', [pNode, {
                                    levels: 1,
                                    silent: true
                                }]);
                            }
                        }

                        //记录第一个节点
                        if (index === 0) {
                            firstNodeId = nodeId;
                        }
                    }
                });

                //滑动到第一个node的位置
                _.goToFirstNodePosition(firstNodeId);

            } else {
                _.treeContainer.addClass('hide');
            }

            return false;
        });

        //outside click hide the treecontainer
        $('html').on('click', function(eventObject) {
            var $el = $(eventObject.target);

            if (!$el.hasClass('list-group-item') && !$el.hasClass('check-icon') && !$el.hasClass('treeview-search-input') && !$el.hasClass('expand-icon') && !$el.hasClass('treeviewSelect-container')) {
                $('.treeviewSelect-container').addClass('hide');
            }
        });
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    渲染选择项
    params:
    @isDefault:是否设置默认选项
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.renderItems = function(isDefault) {
        var _ = this;
        var checkedNodes, listNodes, totalWidth, pNodesArr, nodeIds, tmpNode;
        var $itemLisGroup, $clearItem, $selectedItem, $ellipsisItem;
        var hiddenNodeStrs = '';

        $clearItem = $(_.template.clearItem);
        $ellipsisItem = $(_.template.ellipsisItem);
        $itemLisGroup = _.element.find('.treeviewselect-listGroup ul');
        $itemLisGroup.empty();
        _.element.find('.treeviewselect-listOpGroup .treeviewselect-clear').remove();

        if (_.settings.bootstrapTreeParams.multiSelect) {
            checkedNodes = _.tree.treeview('getChecked');
            listNodes = checkedNodes;
            if (_.settings.enableUpCascade || _.settings.enableDownCascade) {
                listNodes = getSelectedNode(_.tree, checkedNodes);
            }
        } else {
            listNodes = _.tree.treeview('getSelected');
        }

        if (listNodes && listNodes.length > 0) {
            //隐藏placeholder
            _.placeholder.hide();

            for (var i = 0; i < listNodes.length; i++) {
                totalWidth = 0;
                pNodesArr = [];

                //取出指定节点的父节点的数量，并给节点赋值，父节点的数量就是节点的level 值
                getParentNodes(_.tree, listNodes[i], pNodesArr);
                listNodes[i].level = pNodesArr.length + 1;
                //解决 $.extend() 中 对象循环指向导致的栈溢出，采取对象深复制
                listNodes[i].parents=$.parseJSON(JSON.stringify(pNodesArr)) ;

                //生成选中项
                $selectedItem = _.genTreeSelectItem(listNodes[i]);

                //如果支持多选但是不支持多行，则超出部分显示省略号
                if (_.settings.bootstrapTreeParams.multiSelect) {
                    $selectedItem.css('visibility', 'hidden');
                    $itemLisGroup.append($selectedItem);

                    if (($itemLisGroup.width() - $itemLisGroup.position().left) > ($('.treeviewselect-listOpGroup').position().left) - 38) {
                        $selectedItem.hide();
                        hiddenNodeStrs += listNodes[i].text + ';';
                    } else {
                        $selectedItem.css('visibility', 'visible');
                    }
                } else {
                    $itemLisGroup.append($selectedItem);
                }
            }

            if (hiddenNodeStrs) {
                $ellipsisItem.css('visibility', 'visible').attr({
                    'data-toggle': 'tooltip',
                    'data-placement': 'bottom',
                    'title': hiddenNodeStrs
                });
                $itemLisGroup.append($ellipsisItem);
            }
        } else {
            _.placeholder.show();
        }

        //支持多选则添加清空按钮
        if (listNodes.length) {
            //重置筛选条件按钮绑定事件
            $clearItem.find('.glyphicon-remove').off('click').on('click', function(event) {

                if (_.settings.bootstrapTreeParams.multiSelect) {
                    _.tree.treeview('uncheckRealAll', {
                        silent: true
                    });
                } else {
                    if (!listNodes[0].state.disabled) {
                        _.tree.treeview('unselectNode', [listNodes[0], {
                            silent: true
                        }]);
                    }
                }
                _.clicked = true;

                _.renderItems();

                _.element.trigger('completed', [
                    []
                ]);

                event.stopPropagation();
            });

            //添加重置筛选条件        
            _.element.find('.treeviewselect-listOpGroup ul').prepend($clearItem);
        }

        $('[data-toggle="tooltip"]').tooltip('destroy');
        $('[data-toggle="tooltip"]').tooltip();

        //记录当前已渲染的节点
        _.rendredNodes = listNodes;

        if (!isDefault) {
            _.element.trigger('completed', [listNodes]);
        }
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    设置Tree 节点的状态
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.setNodeState = function(node, state, options) {
        if (this.settings.bootstrapTreeParams.multiSelect) {
            if (state) {
                this.tree.treeview('checkNode', [node, {
                    silent: false
                }]);
            } else {
                this.tree.treeview('uncheckNode', [node, {
                    silent: false
                }]);
            }

        } else {
            this.tree.treeview('selectNode', [node, {
                silent: false
            }]);
        }
    }


    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    生成选中项
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.genTreeSelectItem = function(node) {
        var _ = this;
        var $selectedItem, pNodes = [];

        //判断是否支持多选
        if (_.settings.bootstrapTreeParams.multiSelect) {
            $selectedItem = $(_.template.item);
        } else {
            $selectedItem = $(_.template.singleItem);
        }

        $selectedItem.attr('nodeid', node.id);

        if (node.state.disabled) {
            $selectedItem.attr('disabled', node.state.disabled);
            $selectedItem.addClass('disabled');
        }


        if (_.settings.cascadeText && !_.settings.bootstrapTreeParams.multiSelect) {
            var tText = '';
            getParentNodes(_.tree, node, pNodes);
            if (pNodes) {
                for (var i = pNodes.length - 1; i >= 0; i--) {
                    tText += pNodes[i].text + _.settings.cascadeTextSeparator;
                }

                $selectedItem.find('span').html(tText + node.text);
            } else {
                $selectedItem.find('span').html(node.text);
            }
        } else {
            $selectedItem.find('span').html(node.text);
        }

        if (node.text.length > 3) {
            $selectedItem.attr({
                'data-toggle': 'tooltip',
                'data-placement': 'bottom',
                'title': node.text
            });
        }

        $selectedItem.find('.glyphicon-remove').on('click', function() {
            var _this = $(this);

            var node = _.getNodeById(_this.parent().attr('nodeid'));

            //如果节点状态是disabled ，则不可以点击删除
            if (_this.parent().attr('disabled') == "disabled") {
                return false;
            }

            _.setNodeState(node, false);

            if ($('.treeviewselect-listGroup .selected-item').length === 0) {
                $('.treeviewselect-listOpGroup .treeviewselect-clear').remove();
            }

            _this.parent().remove();

            return false;
        });

        return $selectedItem;
    }


    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    设置treeConainer的位置
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.setTreePosition = function() {
        var _ = this;

        var sOffset = _.element.position();
        var sPaddingTop = _.element.css('padding-top').replace('px', '');
        var sPaddingBottom = _.element.css('padding-bottom').replace('px', '');
        var sPaddingLeft = _.element.css('padding-left').replace('px', '');
        var sPaddingRight = _.element.css('padding-right').replace('px', '');

        var tHeight = 250; //treeView的高度,默认为300px
        var tWidth = _.element.width() + parseInt(sPaddingLeft) + parseInt(sPaddingRight); //treeView的宽度
        var tTop = sOffset.top + _.element.height() + parseInt(sPaddingTop) + parseInt(sPaddingBottom) + 5;
        var tLeft = sOffset.left;

        tHeight = _.treeContainer.find('li.list-group-item').length * 40 * 0.2;
        // tWidth = tWidth < 250 ? 250 : tWidth;
        tHeight = tHeight < 250 ? 250 : tHeight;


        _.treeContainer.css({
            'top': tTop,
            'left': tLeft
        });

        _.tree.css({
            'height': tHeight,
            'width': tWidth
        });

        _.element.css('width', tWidth);
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
    获取当前所有选中节点
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.getChecked = function() {
        var _ = this;
        var checkedNodes;

        var idArray = new Array();

        if (!_.settings.bootstrapTreeParams.multiSelect) {
            _.element.find('.treeviewselect-item').each(function(index, el) {
                if (!$(el).hasClass('ellipsis-item')) {
                    idArray.push($(el).attr('nodeid'));
                }
            });
        } else {
            checkedNodes = _.tree.treeview('getChecked');
            if (checkedNodes) {
                for (var i = 0; i < checkedNodes.length; i++) {
                    idArray.push(checkedNodes[i].id);
                }
            }
        }

        return idArray;
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    设置默认值
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.setDefaults = function(vals) {
        var _ = this;
        var tmpNode;
        if (!vals || !vals.length) {
            return;
        }

        this.defaultVals = vals;


        if (_.settings.bootstrapTreeParams.multiSelect) {
            _.tree.treeview('uncheckAll', { silent: true });
        } else {
            tmpNode = _.tree.treeview('getSelected');

            if (tmpNode) {
                _.tree.treeview('unselectNode', [tmpNode, {
                    silent: true
                }]);
            }
        }

        for (var i = 0; i < this.defaultVals.length; i++) {
            tmpNode = _.getNodeById(this.defaultVals[i])
            if (tmpNode) {
                if (_.settings.bootstrapTreeParams.multiSelect) {
                    _.tree.treeview('checkNode', [tmpNode, {
                        silent: true
                    }]);

                } else {
                    _.tree.treeview('selectNode', [tmpNode, {
                        silent: true
                    }]);
                }
            }
        }

        this.renderItems(true);
    }


    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    根据ID属性获取tree Node
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.getNodeById = function(id) {
        var _ = this;
        var tmpNode;
        var nodes = _.tree.treeview('getAllNodes');
        if (nodes && nodes.length > 0) {
            for (var i = nodes.length - 1; i >= 0; i--) {
                if (nodes[i].id == id) {
                    tmpNode = nodes[i];
                    break;
                }
            }
        }

        return tmpNode;
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    滑动到第一个node的位置
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.goToFirstNodePosition = function(nodeId) {
        var _ = this;
        var $firstLi, preNodes, liHeight;

        var node = _.getNodeById(nodeId);

        if (!node) {
            return;
        }

        $firstLi = _.tree.find('li[data-nodeid=' + node.nodeId + ']');

        if ($firstLi.length > 0) {
            preNodes = $firstLi.prevAll();
            liHeight = $firstLi.height() + parseInt($firstLi.css('padding-top').replace('px', '')) + parseInt($firstLi.css('padding-bottom').replace('px', ''));
            _.tree.scrollTop(liHeight * preNodes.length - 60);
        } else {
            _.tree.scrollTop(0);
        }
    }

    /*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    相关模板定义
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    TreeViewSelect.prototype.template = {
        listGroup: '<li class="treeviewselect-listGroup"><ul></ul></li>',
        listOpGroup: '<li class="treeviewselect-listOpGroup"><ul></ul></li>',
        item: '<li class="treeviewselect-item selected-item"><i class="glyphicon glyphicon-remove"></i><span></span></li>',
        clearItem: '<li class="treeviewselect-clear"><i class="glyphicon glyphicon-remove"></i></li>',
        ellipsisItem: '<li class="treeviewselect-item ellipsis-item">....</li>',
        singleItem: '<li class="treeviewselect-item"><span></span></li>',
        bottomArrowItem: '<li class="treeviewselect-arrow"><i class="glyphicon glyphicon-triangle-bottom"></i></li>',
        inlineInput: '<li><input type="text" class="treeviewSelect-inline-input"></li>',
        treeContainer: '<ul class="treeviewSelect-container hide"></ul>',
        searchInput: '<input class="treeview-search-input" placeholder="请搜索..."></input>',
        tree: '<div class="treeviewSelect-tree"></div>',
        placeholder: '<li class="treeviewselect-placeholder"></li>'
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
                    result = _this[options].call(_this, args);
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
