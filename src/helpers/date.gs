// ==================================================
//  DATE HELPERS
// ==================================================
/**
 * Get week number of a Date
 * 
 * @return {number} The week number of the Date
 */
Date.prototype.getWeek = function() {
	var first = new Date(this.getFullYear(), 0, 1);
	var days = (this - first)/86400000;
	return Math.ceil((days + first.getDay() + 1)/7);
};
