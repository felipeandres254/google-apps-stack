// ==================================================
//  TABLE FUNCTIONS
// ==================================================
/**
 * Define the Table constructor
 * @param table     - The Table name
 * @property sheet     - The sheet representing the Table
 * @property fields    - The Table fields
 * @property $DATA     - The Table data
 * @property data      - The current query data
 * @throws TableCreateError, if the table is not defined
 */
function Table( table ) {
	if( !table || (typeof table !== "string") )
		throw new TableCreateError;
	
	// Create or get, and format sheet
	if( $SHEET.getSheetByName( table )===null ) {
		this.sheet = $SHEET.insertSheet( table );
		this.sheet.deleteRows(2, this.sheet.getMaxRows()-2);
		this.sheet.deleteColumns(2, this.sheet.getMaxColumns()-1);
		this.sheet.setRowHeight(1, 25).setRowHeight(2, 25).setColumnWidth(1, 150);
		
		this.sheet.getRange(1, 1, 1, this.sheet.getMaxColumns()).setFontWeight("bold");
		this.sheet.getRange(1, 1, 2, this.sheet.getMaxColumns()).setHorizontalAlignment("left").setVerticalAlignment("middle").setNumberFormat("@");
		this.sheet.setFrozenRows(1);
	}
	this.sheet = $SHEET.getSheetByName( table );
}

// ==================================================
//  TABLE ERRORS
// ==================================================
function TableCreateError() {
	this.name     = "TableCreateError";
	this.message  = "Table parameters are invalid";
	this.stack    = (new Error).stack;
}
TableCreateError.prototype = Object.create(Error.prototype);
TableCreateError.prototype.constructor = TableCreateError;

function TableExistsError( table ) {
	this.name     = "TableExistsError";
	this.table    = table;
	this.message  = "The table '" + table + "' already exists";
	this.stack    = (new Error).stack;
}
TableExistsError.prototype = Object.create(Error.prototype);
TableExistsError.prototype.constructor = TableExistsError;

function TableNotFoundError( table ) {
	this.name     = "TableNotFoundError";
	this.table    = table;
	this.message  = "The table '" + table + "' does not exist";
	this.stack    = (new Error).stack;
}
TableNotFoundError.prototype = Object.create(Error.prototype);
TableNotFoundError.prototype.constructor = TableNotFoundError;

function TableIntegrityError( message ) {
	this.name     = "TableIntegrityError";
	this.message  = message;
	this.stack    = (new Error).stack;
}
TableIntegrityError.prototype = Object.create(Error.prototype);
TableIntegrityError.prototype.constructor = TableIntegrityError;
