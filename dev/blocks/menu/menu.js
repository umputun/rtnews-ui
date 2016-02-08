$(function() {
	$('#update-feeds').click(function(event) {
		event.preventDefault();

		$.ajax({
			url: APIPath + '/news/reload',
			type: 'PUT',
			headers: authHeaders
		})
		.done(function() {
			location.reload();
		})
		.fail(function(response) {
			console.log("error while updating feeds");
			console.log(response);
		});
	});

	$('#logout').click(function(event) {
		event.preventDefault();

		var request = new XMLHttpRequest();   

		request.open('PUT', APIPath + '/news/reload', false, 'harry', 'colloportus');                                                                                                                               
	    
	    try {
		    request.send();    
			    
	        if (request.readyState === 4) {  
				localStorage.removeItem('login');
				localStorage.removeItem('password');

				location.href = '/login/';
	        }  
	    } catch (err) {
	    	localStorage.removeItem('login');
			localStorage.removeItem('password');

			location.href = '/login/';
	    }
	});
});