var tree = [{
    text: "Parent 1",
    state: {
        expanded: true
    },
    nodes: [{
        text: "Child 1",
        nodes: [{
            text: "Grandchild 1",
            id: "222"
        }, {
            text: "Grandchild 2"
        }]
    }, {
        text: "Child 2"
    }]
}, {
    text: "Parent 2"
}, {
    text: "Parent 3"
}, {
    text: "Parent 4"
}, {
    text: "Parent 5"
}];

var zNodes = [{
    id: 1,
    pId: 0,
    name: "父节点1 - 展开",
    open: true
}, {
    id: 11,
    pId: 1,
    open: true,
    name: "父节点11 - 折叠"
}, {
    id: 111,
    pId: 11,
    name: "叶子节点111"
}, {
    id: 112,
    pId: 11,
    name: "叶子节点112"
}, {
    id: 113,
    pId: 11,
    name: "叶子节点113"
}, {
    id: 114,
    pId: 11,
    name: "叶子节点114"
}, {
    id: 12,
    pId: 1,
    name: "父节点12 - 折叠"
}, {
    id: 121,
    pId: 12,
    name: "叶子节点121"
}, {
    id: 122,
    pId: 12,
    name: "叶子节点122"
}, {
    id: 123,
    pId: 12,
    name: "叶子节点123"
}, {
    id: 124,
    pId: 12,
    name: "叶子节点124"
}, {
    id: 13,
    pId: 1,
    name: "父节点13 - 没有子节点",
    isParent: true
}, {
    id: 2,
    pId: 0,
    name: "父节点2 - 折叠"
}, {
    id: 21,
    pId: 2,
    name: "父节点21 - 展开",
    open: true
}, {
    id: 211,
    pId: 21,
    name: "叶子节点211"
}, {
    id: 212,
    pId: 21,
    name: "叶子节点212"
}, {
    id: 213,
    pId: 21,
    name: "叶子节点213"
}, {
    id: 214,
    pId: 21,
    name: "叶子节点214"
}, {
    id: 22,
    pId: 2,
    name: "父节点22 - 折叠"
}, {
    id: 221,
    pId: 22,
    name: "叶子节点221"
}, {
    id: 222,
    pId: 22,
    name: "叶子节点222"
}, {
    id: 223,
    pId: 22,
    name: "叶子节点223"
}, {
    id: 224,
    pId: 22,
    name: "叶子节点224"
}, {
    id: 23,
    pId: 2,
    name: "父节点23 - 折叠"
}, {
    id: 231,
    pId: 23,
    name: "叶子节点231"
}, {
    id: 232,
    pId: 23,
    name: "叶子节点232"
}, {
    id: 233,
    pId: 23,
    name: "叶子节点233"
}, {
    id: 234,
    pId: 23,
    name: "叶子节点234"
}, {
    id: 3,
    pId: 0,
    name: "父节点3 - 没有子节点",
    isParent: true
}, {
    id: 2341,
    pId: 234,
    name: "叶子节点2341"
}];


var str = window.JSON.stringify(zNodes);

str = str.replace(/name/g, 'text');
//console.log(str);

function unflatten(items) {
    return items.reduce(insert, {
        res: [],
        map: {}
    }).res;
}

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

var recursiveArray = unflatten($.parseJSON(str));

//console.log(JSON.stringify(recursiveArray, null, 4));

