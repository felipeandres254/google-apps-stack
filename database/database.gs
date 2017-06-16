// ==================================================
//  CONFIGURATION
// ==================================================
/**
 * Read configuration from Script Properties
 * @const {object}
 */
$CONFIG = PropertiesService.getScriptProperties().getProperties();
Object.keys($CONFIG).forEach(function(key) {
	key.split(".").forEach(function(part, idx) {
		if( !eval("$CONFIG." + key.split(".").splice(0, idx+1).join(".")) )
			eval("$CONFIG." + key.split(".").splice(0, idx+1).join(".") + " = {}")
	});
	eval("$CONFIG." + key + " = " + $CONFIG[key]); delete $CONFIG[key];
});

// ==================================================
//  GOOGLE DRIVE CONNECTIONS
// ==================================================
/** @const {Spreadsheet} **/
$SS = $CONFIG.database ? SpreadsheetApp.openById($CONFIG.database.main) : SpreadsheetApp.getActiveSpreadsheet();

/** @const {Folder} **/
$ROOT = DriveApp.getFileById(ScriptApp.getScriptId()).getParents().next();

// ==================================================
//  DATABASE FUNCTIONS
// ==================================================
Database = {};

/**
 * Create a Database Table
 * 
 * @param {string} table The Table name
 * @param {function} fields The closure of Table Fields
 * @throws {TableExistsError} If the Table exists already
 */
Database.create = function( table, fields ) {
	// Check if Table exists
	if( $SS.getSheetByName( table )!==null )
		throw new TableExistsError( table );
	
	// Create a new Table
	fields( new Table(table) );
};

/**
 * Drop a Database Table
 * 
 * @param {string} table The Table name
 * @throws {TableNotFoundError} If the Table does not exists
 */
Database.drop = function( table ) {
	// Check if Table exists
	var sheet = $SS.getSheetByName(table);
	if( !sheet )
		throw new TableNotFoundError( table );
	
	// Drop Table
	$SS.deleteSheet( sheet );
};

/**
 * Get a Database Table
 * 
 * @param {string} table The Table name
 * @return {Table} The Table object. Useful for chaining.
 * @throws {TableNotFoundError} If the Table does not exists
 */
Database.table = function( table ) {
	// Check if Table exists
	if( $SS.getSheetByName( table )===null )
		throw new TableNotFoundError( table );
	
	return new Table(table);
};
