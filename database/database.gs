// ==================================================
//  PARENT SPREADSHEET
// ==================================================
var $SHEET = SpreadsheetApp.getActiveSpreadsheet();

// ==================================================
//  DATABASE FUNCTIONS
// ==================================================
/**
 * Define the Database wrapper
 */
function Database() {}

/**
 * Create a new Database Table
 * @param table     - The Table name
 * @param fields    - The closure for Table fields
 * @return The Database object
 * @throws DatabaseTableError, if the parameters are not defined
 * @throws TableExistsError, if the table exists
 */
Database.create = function( table, fields ) {
	if( !table || (typeof table !== "string") )
		throw new TableCreateError;
	if( !fields || (typeof fields !== "function") )
		throw new TableCreateError;
	
	// Set Table from name
	if( $SHEET.getSheetByName( table )!==null )
		throw new TableExistsError( table );
	
	// Create a new table
	table = new Table( table );
	fields( table );
};

/**
 * Drop a Database Table
 * @param table     - The Table name
 * @throws TableNotFoundError, if the Table doesn't exists
 */
Database.drop = function( table ) {
	var sheet = $SHEET.getSheetByName(table);
	if( !sheet )
		throw new TableNotFoundError( table );
	
	$SHEET.deleteSheet( sheet );
};

/**
 * Get or update Database Table
 * @param table     - The Table name
 * @param fields    - The closure for Table fields
 * @throws TableIntegrityError, if the parameters are not defined
 */
Database.table = function( table, fields ) {
 if( !table || (typeof table !== "string") )
	throw new TableIntegrityError( "Table parameters are invalid" );
	
	var table = new Table(table);
	
	// Update table fields
	if( fields && (typeof fields === "function") )
		fields(table);
	
	return table;
};
