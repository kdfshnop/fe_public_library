$(function(){
	$("#tree").simpleTreeView({
		apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/simpleTreeView/data/bigDataCity.json',
		dataType:'json',
		enableDownCascade:true,
		enableUpCascade:true,
		showSearch:true,
		bootstrapTreeParams:{
			color:'#4081d6',
			multiSelect:true
		}
	});

	$("#tree").on('nodeChecked',function(e,node){
		// console.log(node);
	});

	$("#tree").on('completed',function(e,node){
		console.log(node);
	});

	$('#btnSave').on('click',function(){
		var checkedNodes=$('#tree').simpleTreeView('getChecked');
		var realCheckedNodes=$('#tree').simpleTreeView('getRealChecked');
		console.log(checkedNodes);
		console.log(realCheckedNodes);
	});

});