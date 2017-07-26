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
	if( SPREADSHEET.getSheetByName( table )!==null )
		throw new TableExistsError( table );
	
	// Create a new Table
	fields( new Table_(table) );
};

/**
 * Drop a Database Table
 * 
 * @param {string} table The Table name
 * @throws {TableNotFoundError} If the Table does not exists
 */
Database.drop = function( table ) {
	// Check if Table exists
	var sheet = SPREADSHEET.getSheetByName(table);
	if( !sheet )
		throw new TableNotFoundError( table );
	
	// Drop Table
	SPREADSHEET.deleteSheet( sheet );
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
	if( SPREADSHEET.getSheetByName( table )===null )
		throw new TableNotFoundError( table );
	
	return new Table_(table);
};
