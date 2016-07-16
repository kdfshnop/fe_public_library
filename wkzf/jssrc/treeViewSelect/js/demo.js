	$(function() {
	    $('#area').treeViewSelect({
	        sourceUrl: 'http://dev01.fe.wkzf/fe_public_library/bootstrap/plugins/bootstrap-treeview/src/js/bootstrap-treeview.js',
	        apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/data/3.json',
	        dataType: 'json',
	        bootstrapTreeParams: {
	            multiSelect: true
	        }
	    });

	    $('#area2').treeViewSelect({
	        sourceUrl: 'http://dev01.fe.wkzf/fe_public_library/bootstrap/plugins/bootstrap-treeview/src/js/bootstrap-treeview.js',
	        apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/simpleTreeView/data/city.json',
	        dataType: 'json',
	        bootstrapTreeParams: {
	            multiSelect: true
	        }
	    });


	    $('#btnTest').on('click', function() {
	        $('#area').treeViewSelect({
	            sourceUrl: 'http://dev01.fe.wkzf/fe_public_library/bootstrap/plugins/bootstrap-treeview/src/js/bootstrap-treeview.js',
	            apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/data/city.json',
	            dataType: 'json'
	        });
	    });

	    $('#area').on('completed', function(eventType, node) {
	        console.log('completed');
	    });
	});
