	$(function() {
	    $('#area').treeViewSelect({
	        sourceUrl: 'http://dev01.fe.wkzf/fe_public_library/bootstrap/plugins/bootstrap-treeview/src/js/bootstrap-treeview.js',
	        apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/simpleTreeView/data/city.json',
	        dataType: 'json',
	        bootstrapTreeParams: {
	            multiSelect: false
	        }
	    });

	    $('#btnTest').on('click', function() {
	        $('#area').treeViewSelect({
	            sourceUrl: 'http://dev01.fe.wkzf/fe_public_library/bootstrap/plugins/bootstrap-treeview/src/js/bootstrap-treeview.js',
	            apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/data/city.json',
	            dataType: 'json'
	        });
	    });
	});
