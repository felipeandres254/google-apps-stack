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
