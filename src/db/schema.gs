// ==================================================
//  SCHEMA FUNCTIONS
// ==================================================
/**
 * Represents a Table Schema
 * 
 * @constructor
 * @param {string} name The Table name
 */
function Schema_( name ) {
	// Create and format sheet, if does not exist
	if( SPREADSHEET.getSheetByName( name )===null ) {
		Utils.lock(function() {
			var sheet = SPREADSHEET.insertSheet( name );
			sheet.deleteRows(2, sheet.getMaxRows()-2);
			sheet.deleteColumns(2, sheet.getMaxColumns()-1);
			sheet.setRowHeight(1, 25).setRowHeight(2, 25).setColumnWidth(1, 150);
			
			sheet.getRange(1, 1, 1, sheet.getMaxColumns()).setFontWeight("bold");
			sheet.getRange(1, 1, 2, sheet.getMaxColumns())
				.setNumberFormat("@").setHorizontalAlignment("left").setVerticalAlignment("middle");
			sheet.setFrozenRows(1);
			
			if( SPREADSHEET.getNumSheets()>1 && SPREADSHEET.getSheetByName(".") )
				SPREADSHEET.deleteSheet(SPREADSHEET.getSheetByName("."));
		});
	}
	
	// Get sheet and fields
	this.sheet = SPREADSHEET.getSheetByName( name );
	this.fields = this.sheet.getRange(1, 1, 1, this.sheet.getMaxColumns());
}

/**
 * Check if Schema has a Primary Key
 * 
 * @return {boolean} True, if Schema has a Primary Key
 */
Schema_.prototype.hasPrimary = function() {
	return this.fields.getNotes()[0].some(function(attributes) {
		return /primary/.test(attributes);
	});
};

/**
 * Check if Schema has a Field with the given name
 * 
 * @param {string} name The Field name to check
 * @return {boolean} True, if Schema has Field
 */
Schema_.prototype.has = function( name ) {
	return this.fields.getValues()[0].some(function(field) {
		return field===name;
	});
};

/**
 * Add a Primary Key Field
 * 
 * @param {string} name The Field name
 * @throws {TableIntegrityError} If there is a Primary Key already
 */
Schema_.prototype.primary = function( name ) {
	if( this.hasPrimary() )
		throw new TableIntegrityError("Table has a Primary Key already");
	
	(new Field_(name, "hex", ["primary"], 10, this)).write();
};

// STRING FIELD DEFINITIONS
//   string   => Any character
//   hex      => Only hexadecimal characters  ('0' to '9' and 'a' to 'f')
//   alpha    => Only alphabetic characters   ('a' to 'z')
//   alphanum => Only alphanumeric characters ('0' to '9' and 'a' to 'z')
["string", "hex", "alpha", "alphanum"].forEach(function(type) {
	/**
	 * Add a new Field of type
	 * 
	 * @param {string} name The Field name
	 * @param {number=} length The Field length
	 * @return {Field_} The Field object. Useful for chaining.
	 */
	Schema_.prototype[type] = function( name, length ) {
		var field = new Field_(name, type, [], length || null, this);
		field.write(); return field;
	};
}, this);

// SPECIAL FIELD DEFINITIONS
//   email    => An email        (user@example.com)
//   datetime => A date and time (yyyy-mm-dd hh:ii:ss)
//   date     => A date          (yyyy-mm-dd)
//   time     => A time          (hh:ii:ss)
//   boolean  => A boolean       (true or false)
//   int      => An integer      (±d)
//   float    => A float         (±d.d)
["email", "datetime", "date", "time", "boolean", "int", "float"].forEach(function(type) {
	/**
	 * Add a new Field of type
	 * 
	 * @param {string} name The Field name
	 * @return {Field_} The Field object. Useful for chaining.
	 */
	Schema_.prototype[type] = function( name ) {
		var field = new Field_(name, type, [], null, this);
		field.write(); return field;
	};
}, this);
