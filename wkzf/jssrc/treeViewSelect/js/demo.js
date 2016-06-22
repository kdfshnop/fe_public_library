	$(function() {
	    $('#area').treeViewSelect({
	        sourceUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/lib/bootstrap-treeview.js',
	        apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/data/city.json',
	        dataType: 'json',
	        multiSelect:true
	    });

	    $('#btnTest').on('click', function() {
	        $('#area').treeViewSelect({
	            sourceUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/lib/bootstrap-treeview.js',
	            apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/data/city.json',
	            dataType: 'json'
	        });
	    });
	});
