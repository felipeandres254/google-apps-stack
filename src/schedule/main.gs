// ==================================================
//  SCHEDULE FUNCTIONS
// ==================================================
Schedule = {"tasks_":[]};

/**
 * Create a new Task without enabling
 * 
 * @param {function} task The task to run
 * @return {Task_} The Task object
 */
Schedule.task = function(task) {
	return new Task_(task);
};

/**
 * Reset the schedule trigger
 * 1. Remove all time-based triggers from project
 * 2. Set schedule trigger for the next hour
 */
Schedule.reset = function() {
	ScriptApp.getProjectTriggers().forEach(function(trigger) {
		if( trigger.getEventType()===ScriptApp.EventType.CLOCK )
			ScriptApp.deleteTrigger(trigger);
	});
	
	var date = new Date();
	date.setMilliseconds(0); date.setSeconds(0); date.setMinutes(0);
	date.setHours(date.getHours() + 1);
	ScriptApp.newTrigger("schedule").timeBased().at(date).create();
};

/**
 * Run the full schedule
 */
Schedule.run = function() {
	Schedule.reset();
	
	var date = new Date();
	date.setMilliseconds(0); date.setSeconds(0); date.setMinutes(0);
	Schedule.tasks_.forEach(function(task) {
		if( task.hour!=="*" && task.hour!==date.getHours() )
			return;
		if( task.date!=="*" && task.date!==date.getDate() )
			return;
		if( task.month!=="*" && task.month!==(date.getMonth()+1) )
			return;
		if( task.weekday!=="*" && task.weekday!==(date.getDay()+1) )
			return;
		if( !task.run || !task.run.constructor || !task.run.call || !task.run.apply )
			return;
		
		try { task.run(); }
		catch( error ) {}
	});
};