$(function() {
    $('#tree').treeview({
        data: recursiveArray
    });

    $('.dropdown-toggle').click(function() {
        $(this).next(".dropdown-menu").toggle();
    });


    $('#tree').on('nodeSelected', function(event, data) {
        debugger;
        console.log('1111');
        return false;
    });

    $('#tree').on('nodeExpanded', function() {
        return false;
    });

    // $('.dropdown').on('show.bs.dropdown', function() {
    //     console.log('show.bs.dropdown');

    //     $('#tree').treeview('collapseAll', {
    //         silent: true
    //     });
    // });

    var $sel = $('#area');
    var sOffset = $sel.offset();
    var sHeight = $sel.height();
    var sWidth = $sel.width();
    var sPaddingLeft = $sel.css('padding-left').replace('px', '');;
    var sPaddingRight = $sel.css('padding-right').replace('px', '');;
    var sPaddingTop = $sel.css('padding-top').replace('px', '');
    var sPaddingBottom = $sel.css('padding-bottom').replace('px', '');;

    console.log('sOffset:' + sOffset);
    console.log('height:' + sHeight + ";" + 'sWidth:' + sWidth);
    console.log('padding-left', $sel.css('padding-left'));

    var dWidth = sWidth + parseInt(sPaddingLeft) + parseInt(sPaddingRight);
    var dHeight = sHeight + parseInt(sPaddingTop) + parseInt(sPaddingBottom);
    var dTop = sOffset.top + 1;
    var dLeft = sOffset.left + 1;


    // $('<div class="s-lay"></div>').height(dHeight).width(dWidth).css({
    //     'background-color': 'red',
    //     'cursor': 'pointer',
    //     'position': 'absolute',
    //     'top': dTop,
    //     'left': dLeft,
    //     'opacity': 0,
    //     'z-index': '999'
    // }).appendTo($sel.parent());

    //$('<div id="tree1"></div>').appendTo($sel.parent());
    var $treeContainer = $('<ul class="dropdown-menu"></ul>');
    var tTop = sOffset.top + dHeight + 5;
    var tLeft = sOffset.left;

    var $treeContainer = $('<ul class="dropdown-menu"></ul>');
    var $tree = $('<div id="tree1"></div>');


    $treeContainer.css({
        'top': tTop,
        'left': tLeft,
        'display': 'block'
    });

    if (dWidth > 300) {
        $treeContainer.css('width', dWidth);
    }

    $tree.treeview({
        data: recursiveArray,
        showCheckbox: true,
        multiSelect: true,
        highlightSelected: false
    });

    Array.prototype.containsNode = function(node) {

        for (var i = 0; i < this.length; i++) {
            if (this[i].nodeId === node.nodeId) {
                return true;
            }
        }

        return false;
    }

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

    function up(node, eventType) {
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
                    up(parent, 'checkNode');
                } else {
                    up(parent, 'uncheckNode');
                }
            } else {
                up(parent, 'uncheckNode');
            }

        } else {
            return;
        }
    }

    function down(node, eventType) {
        if (node['nodes'] != undefined) {
            var children = node['nodes'];
            for (var i = 0; i < children.length; i++) {            
                $tree.treeview(eventType, [children[i].nodeId, {
                    silent: true
                }]);  

                down(children[i], eventType);
            }

        } else {
            return;
        }
    }

    //获取当前节点的所有父节点
    function getParentNodes(tree, node, parentNodes) {
        var pNode = tree.treeview('getParent', node);
        if (pNode != undefined && pNode.id) {
            parentNodes.push(pNode);

            getParentNodes(tree, pNode, parentNodes);
        } else {
            return parentNodes;
        }
    }

    function getSelectedNode(tree, nodeArr) {
        var tmpNode;
        var pNodesArr, pCheckedArr;
        var toShowNodeArr = new Array();

        for (var i = 0; i < nodeArr.length; i++) {
            tmpNode = nodeArr[i];
            pNodesArr = new Array();
            pCheckedArr = new Array();
            getParentNodes(tree, tmpNode, pNodesArr);

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

        console.log(toShowNodeArr);
        return toShowNodeArr;
    }



    $tree.on('nodeSelected nodeChecked', function(event, data) {
        up(data, 'checkNode');
        down(data, 'checkNode');

        var checkedNodes = $tree.treeview('getChecked');

        var aa = getSelectedNode($tree, checkedNodes);
    });

    $tree.on('nodeUnselected nodeUnchecked', function(event, data) {
        up(data, 'uncheckNode');
        down(data, 'uncheckNode');

        var checkedNodes = $tree.treeview('getChecked');

        var aa = getSelectedNode($tree, checkedNodes);
    });

    $treeContainer.append($tree);
    $treeContainer.appendTo($sel.parent());

    $("#area").on('click', function() {
        $(this).find('input').focus();
    });
});
