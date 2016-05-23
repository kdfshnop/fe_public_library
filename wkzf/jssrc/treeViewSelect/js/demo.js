	$(function() {
	    $('#area').treeViewSelect({
	        sourceUrl: 'http://dev.02.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/lib/bootstrap-treeview.js',
	        apiUrl: 'http://dev.02.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/data/city.json',
	        dataType: 'json',
	        bootstrapTreeParams: {
	            levels: 3
	        }
	    });

	    // $('#btnTest').on('click', function() {
	    //     $('#area').treeViewSelect({
	    //         sourceUrl: 'http://dev.02.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/lib/bootstrap-treeview.js',
	    //         apiUrl: 'http://dev.02.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/data/city.json',
	    //         dataType: 'json',
	    //         updateNodes: function(e, data) {
	    //             console.log('aaaaaaaaaaaa');
	    //         }
	    //     });
	    // });

	    $('#area').on('nodeAllUnchecked', function(eventType, nodes) {

	        console.log('nodeAllUnchecked');
	    });

	    $('#area').on('nodeChecked', function(eventType, nodes) {
	        console.log('nodeChecked');
	    });

	    $('#area').on('nodeUnchecked', function(eventType, nodes) {
	        console.log('nodeUnchecked');
	    });



	});
