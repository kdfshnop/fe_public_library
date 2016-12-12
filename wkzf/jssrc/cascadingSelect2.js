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
    function getDataByLevel(data, level, id, result,options) {
        if (level === 0) {
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == id) {
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
        options.itemsMapping = options.itemsMapping || "items";
        if (!options.data) {
            $.each(options.selects, function(index, select) { //遍历配置中的selects
                var dataValue = $(select.ele).data('value');
                if( dataValue !== undefined){
                    select.initial = dataValue;
                }
                var localOption = {};                    
                if (options.dynamic) {
                    localOption = {
                        minimumInputLength: select.minimumInput || 1,
                        ajax: {
                            url: function(params) {
                                var url = select.url;
                                var parentSelect = options.selects[index - 1];
                                if (index > 0) { //非第一个select
                                    if (parentSelect.value === undefined || parentSelect.value === null || parentSelect.value === '') { //如果前一个select的value不为空，把它作为url的一部分
                                        url = select.url;
                                    } else {
                                        url += "?" + options.selects[index - 1].paramNameForNext + "=" + options.selects[index - 1].value;
                                    }
                                }

                                return url;
                            },
                            dataType: select.dataType || 'json',
                            delay: select.delay || 250,
                            data: select.data && typeof select.data === 'function' || function(params) {
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
                        placeholder: "--请选择--",
                    };

                    $(select.ele).select2(localOption);
                } else {
                    if (index == 0) { //第一个select
                        $.ajax({
                            url: select.url,
                            data: select.data,
                            success: function(data) {
                                data = select.processResults && select.processResults(data) || data;
                                var $ele = $(select.ele);
                                $.each(data,function(j, item) {
                                    $ele.append("<option value='" + item.id + "' "+(select.initial == item.id?"selected":"")+">" + item.text + "</option>");
                                });
                                $(select.ele).select2({
                                    language:"zh-CN",
                                });

                                delete select.initial;
                                select.ready && select.ready();
                            }
                        });
                    } else {
                        $(select.ele).select2({
                            language:"zh-CN",
                        });
                    }
                }

                $(select.ele).on('change', function() {
                    var val = $(select.ele).val();
                    var placeholderVal = select.placeholder && select.placeholder.id;
                    select.value = val;
                    for (var i = index + 1; i < options.selects.length; i++) {
                        options.selects[i].value = null;
                        $(options.selects[i].ele).find('option').remove();
                        $(options.selects[i].ele).select2({
                            language:"zh-CN",
                            //data:select.placeholder
                            placeholder:select.placeholder
                        });
                    }

                    if (!options.dynamic) {
                        var nextSelect = options.selects[index + 1];
                        if (nextSelect && val != placeholderVal) {
                            var url = nextSelect.url;

                            if (select.value === undefined || select.value === null || select.value === '') { //如果当前select的value不为空，把它作为url的一部分
                                url = nextSelect.url;
                            } else {
                                url += "?" + select.paramNameForNext + "=" + select.value;
                            }

                            $.ajax({
                                url: url,
                                success: function(data) {                                    
                                    data = nextSelect.processResults && nextSelect.processResults(data) || data;
                                    var $ele = $(nextSelect.ele);
                                    $.each(data,function(j, item) {
                                        $ele.append("<option value='" + item.id + "' "+(nextSelect.initial == item.id?"selected":"")+">" + item.text + "</option>");
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

                    if (select.value != null && select.value != "" && select.value != "-1") {
                        select.selected && select.selected();
                    }
                });
            });

            
        } else { //本地数据
            $.each(options.selects, function(index, select) {
                $(select.ele).select2({
                    data: index === 0 && options.data || null,
                    language: "zh-CN",
                    placeholder: "--请选择--"
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
                            placeholder: "--请选择--"
                        });
                        for (var i = index + 2; i < options.selects.length; i++) {
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
