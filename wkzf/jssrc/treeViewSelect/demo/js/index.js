	$(function() {
	    $('#area').treeViewSelect({
	        apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/demo/data/3.json',
	        dataType: 'json',
	        cascadeText:true,
	        bootstrapTreeParams: {
	            multiSelect: true,
	            enableCascade:false
	        },
	        successCallback:function(nodes){
	        	console.log(nodes);
	        }
	    });



	    // $('#area2').treeViewSelect({
	    //     apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/simpleTreeView/data/city.json',
	    //     dataType: 'json',
	    //     bootstrapTreeParams: {
	    //         multiSelect: false
	    //     }
	    // });


	    $('#btnTest').on('click', function() {
	        // $('#area').treeViewSelect({
	        //     sourceUrl: 'http://dev01.fe.wkzf/fe_public_library/bootstrap/plugins/bootstrap-treeview/src/js/bootstrap-treeview.js',
	        //     apiUrl: 'http://dev01.fe.wkzf/fe_public_library/wkzf/jssrc/treeViewSelect/data/city.json',
	        //     dataType: 'json'
	        // });
	        $('#area').treeViewSelect('setDefaults',['2']);
	    });

	    $('#btnCheckNodes').on('click',function(){
	    	$('#area').treeViewSelect('checkNodes',['2adadad']);
	    })

	    $('#area').on('completed', function(eventType, node) {
	        // console.log('itemsRendered');

	        console.log(node);
	        
	        // window.location.reload();
	    });
	});
