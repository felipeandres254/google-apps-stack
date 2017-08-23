// ==================================================
//  SCHEDULE FUNCTIONS
// ==================================================
Schedule = {"tasks_":[]};

/**
 * Create a new Task without enabling
 * 
 * @param {string} name The Task name
 * @param {function} task The Task to run
 * @return {Task_} The Task object
 */
Schedule.task = function( name, task ) {
	return new Task_( name, task );
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
	
	var date = new Date;
	date.setMilliseconds(0); date.setSeconds(0); date.setMinutes(0);
	if( Schedule.tasks_.length>0 )
		File.write("logs/schedule.log", "[" + date.toString() + "] Running scheduled tasks", true);
	
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
		
		try {
			date = new Date;
			File.write("logs/schedule.log", "[" + date.toString() + "] Running task '" + task.name + "'", true);
			task.run();
			date = new Date;
			File.write("logs/schedule.log", "[" + date.toString() + "] Finishing task '" + task.name + "'", true);
		} catch( error ) {
			error = error.name + " " + error.message + " " + JSON.stringify(error, null, 2);
			date = new Date;
			File.write("logs/schedule.log", "[" + date.toString() + "] Error on task '" + task.name + "'! See error.log for details", true);
			File.write("logs/error.log", "[" + date.toString() + "] Error on task '" + task.name + "'\n" + error, true);
		}
	});
	
	if( Schedule.tasks_.length>0 )
		File.write("logs/schedule.log", "[" + date.toString() + "] Closing schedule", true);
};
