// ==================================================
//  ROUTE FUNCTIONS
// ==================================================
Route = {"get_":[], "post_":[]};

Route.get = function( pattern, action ) { Route.get_.push({"pattern":(new RegExp("^" + pattern + "$")), "action":action}); };
Route.post = function( pattern, action ) { Route.post_.push({"pattern":(new RegExp("^" + pattern + "$")), "action":action}); };
Route.serve = function( request ) {
	var response;
	if( !request.pathInfo )
		request.pathInfo = "index.html";
	
	try {
		response = Utils.template(request.pathInfo);
	} catch( error ) {
		return ContentService.createTextOutput("404").setMimeType(ContentService.MimeType.TEXT);
	}
	switch(request.pathInfo.split(".").slice(-1)[0]) {
		case "html":
			response = HtmlService.createTemplate(response).evaluate().getContent();
			return HtmlService.createHtmlOutput(response); break;
		case "js":
			return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.JAVASCRIPT); break;
		case "css": break;
		default: break;
	}
	return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.TEXT);
};

Route.match = function( request ) {
	var response = {"success":false, "status":404};
	var routes = request.contentLength==-1 ? Route.get_ : Route.post_;
	routes.some(function(route) {
		if( route.pattern.test(request.pathInfo) ) {
			try {
				response = route.action(request);
			} catch( error ) {
				response.status = 500;
				response.error = JSON.parse(JSON.stringify(error));
			}
			return true;
		}
	});
	return response;
};
