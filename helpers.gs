// ==================================================
//  HELPER FUNCTIONS
// ==================================================
/**
 * Check if Object is an Array
 * @return TRUE, if value is an Array. Otherwise, FALSE.
 */
Object.prototype.isArray = function() {
	return !!this && typeof this==="object" && this!==null && this instanceof Array;
};

/**
 * Check if Object is a Literal object
 * @return TRUE, if value is a Literal object. Otherwise, FALSE.
 */
Object.prototype.isObject = function() {
	return !!this && typeof this==="object" && this!==null && !(this instanceof Array) && !(this instanceof Date);
};
