// ==================================================
//  SCHEDULE TASK
// ==================================================
/**
 * Define a Task for the Schedule
 * 
 * @constructor
 * @param {string} name, The Task name
 * @param {function} task The Task to run
 */
function Task_( name, task ) {
	this.name = name;
	this.run = task;
}

/**
 * Configure and enable a Task with cron syntax
 * 
 * @param {string|number} hour The Task hour
 * @param {string|number} date The Task day of month
 * @param {string|number} month The Task month
 * @param {string|number} weekday The Task weekday
 * @throws {TaskError} If cron parameters are invalid
 */
Task_.prototype.cron = function( hour, date, month, weekday ) {
	if( typeof hour === "string" && hour!=="*" )
		throw new TaskError;
	if( parseInt(hour, 10)===hour && (hour<0 || hour>23) )
		throw new TaskError;
	if( typeof date === "string" && date!=="*" )
		throw new TaskError;
	if( parseInt(date, 10)===date && (date<1 || date>31) )
		throw new TaskError;
	if( typeof month === "string" && month!=="*" )
		throw new TaskError;
	if( parseInt(month, 10)===month && (month<1 || month>12) )
		throw new TaskError;
	if( typeof weekday === "string" && weekday!=="*" )
		throw new TaskError;
	if( parseInt(weekday, 10)===weekday && (weekday<1|| weekday>7) )
		throw new TaskError;
	
	this.hour = hour;
	this.date = date;
	this.month = month;
	this.weekday = weekday;
	Schedule.tasks_.push( this );
};

// ==================================================
//  TASK ERRORS
// ==================================================
TaskError = function() {
	this.name  = "TaskError";
	this.stack = (new Error).stack;
};
TaskError.prototype = Object.create(Error.prototype);
TaskError.prototype.constructor = TaskError;
