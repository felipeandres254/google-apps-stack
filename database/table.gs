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
	
	this.fields = {};
	this.$DATA  = [];
	this.data   = [];
}

/**
 * Get Table from name
 * @param table     - The Table name
 */
Table.get = function( table ) {
	return new Table(table);
}

/**
 * Add a new Field
 * @param name      - The Field name
 * @param tags      - The Field tags
 * @throws TableIntegrityError, if there is a Field with the same name
 */
Table.prototype.add_field = function( name, tags ) {
	var headers = this.sheet.getRange(1, 1, 1, this.sheet.getMaxColumns());
	headers.getValues()[0].forEach(function(value) {
		if( name==value )
			throw new TableIntegrityError("Field '" + name + "' exists already");
	});
	
	if( this.sheet.getRange(1, 1, 1, this.sheet.getMaxColumns()).getValues()[0][0]!="" )
		this.sheet.insertColumnAfter(this.sheet.getMaxColumns());
	var range = this.sheet.getRange(1, this.sheet.getMaxColumns(), 1, 1);
	range.setValues([[name]]).setNotes([[tags.join("\n")]]);
	
	// Create and return the Field
	this.fields[name] = {
		"name":name,
		"type":tags[0].split(",")[0],
		"length":tags[0].split(",").length>1 ? parseInt(tags[0].split(",")[1], 10) : null,
		"tags":tags.splice(1)
	};
	return this.fields[name];
};

/**
 * Add tag to the last Field
 * @param tag       - The tag to add
 */
Table.prototype.add_tag = function( tag ) {
	var headers = this.sheet.getRange(1, 1, 1, this.sheet.getMaxColumns());
	var idx = this.sheet.getMaxColumns()-1;
	if( idx==-1 )
		return;
	
	var tags = headers.getNotes()[0][idx].split("\n");
	if( tags.length==1 )
		tags.push( tag );
	else if( !(new RegExp(tag)).test(tags[tags.length-1]) )
		tags[tags.length-1] += "," + tag;
	this.sheet.getRange(1, idx+1, 1, 1).setNotes([[tags.join("\n")]]);
};

/**
 * Add a new Primary Key Field
 * @param name      - The Field name
 * @throws TableIntegrityError, if there is a Primary Key already
 */
Table.prototype.primary = function( name ) {
	var headers = this.sheet.getRange(1, 1, 1, this.sheet.getMaxColumns());
	headers.getNotes()[0].forEach(function(note) {
		if( /primary/.test(note) )
			throw new TableIntegrityError("Table has a Primary Key already");
	});
	this.add_field( name, ["hex,10", "primary"] );
};

/**
 * Add the unique tag to the last Field
 */
Table.prototype.unique = function() {
	this.add_tag( "unique" );
};

/**
 * Add the nullable tag to the last Field
 */
Table.prototype.nullable = function() {
	this.add_tag( "nullable" );
};

/**
 * Add a new String Field
 * @param name      - The Field name
 * @param length    - Optional. The Field length
 * @return The added Field
 */
Table.prototype.string = function( name, length ) {
	this.add_field( name, ["string" + (length===parseInt(length, 10) ? ","+length : "")] );
	return this;
};

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
