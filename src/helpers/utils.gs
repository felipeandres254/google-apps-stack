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
 * Send an email from the Script owner account
 * 
 * @param {object} data The email data, as described in https://developers.google.com/apps-script/reference/mail/mail-app
 * @param {object=} data.inner_style The header and inline CSS for the body container
 */
Utils.mail = function( data ) {
	var html = "https://gist.githubusercontent.com/felipeandres254/ab38b94ad462f46d57d9cdfa196591a0/raw/43ada4290be7c8ce908f980d38ffcace552f002c/email.html";
	html = UrlFetchApp.fetch(html).getContentText();
	
	if( data.inner_style ) {
		Object.keys(data.inner_style).forEach(function(style) {
			html = html.replace(".inner { ", ".inner { " + style.header);
			html = html.replace("inner contents\" style=\"", "inner contents\" style=\"" + style.inline);
		});
		delete data.inner_style;
	}
	data.htmlBody = html.replace("<!-- EMAIL_BODY -->", data.htmlBody);
	MailApp.sendEmail( data );
};
