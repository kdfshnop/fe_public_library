/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. 插件名称：cascadingSelect2
2. 插件描述：悟空找房异步数据表格
3. 版本：1.0
4.  对其他插件的依赖：jQuery,jQuery.select2
5. 备注：
6. 未尽事宜：
7. 作者：唐旭阳(tangxuyang@lifang.com)
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

/*<select id="countryId"></select>
<select id="cityId"></select>
<select id="districtId"></select>
<select id="townId"></select>
<select id="estateId"></select>*/

/*
    optios:{
        selects:[{
            ele:null,//select元素，jQuery对象
            url:null,//查询接口地址
            paramName:null,//查询的参数
            paramNameForNext:null,//带给下个select的查询的参数
            selected:function(){},//选中触发的事件
            data:{
    
            },
            placeholder:{
                id:"-1",
                text:"--请选择--"
            }
        }],
        itemsMapping:'items',
        data:[{//本地数据
            id:1,
            text:"china",
            items:[{
                id:1,
                text:"上海",
                items:[{
                    id:1,
                    text:"浦东",
                    items:[{
                        id:1,
                        text:"花木",
                        items:[{
                            id:1,
                            text:"我的小区"
                        }]
                    }]
                }]
            }]
        }]
    }
*/
+ function() {

    var DEFAULT = {
        itemsMapping:"items",//数据中包含数据项的数组的字段映射
        itemMapping:{//插件需要的数据项中的字段映射
            id:"id",
            text:"text"
        },       
        minimumInput:1 ,//
        dynamic: false,//下拉框中的数据在查询时是否动态的从后台查询
        placeholder:{
            id:"",
            text:"--请选择--"
        }
    };

    function getDataByLevel(data, level, id, result,options) {
        if (level === 0) {
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i][options.itemMapping.id] == id) {
                        result.push(data[i]);
                    }
                }
            }

            return;
        }
        if (data && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                if (data[i] && data[i][options.itemsMapping]) {
                    getDataByLevel(data[i][options.itemsMapping], level - 1, id, result,options);
                }
            }
        }
    }
    $.cascadingSelect2 = function(options) {
        //options.itemsMapping = options.itemsMapping || "items";
        options = Object.assign({},DEFAULT,options);
        console.log(options);
        if (!options.data) {//调用插件时没有传来所需的数据，那就是远程数据方式
            $.each(options.selects, function(index, select) { //遍历配置中的selects
                var dataValue = $(select.ele).data('value');//初始化值
                if( dataValue !== undefined){
                    select.initial = dataValue;
                }
                var localOption = {};                    
                if (options.dynamic) {
                    localOption = {
                        minimumInputLength: select.minimumInput || options.minimumInput,                        
                        ajax: {
                            url: function(params) {//动态的获取查询的地址，因为当前下拉框的数据要受前面下拉框值的影响的
                                var url = select.url;
                                var parentSelect = options.selects[index - 1];
                                if (index > 0) { //非第一个select，因为第一个下拉框不会受别的影响
                                    if (parentSelect.value === undefined || parentSelect.value === null || parentSelect.value === '') { 
                                        url = select.url;
                                    } else {//如果前一个select的value不为空，把它作为url的一部分
                                        url += "?" + options.selects[index - 1].paramNameForNext + "=" + options.selects[index - 1].value;
                                    }
                                }

                                return url;
                            },
                            dataType: select.dataType || 'json',
                            delay: select.delay || 250,
                            data: select.data && typeof select.data === 'function' && select.data || function(params) {
                                var obj = $.extend({}, select.data);
                                obj[select.paramName] = params.term;
                                return obj;
                            },
                            processResults: select.processResults || function(data, params) {
                                params.page = params.page || 1;

                                return {
                                    results: data[options.itemsMapping],
                                    pagination: {
                                        more: false,
                                    }
                                }
                            },
                            transport: function(params, success, failure) {
                                if (index > 0 && select.url === params.url) { //如果非第一个select的url跟初始url相同，表示前一个select没有选中，不发请求
                                    return null;
                                }
                                var $request = $.ajax(params);

                                $request.then(success);
                                $request.fail(failure);

                                return $request;
                            },
                        },

                        language: 'zh-CN',
                        placeholder: select.placeholder&&select.placeholder.text || options.placeholder.text,
                    };

                    $(select.ele).select2(localOption);
                } else {
                    if (index == 0) { //第一个select
                        $.ajax({
                            url: select.url,
                            data: select.data,
                            success: function(data) {
                                data = select.processResults && select.processResults(data) || data;
                                
                                // if(select.placeholder){
                                //     console.log(select.placeholder);    
                                //     var obj = {};
                                //     obj[options.itemMapping.id] = select.placeholder.id;
                                //     obj[options.itemMapping.text] = select.placeholder.text;
                                //     data.unshift(obj);
                                // }
                                var $ele = $(select.ele);
                                console.log(select.initial);
                                $.each(data,function(j, item) {
                                    var _id = item[options.itemMapping.id];
                                    $ele.append("<option value='" + _id + "' "+(select.initial == _id?"selected":"")+">" + item[options.itemMapping.text] + "</option>");
                                });
                                $(select.ele).select2({
                                    language:"zh-CN",
                                    //placeholder: select.placeholder && select.placeholder.text || options.placeholder.text
                                });

                                delete select.initial;
                                select.ready && select.ready();
                            }
                        });
                    } else {
                        $(select.ele).select2({
                            language:"zh-CN",
                            placeholder: select.placeholder && select.placeholder.text || options.placeholder.text
                        });
                    }
                }

                $(select.ele).on('change', function() {
                    var val = $(select.ele).val();
                    var placeholderVal = select.placeholder && select.placeholder.id;
                    select.value = val;
                    for (var i = index + 1; i < options.selects.length; i++) {//清空之后的所有下拉框
                        options.selects[i].value = null;
                        $(options.selects[i].ele).find('option').remove();
                        $(options.selects[i].ele).select2({
                            language:"zh-CN",
                            //data:select.placeholder
                            placeholder:select.placeholder
                        });
                    }

                    if (!options.dynamic) {//
                        var nextSelect = options.selects[index + 1];
                        if (nextSelect && val != placeholderVal) {
                            var url = nextSelect.url;

                            if (select.value === undefined || select.value === null || select.value === '') { 
                                url = nextSelect.url;
                            } else {//如果当前select的value不为空，把它作为url的一部分
                                url += "?" + select.paramNameForNext + "=" + select.value;
                            }

                            $.ajax({
                                url: url,
                                data:nextSelect.data||{},
                                success: function(data) {                                    
                                    data = nextSelect.processResults && nextSelect.processResults(data) || data;
                                    var $ele = $(nextSelect.ele);
                                    $.each(data,function(j, item) {
                                        var _id = item[options.itemMapping.id];
                                        $ele.append("<option value='" + _id + "' "+(nextSelect.initial == _id?"selected":"")+">" + item[options.itemMapping.text] + "</option>");
                                    });
                                    $ele.select2({
                                        language:"zh-CN",
                                    });

                                    delete nextSelect.initial;
                                    nextSelect.ready && nextSelect.ready();
                                }
                            });
                        }
                    }

                    if (select.value != null && select.value != "" && select.value != "-1") {//如果选中的是有效的项，触发selected
                        select.selected && select.selected();
                    }
                });
            });

            
        } else { //本地数据
            $.each(options.selects, function(index, select) {
                $(select.ele).select2({
                    data: index === 0 && options.data || null,//只有第一个下拉框中才会在初始时填充数据，后续的下拉框都是根据前面的下拉框的值进行填充的
                    language: "zh-CN",
                    placeholder: select.placeholder && select.placeholder.text || options.placeholder.text
                }).on('change', function() {
                    var id = $(select.ele).val();
                    var result = [];
                    getDataByLevel(options.data, index, id, result,options);
                    if (result.length > 0) {
                        result = result[0][options.itemsMapping];
                    }
                    var nextSelect = options.selects[index + 1];
                    if (nextSelect) {
                        $(nextSelect.ele).select2('val', '');
                        $(nextSelect.ele).find('option').remove();
                        $(nextSelect.ele).select2({
                            data: result,
                            language: "zh-CN",
                            placeholder: nextSelect.placeholer && nextSelect.placeholder.text || options.placeholder.text//"--请选择--"
                        });
                        for (var i = index + 2; i < options.selects.length; i++) {//清空后面所有的select2的内容
                            $(options.selects[i].ele).select2('val', '');
                            $(options.selects[i].ele).find('option').remove();
                            //$(nextSelect.ele).trigger('change');
                        }
                    }
                });
            });
        }
    };
}(jQuery);
