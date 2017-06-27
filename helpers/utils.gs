// ==================================================
//  UTILITIES FUNCTIONS
// ==================================================
Utils = {};

/**
 * Lock script function execution
 * 
 * @param {function} callable The function to lock
 * @param {object} params The function parameters
 * @return {*} The return value of the locked function
 * @throws {Error} If the callable function throws an error
 */
Utils.lock = function( callable, params ) {
	// Get the script lock
	var lock = LockService.getScriptLock();
	while( !lock.hasLock() ) lock.tryLock(1000);
	
	try {
		return callable( params );
	} catch( error ) {
		lock.releaseLock(); throw error;
	} finally {
		// Unlock the script
		if( lock.hasLock() ) lock.releaseLock();
	}
};

/**
 * Load and evaluate a template file from Google Drive
 * 
 * @param {string} route The route to the file, relative to the $ROOT folder
 * @return {string} The evaluated template
 */
Utils.template = function( route ) {
	var folder = DriveApp.getFolderById($ROOT.getId());
	route.split("/").slice(0, -1).forEach(function(f) {
		var folders = folder ? folder.getFoldersByName(f) : null;
		folder = folders && folders.hasNext() ? folders.next(): null;
	});
	if( !folder )
		return "";
	
	var files = folder.getFilesByName(route.split("/").slice(-1)[0]);
	if( !files.hasNext() )
		return "";
	return HtmlService.createTemplate(files.next().getBlob()).evaluate().getContent();
};

/**
 * Send an email from the Script owner account
 * 
 * @param {object} data The email data as described in https://developers.google.com/apps-script/reference/mail/mail-app
 * @param {object=} data.inner_style The header and inline CSS for the body container
 */
Utils.mail = function( data ) {
	// Load responsive email template
	var url  = "https://gist.githubusercontent.com/felipeandres254/ab38b94ad462f46d57d9cdfa196591a0/raw/43ada4290be7c8ce908f980d38ffcace552f002c/email.html";
	var html = UrlFetchApp.fetch(url).getContentText();
	
	if( data.inner_style ) {
		html = html.replace(".inner { ", ".inner { " + data.inner_style.header);
		html = html.replace("inner contents\" style=\"", "inner contents\" style=\"" + data.inner_style.inline);
		delete data.inner_style;
	}
	data.htmlBody = html.replace("<!-- EMAIL_BODY -->", data.htmlBody);
	MailApp.sendEmail( data );
};
