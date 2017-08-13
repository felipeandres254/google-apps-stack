// ==================================================
//  ROUTE FUNCTIONS
// ==================================================
Route = {"get_":[], "post_":[]};

/**
 * Add a new GET route
 * 
 * @param {string} pattern The RegExp pattern to match the path
 * @param {function} action The callback to run when the pattern matches
 */
Route.get = function( pattern, action ) {
	Route.get_.push({
		"pattern":(new RegExp("^" + pattern + "$")),
		"action":action
	});
};

/**
 * Add a new POST route
 * 
 * @param {string} pattern The RegExp pattern to match the path
 * @param {function} action The callback to run when the pattern matches
 */
Route.post = function( pattern, action ) {
	Route.post_.push({
		"pattern":(new RegExp("^" + pattern + "$")),
		"action":action
	});
};

/**
 * Serve a GET request from the Drive filesystem
 * 
 * @param {object} request The request data when using doGet
 * @return {HtmlOutput|TextOutput} The served response
 */
Route.serve = function( request ) {
	var response;
	if( !request.pathInfo )
		request.pathInfo = "index.html";
	request.pathInfo = "templates/" + request.pathInfo;
	
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

/**
 * Match a GET or POST request
 * 
 * @param {object} request The request data
 * @return {*} The evaluated response
 */
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
