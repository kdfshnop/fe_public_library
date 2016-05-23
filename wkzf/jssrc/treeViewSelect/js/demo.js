	$(function() {
	    $('#area').treeViewSelect({
	        sourceUrl: 'http://dev.02.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/lib/bootstrap-treeview.js',
	        apiUrl: 'http://dev.02.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/data/city.json',
	        dataType: 'json',
	        updateNodes: function(e, data) {
	            console.log(e);
	        }
	    });

	    $('#btnTest').on('click', function() {
	        $('#area').treeViewSelect({
	            sourceUrl: 'http://dev.02.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/lib/bootstrap-treeview.js',
	            apiUrl: 'http://dev.02.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/data/city.json',
	            dataType: 'json',
	            updateNodes: function(e, data) {
	                console.log('aaaaaaaaaaaa');
	            }
	        });
	    });
	});
