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
	
	// Get Table Fields
	var headers = this.sheet.getRange(1, 1, 1, this.sheet.getMaxColumns());
	this.fields = headers.getValues()[0].reduce(function(fields, field, idx) {
		var notes = headers.getNotes()[0][idx].split("\n");
		fields[field] = {
			"index":idx,
			"type":notes[0].split(",")[0],
			"length":notes[0].split(",").length>1 ? parseInt(notes[0].split(",")[1], 10) : null,
			"tags":notes.length>1 ? notes[1].split(",") : []
		};
		return fields;
	}, {});
	this.fields._ = headers;
	
	// Get Table data
	this.$DATA = this.sheet.getRange(2, 1, this.sheet.getMaxRows()-1, this.sheet.getMaxColumns()).getValues();
	this.$DATA = this.$DATA.map(function(row) {
		Logger.log( row );
		if( row.some(function(value) { return value!==""; }) ) {
			return headers.getValues()[0].reduce(function(data, field, idx) {
				data[field] = row[idx]; return data;
			}, {});
		} else { return null; }
	}).filter(function(row) { return row!==null; });
	
	// Clone Table data to represent current query
	this.data  = this.$DATA.slice(0);
}

/**
 * Add a new Field
 * @param name      - The Field name
 * @param tags      - The Field tags
 * @return The Table object
 * @throws TableIntegrityError, if there is a Field with the same name
 */
Table.prototype.add_field = function( name, tags ) {
	if( Object.keys(this.fields).indexOf(name)!==-1 )
		throw new TableIntegrityError("Field '" + name + "' exists already");
	
	if( this.sheet.getRange(1, 1, 1, this.sheet.getMaxColumns()).getValues()[0][0]!="" )
		this.sheet.insertColumnAfter(this.sheet.getMaxColumns());
	var range = this.sheet.getRange(1, this.sheet.getMaxColumns(), 1, 1);
	range.setValues([[name]]).setNotes([[tags.join("\n")]]);
	
	// Create the Field
	this.fields[name] = {
		"index":this.sheet.getMaxColumns()-1,
		"type":tags[0].split(",")[0],
		"length":tags[0].split(",").length>1 ? parseInt(tags[0].split(",")[1], 10) : null,
		"tags":tags.splice(1)
	};
	this.fields._ = this.sheet.getRange(1, 1, 1, this.sheet.getMaxColumns());
	
	return this;
};

/**
 * Add tag to the last Field
 * @param tag       - The tag to add
 */
Table.prototype.add_tag = function( tag ) {
	var idx  = this.sheet.getMaxColumns()-1;
	var tags = this.fields._.getNotes()[0][idx].split("\n");
	if( tags.length==1 )
		tags.push( tag );
	else if( !(new RegExp(tag)).test(tags[tags.length-1]) )
		tags[tags.length-1] += "," + tag;
	this.sheet.getRange(1, idx+1, 1, 1).setNotes([[tags.join("\n")]]);
};

// ==================================================
//  TABLE FIELD FUNCTIONS
// ==================================================
/**
 * Add a new Primary Key Field
 * @param name      - The Field name
 * @throws TableIntegrityError, if there is a Primary Key already
 */
Table.prototype.primary = function( name ) {
	var fields = this.fields._.getValues()[0];
	if( fields.some(function(field) { return this.fields[field].tags.indexOf("primary")!=-1; }, this) )
		throw new TableIntegrityError("Table has a Primary Key already");
	this.add_field(name, ["hex,10", "primary"]);
};

/**
 * Add the unique tag to the last Field
 */
Table.prototype.unique = function() {
	this.add_tag("unique");
};

/**
 * Add the nullable tag to the last Field
 */
Table.prototype.nullable = function() {
	this.add_tag("nullable");
};

/**
 * Add a new String Field
 * @param name      - The Field name
 * @param length    - Optional. The Field length
 * @return The Table object
 */
Table.prototype.string = function( name, length ) {
	return this.add_field(name, ["string" + (length===parseInt(length, 10) ? ","+length : "")]);
};

