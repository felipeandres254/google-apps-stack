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
Utils.template( route ) {
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
}
