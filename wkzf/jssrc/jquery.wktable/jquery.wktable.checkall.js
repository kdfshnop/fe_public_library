/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. 插件名称：jquery.wktable.checkall
2. 插件描述：悟空找房异步数据表格
3. 版本：1.0
4.  对其他插件的依赖：jQuery,jQuery.wktable
5. 备注：
    这个插件是基于wktable的，它假设table中每行只有一个check（使用icon-18）
6. 未尽事宜：
7. 作者：唐旭阳(tangxuyang@lifang.com)
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
+ function($) {
    //判断全选状态
    function calculateCheckAll($table) {
        var checkbox = $table.find('tbody .icon-18:not(.icon-18-check-disabled)'),
            uncheckedbox = $table.find('tbody .icon-18-unchecked');
        if (checkbox.length > 0 && uncheckedbox.length === 0) {
            $table.find('thead .icon-18').removeClass('icon-18-unchecked');
        } else {
            $table.find('thead .icon-18').addClass('icon-18-unchecked');
        }
    }
    $.fn.setCheckAll = function(options) {

        return this.each(function() {
            var wktable = $(this).data('wk.table');
            if (wktable) {
                var self = wktable;
                //选中
                wktable.$table.on('click', 'tbody tr', function(e) {                    
                    var $target = $(e.target);
                    if($target.is('button') || $target.is('a')){//点击的是tr中a或button，不影响该行的选中状态
                        return;
                    }
                    var icon = $(this).find('.icon-18');
                    if(icon.hasClass('icon-18-check-disabled')){
                        return;
                    }
                    if (icon.hasClass('icon-18-unchecked')) {//选中
                        icon.removeClass('icon-18-unchecked');
                        $(this).addClass('selected');
                    } else {//取消选中
                        icon.addClass('icon-18-unchecked');
                        $(this).removeClass('selected');
                    }

                    calculateCheckAll(self.$table);

                    //cb&&cb();
                });

                //全选
                wktable.$table.on('click', 'thead .icon-18', function() {
                    var $this = $(this);
                    if ($this.hasClass('icon-18-unchecked')) {//选中
                        $this.removeClass('icon-18-unchecked');
                        self.$table.find('tbody .icon-18:not(.icon-18-check-disabled)').removeClass('icon-18-unchecked').parents().addClass('selected');
                        //self.$table.find('tbody tr').addClass('selected');
                    } else {//取消选中
                        $this.addClass('icon-18-unchecked');
                        self.$table.find('tbody .icon-18:not(.icon-18-check-disabled)').addClass('icon-18-unchecked').parents().removeClass('selected');
                        //self.$table.find('tbody tr').removeClass('selected');
                    }

                    //cb&&cb();
                });

                if(wktable.options.ready){
                    var originalReady = wktable.options.ready;
                    wktable.options.ready = function(){
                        wktable.$table.find('thead .icon-18').addClass('icon-18-unchecked');
                        originalReady.call(wktable,arguments);
                    }
                }else{
                    wktable.options.ready = function(){
                        wktable.$table.find('thead .icon-18').addClass('icon-18-unchecked');
                    }
                }
            }
        });
    };

    //获取选中的tr
    $.fn.getCheckedItems = function(){
        var wktable = $(this).data('wk.table');
        if(wktable){
            var trs = [];
            wktable.$table.find('tbody .icon-18:not(.icon-18-unchecked):not(.icon-18-check-disabled)').closest('tr').each(function(index,ele){
                trs.push(ele);
            });

            return trs;
        }

        return null;
    }
}(jQuery);