// ==================================================
//  TABLE CRUD FUNCTIONS
// ==================================================
/**
 * Filter the current Table data
 * @param field     - The Field to test
 * @param compare   - The compare operator
 * @param value     - The value to compare against or RegEx tester
 * @return The Table object
 * @thows FieldNotFoundError, if header does not exist in table
 * @thows InvalidOperatorError, if compare is not a valid operator
 * @thows InvalidRegexError, if compare is '~=' and value is not a valid RegEx object
 */
Table.prototype.where = function( field, compare, value ) {
	// Check parameters
	if( Object.keys(this.fields).indexOf(field)==-1 )
		throw new FieldNotFoundError( field, this.table );
	if( ["<", "<=", "=", "!=", "~=", ">=", ">"].indexOf(compare)==-1 )
		throw new InvalidOperatorError( compare, ["<", "<=", "=", "!=", "~=", ">=", ">"] );
	if( compare=="~=" && value.constructor!==RegExp )
		throw new InvalidRegexError( value );

	// Filter data
	var value = ( (typeof value === "undefined") || (value===null) ) ? "" : value.toString();
	this.data = this.data.filter(function(row) {
		var data = ( (typeof row[field] === "undefined") || (row[field]===null) ) ? "" : row[field].toString();
		if( compare=="~=" )
			return eval(value + ".test('" + data + "')" );
		else if( compare!="=" )
			return eval("'" + data + "'" + compare + "'" + value + "'" );
		else
			return data===value;
	});

	return this;
};

/**
 * Get the current Table data
 */
Table.prototype.get = function() {
	return this.data;
};

/**
 * Get all the Table data
 */
Table.prototype.all = function() {
	return this.$DATA;
};

/**
 * Insert a new Table row
 * @param data      - The row data
 */
Table.prototype.insert = function( data ) {
	// Map data to Field names array
	data = this.fields._.getValues()[0].map(function(field) {
		if( (typeof data[field] === "undefined") || (data[field]===null) )
			return null;
		return data[field].toString();
	});
	
	// Prepend Field names array
	if( this.$DATA.length>0 )
		this.sheet.insertRowBefore(2);
	this.sheet.getRange(2, 1, 1, this.sheet.getMaxColumns()).setValues([data]);
};

/**
 * Update the current Table data
 * @param data      - The row data
 * @throws TableIntegrityError, if there is a Primary Key already
 */
Table.prototype.update = function( data ) {
	var primary; this.fields._.getValues()[0].some(function(field) {
		if( this.fields[field].tags.indexOf("primary")!=-1 ) {
			primary = field; return true;
		}
	}, this);
	if( (typeof data[primary] !== "undefined") && (data[primary]!==null) )
		throw new TableIntegrityError("Can't update Primary Key value");
	
	this.data.forEach(function(row) {
		// Map data to Field names array
		var values = this.fields._.getValues()[0].map(function(field) {
			if( (typeof data[field] === "undefined") || (data[field]===null) ) {
				if( (typeof row[field] === "undefined") || (row[field]===null) )
					return "";
				else
					return row[field].toString();
			}
			if( this.fields[field].length!==null && data[field].length!==this.fields[field].length )
				throw new TableFieldError(field, "Field length is invalid");
			return (field===primary ? row[field] : data[field]).toString();
		}, this);
		
		// Write row to table
		var index; Database.table(this.sheet.getName()).$DATA.some(function(value, idx) {
			if( value[primary]===row[primary] ) {
				index = idx; return true;
			}
		});
		this.sheet.getRange(index + 2, 1, 1, values.length).setValues([values]);
	}, this);
};

/**
 * Remove the current Table data
 */
Table.prototype.remove = function() {
	var primary; this.fields._.getValues()[0].some(function(field) {
		if( this.fields[field].tags.indexOf("primary")!=-1 ) {
			primary = field; return true;
		}
	}, this);
	
	this.data.forEach(function(row) {
		var index; Database.table(this.sheet.getName()).$DATA.some(function(value, idx) {
			if( value[primary]===row[primary] ) {
				index = idx; return true;
			}
		});
		if( this.sheet.getMaxRows()==2 )
			this.sheet.getRange(index + 2, 1, 1, this.sheet.getMaxColumns()).clearContent();
		else
			this.sheet.deleteRow(index + 2);
	}, this);
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
