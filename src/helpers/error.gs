// ==================================================
//  GENERAL ERRORS
// ==================================================
FileNotFoundError = function() {
	this.name    = "FileNotFoundError";
	this.stack   = (new Error).stack;
};
FileNotFoundError.prototype = Object.create(Error.prototype);
FileNotFoundError.prototype.constructor = FileNotFoundError;
