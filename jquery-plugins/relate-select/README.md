# jquery 插件 relateSelect 级联下拉框 
---	

relateSelect 是链式级联；即：上一个下拉会触发下一个下拉变更回调。

## Use
```
	$('#city').relateSelect(function(val){
			var that = this;
	loadData('http://10.0.18.192:8133/bzsm/areaorg/getCityListByUserId.action',{},function(res){
                      renderOption.call(that,res);
                  });
              })
```
这样就初始化了第一个级联的下拉，当初始化之后会执行回调，这个回调可以做一系列初始化操作。

如果要关联下一个下拉怎么处理？

```
	$('#city').relateSelect(function(val){
			var that = this;
			loadData('http://10.0.18.192:8133/bzsm/areaorg/getCityListByUserId.action',{},function(res){
				renderOption.call(that,res);
			});
		}).add('#area',function(val){
			var that = this;
			cityId = val;
			loadData('http://10.0.18.192:8133/bzsm/areaorg/getPartnerByCityId.action',{
				cityId:val
			},function(res){
				renderOption.call(that,res);
			});	
		});
```
如果需要再次关联更多的下拉只需通过add追加即可，前者下拉变更就会促发下一次绑定的事件回调。

基于上面的area下拉继续绑定两个方式
第一种：这里调用relateSelect不需要传递回调方法，及时传递也不会执行，初始化方法只会执行一次
```
	$('#city').relateSelect().add('#store',function(val){
			var that = this;
			storeId = val;
			loadData('http://10.0.18.192:8133/bzsm/areaorg/deptListByPartnerId.action',{
				cityId:cityId,
				partnerId:val
			},function(res){
				renderOption.call(that,res);
			});	
		})
```
第二种：
```
$('#area').relateSelect().add('#store',function(val){
			var that = this;
			storeId = val;
			loadData('http://10.0.18.192:8133/bzsm/areaorg/deptListByPartnerId.action',{
				cityId:cityId,
				partnerId:val
			},function(res){
				renderOption.call(that,res);
			});	
		})
```
总上代码可以得出追加下拉，可以在第一个节点后追加，原最后一个变更新添加的也会变更，也可以在需要绑定的的对象上追加。


