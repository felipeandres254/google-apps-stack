// ==================================================
//  TABLE FUNCTIONS
// ==================================================
/**
 * Represents a Database Table
 * 
 * @constructor
 * @param {string} name The Table name
 */
function Table( name ) {
	// Create and format sheet, if does not exists
	if( $SS.getSheetByName( name )===null ) {
		Utils.lock(function() {
			var sheet = $SS.insertSheet( name );
			sheet.deleteRows(2, sheet.getMaxRows()-2);
			sheet.deleteColumns(2, sheet.getMaxColumns()-1);
			sheet.setRowHeight(1, 25).setRowHeight(2, 25).setColumnWidth(1, 150);
			
			sheet.getRange(1, 1, 1, sheet.getMaxColumns()).setFontWeight("bold");
			sheet.getRange(1, 1, 2, sheet.getMaxColumns())
				.setNumberFormat("@").setHorizontalAlignment("left").setVerticalAlignment("middle");
			sheet.setFrozenRows(1);
		});
	}
	this.sheet = $SS.getSheetByName( name );
	
	// Get Table Fields
	this.fields = {"_":this.sheet.getRange(1, 1, 1, this.sheet.getMaxColumns())};
	this.fields._.getValues()[0].forEach(function(field) {
		if( field!=="" )
			this.fields[field] = Field.read(this, field);
	}, this);
	
	// Get Table data
	this.$DATA = this.sheet.getRange(2, 1, this.sheet.getMaxRows()-1, this.sheet.getMaxColumns()).getValues();
	this.$DATA = this.$DATA.map(function(row) {
		if( row.some(function(value) { return value!==""; }) ) {
			return this.fields._.getValues()[0].reduce(function(data, field, idx) {
				data[field] = row[idx]; return data;
			}, {});
		} else { return null; }
	}, this).filter(function(row) { return row!==null; });
	
	// Clone Table data (current query data)
	this.data = this.$DATA.slice(0);
}

/**
 * Add a Primary Key Field or get the existing one
 * 
 * @param {string=} name The Field name
 * @return {string=} If name is not supplied, return the Primary Key name
 * @throws {TableIntegrityError} If there is a Primary Key already
 */
Table.prototype.primary = function( name ) {
	var primary; this.fields._.getValues()[0].some(function(field) {
		if( this.fields[field] && this.fields[field].attrs.indexOf("primary")!==-1 ) {
			if( name )
				throw new TableIntegrityError("Table has a Primary Key already");
			primary = field; return true;
		}
	}, this);
	
	// Get the Primary Key name
	if( !name )
		return primary;
	
	// Set the Primary Key field
	this.fields[name] = (new Field(name, "hex", ["primary"], 10, this)).write();
};

/**
 * Add the 'unique' attribute to a Field
 * 
 * @param {string=} name The Field name
 */
Table.prototype.unique = function( name ) {
	name = name || this.fields._.getValues()[0][this.fields._.getValues()[0].length-1];
	this.fields[name] = this.fields[name].attr("unique");
};

/**
 * Add the 'nullable' attribute to a Field
 * 
 * @param {string=} name The Field name
 */
Table.prototype.nullable = function( name ) {
	name = name || this.fields._.getValues()[0][this.fields._.getValues()[0].length-1];
	this.fields[name] = this.fields[name].attr("nullable");
};

/**
 * Add a new String Field
 * 
 * @param {string} name The Field name
 * @param {number=} length The Field length
 * @return {Table} The Table object. Useful for chaining.
 */
Table.prototype.string = function( name, length ) {
	this.fields[name] = (new Field(name, "string", [], length || null, this)).write();
	return this;
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
 * @return {Table} The Table object. Useful for chaining.
 */
Table.prototype.where = function( field, compare, value ) {
	value = ( (typeof value === "undefined") || (value===null) ) ? "" : value.toString();
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
 * 
 * @return {Array} this.data
 */
Table.prototype.get = function() {
	return this.data;
};

/**
 * Get all the Table data
 * 
 * @return {Array} this.$DATA
 */
Table.prototype.all = function() {
	return this.$DATA;
};

/**
 * Insert a new Table row
 * 
 * @param {Object} data The row data
 * @throws {TableInvalidRowError} If any of the Fields is invalid
 */
Table.prototype.insert = function( data ) {
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
 * @throws {TableIntegrityError} If data contains the Primary Key and Table has row with the same
 */
Table.prototype.update = function( data ) {
	var uniques = []; this.fields._.getValues()[0].forEach(function(field) {
		if( this.fields[field].attrs.indexOf("primary")!=-1 )
			uniques = [field].concat(uniques);
		if( this.fields[field].attrs.indexOf("unique")!=-1 )
			uniques.push(field);
	}, this);
	uniques.forEach(function(field) {
		if( data[field] && this.data.length==1 && !this.fields[field].validate(data[field]) )
			throw new TableIntegrityError("Primary Key or unique value already exists in Table data");
		if( data[field] && this.data.length>1 )
			delete data[field];
	}, this);
	
	this.data.forEach(function(row) {
		// Map data to Field values array
		var values = this.fields._.getValues()[0].map(function(field) {
			if( (typeof data[field] === "undefined") || (data[field]===null) ) {
				if( (typeof row[field] === "undefined") || (row[field]===null) )
					return "";
				else
					return row[field].toString();
			} else {
				if( !this.fields[field].validate(data[field]) )
					throw new FieldValueError( field, data[field] );
				return data[field].toString();
			}
		}, this);
		
		// Write row to Table
		Utils.lock(function(table) {
			var idx; Database.table(table.sheet.getName()).$DATA.some(function(value, i) {
				if( value[uniques[0]]===row[uniques[0]] ) {
					idx = i; return true;
				}
			});
			if( idx===parseInt(idx, 10) )
				table.sheet.getRange(idx + 2, 1, 1, values.length).setValues([values]);
		}, this);
	}, this);
};

/**
 * Remove the current Table data
 */
Table.prototype.remove = function() {
	// Get the name of the Primary Key Field
	var primary = this.primary();
	
	this.data.forEach(function(row) {
		Utils.lock(function(table) {
			// Get the row index
			var idx; Database.table(table.sheet.getName()).$DATA.some(function(value, i) {
				if( value[primary]===row[primary] ) {
					idx = i; return true;
				}
			});
			
			// Remove the row from the Table
			if( table.sheet.getMaxRows()==2 )
				table.sheet.getRange(idx + 2, 1, 1, table.sheet.getMaxColumns()).clearContent();
			else
				table.sheet.deleteRow(idx + 2);
		}, this);
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
