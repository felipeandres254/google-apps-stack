// ==================================================
//  TABLE FUNCTIONS
// ==================================================
/**
 * Represents a Database Table
 * 
 * @constructor
 * @param {string} name The Table name
 */
function Table_( name ) {
	// Check if Table exists
	if( SPREADSHEET.getSheetByName( name )===null )
		throw new TableNotFoundError( name );
	
	// Get Table Fields
	this.sheet = SPREADSHEET.getSheetByName( name );
	this.fields = {"_":this.sheet.getRange(1, 1, 1, this.sheet.getMaxColumns())};
	this.fields._.getValues()[0].forEach(function(field) {
		if( field!=="" )
			this.fields[field] = Field_.read(this, field);
	}, this);
	
	// Get Table data and current query data
	this.$DATA = []; this.data = []; this.reset();
}

/**
 * Get the Primary Key Field name
 * 
 * @return {string} The Primary Key name
 */
Table_.prototype.primary = function() {
	var primary; this.fields._.getValues()[0].some(function(field) {
		if( this.fields[field] && this.fields[field].attrs.indexOf("primary")!==-1 ) {
			primary = field; return true;
		}
	}, this);
	return primary;
};

/**
 * Reset the Table data and current query data
 */
Table_.prototype.reset = function() {
	// Get Table data
	this.$DATA = this.sheet.getRange(2, 1, this.sheet.getMaxRows()-1, this.sheet.getMaxColumns()).getValues();
	this.$DATA = this.$DATA.map(function(row) {
		if( row.some(function(value) { return value!==""; }) ) {
			return this.fields._.getValues()[0].reduce(function(data, field, idx) {
				data[field] = row[idx]; return data;
			}, {});
		} else { return null; }
	}, this).filter(function(row) { return row!==null; });
	this.$DATA = this.$DATA.map(function(row, idx) { row.__index__ = idx; return row; });
	
	// Clone Table data (current query data)
	this.data = this.$DATA.slice(0);
};

// ==================================================
//  TABLE CRUD FUNCTIONS
// ==================================================
/**
 * Filter the current Table data
 * 
 * @param {string} field The Field name to compare
 * @param {string} compare The compare operator. One of "<", "<=", ">=", ">", "=", "!=" or "~="
 * @param {string|RegExp} value The value to compare against
 * @return {Table_} The Table object. Useful for chaining.
 */
Table_.prototype.where = function( field, compare, value ) {
	value = ( (typeof value === "undefined") || (value===null) ) ? "" : value.toString();
	this.data = this.data.filter(function(row) {
		var data = ( (typeof row[field] === "undefined") || (row[field]===null) ) ? "" : row[field].toString();
		if( compare==="~=" )
			return eval(value + ".test('" + data + "')");
		else if( compare!=="=" )
			return eval("'" + data + "'" + compare + "'" + value + "'");
		else
			return data===value;
	});
	return this;
};

/**
 * Get the current Table data
 * 
 * @return {Array} A clone of this.data
 */
Table_.prototype.get = function() {
	return this.data.slice(0).map(function(row) { delete row.__index__; return row; });
};

/**
 * Get all the Table data
 * 
 * @return {Array} A clone of this.$DATA
 */
Table_.prototype.all = function() {
	return this.$DATA.slice(0).map(function(row) { delete row.__index__; return row; });
};

/**
 * Insert a new Table row
 * 
 * @param {Object} data The row data
 * @throws {TableInvalidRowError} If any of the Fields is invalid
 */
Table_.prototype.insert = function( data ) {
	// Map data to Field values array
	var row = this.fields._.getValues()[0].map(function(field) {
		if( !this.fields[field].validate(data[field]) )
			return null;
		return data[field] ? data[field].toString() : "";
	}, this);
	
	if( row.some(function(field) { field===null; }) )
		throw new TableInvalidRowError;
	
	// Prepend Field values array
	Utils.lock(function(table) {
		if( table.$DATA.length>0 )
			table.sheet.insertRowBefore(2);
		table.sheet.getRange(2, 1, 1, table.sheet.getMaxColumns()).setValues([row]);
		table.$DATA.push(data);
	}, this);
};

/**
 * Update the current Table data
 * 
 * @param {Object} data The row data
 * @throws {TableIntegrityError} If data contains the Primary Key and Table has row with the same value
 * @throws {FieldValueError} If any field on any row is invalid
 */
Table_.prototype.update = function( data ) {
	var uniques = []; this.fields._.getValues()[0].forEach(function(field) {
		if( this.fields[field].attrs.indexOf("primary")!==-1 )
			uniques = [field].concat(uniques);
		if( this.fields[field].attrs.indexOf("unique")!==-1 )
			uniques.push(field);
	}, this);
	uniques.forEach(function(field) {
		if( data[field] && this.data.length===1 && !this.fields[field].validate(data[field]) )
			throw new TableIntegrityError("Primary Key or unique value already exists in Table data");
		if( data[field] && this.data.length>1 )
			delete data[field];
	}, this);
	
	Utils.lock(function(table) {
		table.data.forEach(function(row) {
			// Map data to Field values array
			var values = table.fields._.getValues()[0].map(function(field) {
				if( (typeof data[field] === "undefined") || (data[field]===null) ) {
					if( (typeof row[field] === "undefined") || (row[field]===null) )
						return "";
					else
						return row[field].toString();
				} else {
					if( !table.fields[field].validate(data[field]) )
						throw new FieldValueError( field, data[field] );
					return data[field].toString();
				}
			});
			
			// Write row to Table
			table.sheet.getRange(row.__index__ + 2, 1, 1, values.length).setValues([values]);
		});
		table.reset();
	}, this);
};

/**
 * Remove the current Table data
 */
Table_.prototype.remove = function() {
	Utils.lock(function(table) {
		// Clear row contents from the Table
		table.data.forEach(function(row) {
			table.sheet.getRange(row.__index__ + 2, 1, 1, table.sheet.getMaxColumns()).clearContent();
		});
		
		// Delete empty rows
		table.sheet.getRange(2, 1, 1, table.sheet.getMaxColumns()).getValues().forEach(function(row, idx) {
			if( row.every(function(value) { return value===""; }) && table.sheet.getMaxRows()>2 )
				table.sheet.deleteRow(idx + 2);
		});
		table.reset();
	}, this);
};

// ==================================================
//  TABLE ERRORS
// ==================================================
TableExistsError = function( table ) {
	this.name    = "TableExistsError";
	this.table   = table;
	this.message = "The Table '" + table + "' exists already";
	this.stack   = (new Error).stack;
};
TableExistsError.prototype = Object.create(Error.prototype);
TableExistsError.prototype.constructor = TableExistsError;

TableNotFoundError = function( table ) {
	this.name    = "TableNotFoundError";
	this.table   = table;
	this.message = "The Table '" + table + "' does not exist";
	this.stack   = (new Error).stack;
};
TableNotFoundError.prototype = Object.create(Error.prototype);
TableNotFoundError.prototype.constructor = TableNotFoundError;

TableIntegrityError = function( message ) {
	this.name    = "TableIntegrityError";
	this.message = message;
	this.stack   = (new Error).stack;
};
TableIntegrityError.prototype = Object.create(Error.prototype);
TableIntegrityError.prototype.constructor = TableIntegrityError;

TableInvalidRowError = function() {
	this.name    = "TableInvalidRowError";
	this.message = "Can't insert invalid row to Table";
	this.stack   = (new Error).stack;
};
TableInvalidRowError.prototype = Object.create(Error.prototype);
TableInvalidRowError.prototype.constructor = TableInvalidRowError;
