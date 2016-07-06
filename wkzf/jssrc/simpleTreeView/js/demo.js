$(function(){
	$("#tree").simpleTreeView({
		sourceUrl: 'http://dev01.fe.wkzf/fe_public_library/bootstrap/plugins/bootstrap-treeview/src/js/bootstrap-treeview.js',
		apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/simpleTreeView/data/city.json',
		dataType:'json',
		stateSynch:true,
		showSearch:true,
		bootstrapTreeParams:{
			color:'#4081d6'
		}
	});

	$("#tree").on('nodeChecked',function(e,node){
		console.log(node);
	});

	$('#btnSave').on('click',function(){
		var checkedNodes=$('#tree').simpleTreeView('getChecked');
		var realCheckedNodes=$('#tree').simpleTreeView('getRealChecked');
		console.log(checkedNodes);
		console.log(realCheckedNodes);
	});

});