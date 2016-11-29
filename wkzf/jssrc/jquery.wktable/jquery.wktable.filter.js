/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. 插件名称：jquery.wktable.filter
2. 插件描述：悟空找房异步数据表格
3. 版本：1.0
4.  对其他插件的依赖：jQuery,jQuery.wktable
5. 备注：
    这个插件是基于wktable的
    当前支持两种筛选：
    a)下拉(CheckboxFilter)
    	收集列中的文本，构建一个下拉框
    b)文本(TextFilter)
    	输入文本，筛选该列是否包含输入文本
    扩展：
    可以仿照CheckboxFilter和TextFilter。只要提供doFilter方法就可以了。同时要修改FilterContainer让其可以识别新的Filter
6. 未尽事宜：
7. 作者：唐旭阳(tangxuyang@lifang.com)
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*
{
	filters:[{
		index:1,
		type:'checkbox'
	},{
		index:2,
		type:'text'
	}]

}
*/

+ function($) {
    function FilterContainer(table, params) {  
    	this.table = table;
    	this.params = params;  	
        this.init();
    }
	FilterContainer.prototype.init = function(){
		var table = this.table;
		this.wktable = $(table).data('wk.table');   
		if(!this.wktable){
			return;
		}
        if(this.wktable.filterContainer){
        	return;
        }
        this.wktable.filterContainer = this;
        //this.table = table;
        var self = this;
        var $trs = this.wktable.$thead.find('tr');
        var $tr = $($trs.length == 2 ? $trs[1] : $trs[0]); //最多支持两级列头合并
        this.$tr = $tr;
        //this.params = params;
        this.filters = [];
        
        var self = this;

        var originalReady = this.wktable.options.ready;

        if (originalReady) {
            this.wktable.options.ready = function() {
                originalReady.call(self.wktable, arguments);
                self.createFilters();                
            }
        } else {
            this.wktable.options.ready = function() {
            	self.createFilters();                
            };
        }

        if(this.wktable.isReady){
        	self.createFilters();
        }
	}    
    FilterContainer.prototype.doFilter = function() {
        var wktable = this.wktable;
        var trs = [];
        wktable.$tbody.find('tr').hide().each(function(tr) {
            trs.push(this);
        });

        this.filters.forEach(function(filter) {
            trs = filter.doFilter(trs);
        });        

        trs.forEach(function(tr) {
            $(tr).show();
        });
    }
    FilterContainer.prototype.createFilters = function(){
    	var self = this;
    	var params = this.params;
    	//this.filters = [];
    	if(this.filters && this.filters.length > 0){
    		this.filters.forEach(function(f){
    			if(f.rebuild){
    				f.rebuild();
    			}
    		});
    	}else{
	    	if (params && params.filters) {
	    		this.filters = [];
	            params.filters.forEach(function(filter) {
	                if (filter.index == undefined) {
	                    return;
	                }
	                self.filters.push(self.createFilter(filter));
	            });

	            $('body').click(function(){self.hideAllFilter();});
	        }
    	}
    };
    FilterContainer.prototype.createFilter = function(filter) {
    	var mapping = $.extend({},defaults.mapping,this.params.mapping);
    	var f = mapping[filter.type||'default'];
    	eval("var result = new "+f+"(this,filter);");
    	return result;
        /*switch (filter.type||"") {
            case "text":
                return new TextFilter(this, filter);
                break;
            case "checkbox":
            default:
                return new CheckboxFilter(this, filter);
                break;
            
        }*/
    }
    FilterContainer.prototype.hideAllFilter = function() {

        $(this.table).find('.wktable-filter-checkbox').hide();
        $(this.table).find('.wktable-filter-select').hide();
    };

    function CheckboxFilter(container, filter) {
        this.container = container;
        this.filter = filter;
        this.$el = container.$tr.find('th:eq(' + filter.index + ')');
        this.init();
        this.bindEvent();
    }

    CheckboxFilter.prototype.init = function() {
        var $th = this.$el;
        $th.addClass('wktable-th');
        $th.find('.wktable-filter-checkbox').remove();
        $th.find('.wktable-filter-icon').remove();
        $th.data('filter', this);
        var $tds = this.container.wktable.$tbody.find('tr td:nth-child(' + (this.filter.index + 1) + ')');
        var objs = {};
        $tds.each(function() {
            objs[$(this).text()] = "";
        });

        var str = "<ul class='wktable-filter-checkbox'>";
        for (var v in objs) {
            str += "<li><label><input type='checkbox' checked='checked' value='" + v + "'>" + v + "</label></li>";
        }
        str += "</ul>";

        $th.append("<span class='wktable-filter-icon glyphicon glyphicon-filter'></span>");
        $th.append(str);
    };

    CheckboxFilter.prototype.bindEvent = function() {
        var $th = this.$el;
        var self = this;
        $th.find('.wktable-filter-checkbox').click(function(e) {
            e.stopPropagation();
        });
        $th.find('.wktable-filter-icon').click(function(e) {
            e.stopPropagation();
            self.container.hideAllFilter();
            
            $th.find('.wktable-filter-checkbox').css({ "left": e.x, "top": e.y + 5 }).toggle();
        });
        $th.find('.wktable-filter-checkbox :checkbox').click(function() {
            self.container.doFilter();
        });
    };

    CheckboxFilter.prototype.doFilter = function(trs) {
    	var $th = this.$el;
    	var result = [];
        var tokens = $th.find(':checked').map(function() {
            return this.value;
        });
        var self = this;
        if (trs && trs.length > 0 && tokens && tokens.length > 0) {
            trs.forEach(function(tr) {
                var text = $(tr).find('td:eq(' + self.filter.index + ')').text();
                tokens.each(function(ind, t) {
                    if (text == t) {
                        result.push(tr);
                    }
                });
            });
        }

        return result;
    };

    CheckboxFilter.prototype.rebuild = function(){
    	this.init();
    	this.bindEvent();
    };

    function TextFilter(container,filter) {
 		this.container = container;
        this.filter = filter;
        this.$el = container.$tr.find('th:eq(' + filter.index + ')');
        this.init();
        this.bindEvent();
    } 

    TextFilter.prototype.init = function(){
    	var $th = this.$el;
    	$th.find('.wktable-filter-icon').remove();
        $th.append("<span class='wktable-filter-icon glyphicon glyphicon-filter'></span>");
    };  

    TextFilter.prototype.bindEvent = function(){
    	var $th = this.$el;
        var self = this;
        $th.find('.wktable-filter-icon').click(function(e) {
            e.stopPropagation();
            self.container.hideAllFilter();
            var v = prompt("关键字",self.text||'');
            //if(v){
        	
        	self.text = v;
        	self.container.doFilter();
            //}
        });
    } ;

    TextFilter.prototype.doFilter = function(trs){
    	var $th = this.$el;
    	var result = [];
        
        var self = this;
        if (trs && trs.length > 0) {
            trs.forEach(function(tr) {
                var text = $(tr).find('td:eq(' + self.filter.index + ')').text();
                
                if (!self.text) {
                    result.push(tr);
                }else if(text.indexOf(self.text) > -1){
                	result.push(tr);
                }
            });
        }

        return result;
    }

    TextFilter.prototype.rebuild = function(){
    	this.text = '';
    };

    function SelectFilter(container, filter){
    	this.container = container;
        this.filter = filter;
        this.$el = container.$tr.find('th:eq(' + filter.index + ')');
        this.init();
        this.bindEvent();
    }

    SelectFilter.prototype.init = function(){
    	var selects = this.filter.selects;
    	var $th = this.$el;
        $th.addClass('wktable-th');
        $th.find('.wktable-filter-select').remove();
        $th.find('.wktable-filter-icon').remove();
        $th.data('filter', this);      

        var str = "<ul class='wktable-filter-select'>";
        for (var v in selects) {
            str += "<li><label><input type='checkbox' checked='checked' value='" + selects[v].value + "'>" + selects[v].text + "</label></li>";
        }
        str += "</ul>";

        $th.append("<span class='wktable-filter-icon glyphicon glyphicon-filter'></span>");
        $th.append(str);
    };

    SelectFilter.prototype.bindEvent = function(){
    	var $th = this.$el;
        var self = this;
        $th.find('.wktable-filter-select').click(function(e) {
            e.stopPropagation();
        });
        $th.find('.wktable-filter-icon').click(function(e) {
            e.stopPropagation();
            self.container.hideAllFilter();
            
            $th.find('.wktable-filter-select').css({ "left": e.x, "top": e.y + 5 }).toggle();
        });
        $th.find('.wktable-filter-select :checkbox').click(function() {
            self.privateFilter();
        });
    };

    SelectFilter.prototype.doFilter = function(trs){
    	return trs;
    }

    SelectFilter.prototype.rebuild = function(){
    	//do nothing
    };

    SelectFilter.prototype.privateFilter = function(){
    	var paramName= this.filter.paramName;
    	var obj = {};
    	var $th = this.$el;
    	var checkedItems = $th.find(':checked');
    	var values = [];   	
    	console.log(checkedItems);
    	checkedItems.each(function(index,item){
    		values.push(item.value);
    	});
    	console.log(values);
    	obj[paramName] = values;
    	$(this.container.table).wktable('search',{
    		gender:values
    	});
    };



    $.fn.setFilter = function(params) {
        return this.each(function() {
            new FilterContainer(this,params);
        });
    };

    var defaults = {
    	filters:[],
    	mapping:{
    		text:"TextFilter",
    		checkbox:"CheckboxFilter",
    		default:"CheckboxFilter"
    	}
    };
}(jQuery);
