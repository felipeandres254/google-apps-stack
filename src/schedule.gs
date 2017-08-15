// ==================================================
//  SCHEDULE FUNCTIONS
// ==================================================
Schedule = {"tasks_":[]};

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
	
	// Run scheduled tasks
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
		if( !!(task.action && task.action.constructor && task.action.call && task.action.apply) )
			task.action();
	});
};
