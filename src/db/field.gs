// ==================================================
//  FIELD FUNCTIONS
// ==================================================
/**
 * Represents a Table Field
 * 
 * @constructor
 * @param {string} name The Field name
 * @param {string} type The Field type
 * @param {string[]=} attrs The Field attributes
 * @param {number=} length The Field length
 * @param {Table_=} table The parent Table
 */
function Field_( name, type, attrs, length, table ) {
	this.name  = name;
	this.type  = type;
	this.attrs = attrs || []; this.attrs.sort();
	
	if( length ) this.length = length;
	if( table ) this.table = table;
}

/**
 * Read a Field from the given Table
 * 
 * @param {Table_} table The Table to read from
 * @param {string} name The Field name
 * @return {Field_} The Field object
 * @throws {FieldReadError} If there is no Field with the given name
 */
Field_.read = function( table, name ) {
	// Check if Field exists
	var idx = table.fields._.getValues()[0].indexOf(name);
	if( idx==-1 )
		throw new FieldReadError;
	
	var note = table.fields._.getNotes()[0][idx];
	var type = note.split("\n")[0].split(",")[0];
	var length = note.split("\n")[0].indexOf(",")==-1 ? null : parseInt(note.split("\n")[0].split(",")[1], 10);
	var attrs = note.indexOf("\n")==-1 ? [] : note.split("\n")[1].split(",");
	
	return new Field_(name, type, attrs, length, table);
};

/**
 * Write the Field to a Table
 * 
 * @return {Field} The Field object
 * @throws {FieldWriteError} If there is no parent Table
 * @throws {TableIntegrityError} If there is a Field with the same name
 */
Field_.prototype.write = function() {
	if( !this.table )
		throw new FieldWriteError;
	
	// Check for Field name
	if( Object.keys(this.table.fields).indexOf(this.name)!==-1 )
		throw new TableIntegrityError("Table has a Field with the same name");
	
	// Write to Table Sheet
	return Utils.lock(function(params) {
		if( params.field.table.sheet.getRange(1, 1, 1, params.field.table.sheet.getMaxColumns()).getValues()[0][0]!="" )
			params.field.table.sheet.insertColumnAfter(params.field.table.sheet.getMaxColumns());
		var range = params.field.table.sheet.getRange(1, params.field.table.sheet.getMaxColumns(), 1, 1);
		var notes = params.field.type +
			(params.field.length ? (","+params.field.length) : "") +
			(params.field.attrs.length>0 ? ("\n"+params.field.attrs.join("\n")) : "");
		range.setValues([[params.field.name]]).setNotes([[notes]]);
		
		params.field.table.fields._ = params.field.table.sheet.getRange(1, 1, 1, params.field.table.sheet.getMaxColumns());
		return params.field;
	}, {"field":this});
};

/**
 * Add attribute to the Field
 * 
 * @param {string} attr The attribute to add
 * @return {Field} The Field object
 * @throws {FieldWriteError} If there is no parent Table
 */
Field_.prototype.attr = function( attr ) {
	return Utils.lock(function(params) {
		// Check if Field has attribute already
		if( params.field.attrs.indexOf(attr)==-1 ) {
			params.field.attrs.push( attr ); params.field.attrs.sort();
			var idx   = params.field.table.fields._.getValues()[0].indexOf(params.field.name);
			var notes = params.field.type +
				(params.field.length ? (","+params.field.length) : "") +
				(params.field.attrs.length>0 ? ("\n"+params.field.attrs.join("\n")) : "");
			params.field.table.sheet.getRange(1, idx+1, 1, 1).setNotes([[notes]]);
		}
		
		params.field.table.fields._ = params.field.table.sheet.getRange(1, 1, 1, params.field.table.sheet.getMaxColumns());
		return params.field;
	}, {"field":this});
};

/**
 * Validate the Field against a given value
 * 
 * @param {*} value The Field value
 * @return {boolean} True, if Field value is valid. False, otherwise.
 * @throws {FieldValidationError} If there is no validation rule for the Field type
 */
Field_.prototype.validate = function( value ) {
	if( value===null || (value!==undefined && value==="") )
		return this.attrs.indexOf("nullable")!=-1;
	if( !value )
		return false;
	
	var validator;
	switch( this.type ) {
		case "string":
			validator = this.type.replace("string", ".") + (this.length ? ("{"+this.length+"}") : "*"); break;
		case "hex":
			validator = this.type.replace("hex", "[a-f0-9]") + (this.length ? ("{"+this.length+"}") : "*"); break;
		case "num":
			validator = this.type.replace("num", "[0-9]") + (this.length ? ("{"+this.length+"}") : "*"); break;
		case "alpha":
			validator = this.type.replace("alpha", "[a-z]") + (this.length ? ("{"+this.length+"}") : "*"); break;
		case "alphanum":
			validator = this.type.replace("alphanum", "[a-z0-9]") + (this.length ? ("{"+this.length+"}") : "*"); break;
		case "email":
			validator = "(\\w|-|\.)+@(\\w+\\.)+[a-z]+"; break;
		case "datetime":
			validator = "\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}"; break;
		case "date":
			validator = "\\d{4}-\\d{2}-\\d{2}"; break;
		case "time":
			validator = "\\d{2}:\\d{2}:\\d{2}"; break;
		case "boolean":
			validator = "(true|false)"; break;
		case "int":
			validator = "[+-]?\\d+"; break;
		case "float":
			validator = "[+-]?\\d+(\\.\\d+)?"; break;
		default:
			throw new FieldValidationError( this.type );
	}
	
	validator = new RegExp("^" + validator + "$");
	var valid = validator.test( value.toString().toLowerCase() );
	if( !valid )
		return false;
	if( !this.table || (this.attrs.indexOf("primary")==-1 && this.attrs.indexOf("unique")==-1) )
		return true;
	return !this.table.$DATA.some(function(row) { return row[this.name]===value; }, this);
};

// ==================================================
//  FIELD ERRORS
// ==================================================
FieldReadError = function() {
	this.name    = "FieldReadError";
	this.message = "Can't read Field from Table";
	this.stack   = (new Error).stack;
};
FieldReadError.prototype = Object.create(Error.prototype);
FieldReadError.prototype.constructor = FieldReadError;

FieldWriteError = function() {
	this.name    = "FieldWriteError";
	this.message = "Can't write Field to Table";
	this.stack   = (new Error).stack;
};
FieldWriteError.prototype = Object.create(Error.prototype);
FieldWriteError.prototype.constructor = FieldWriteError;

FieldValueError = function( field, value ) {
	this.name    = "FieldValueError";
	this.field   = field;
	this.value   = value;
	this.message = "Field value '" + value + "' is invalid for '" + field + "'";
	this.stack   = (new Error).stack;
};
FieldValueError.prototype = Object.create(Error.prototype);
FieldValueError.prototype.constructor = FieldValueError;

FieldValidationError = function( type ) {
	this.name    = "FieldValidationError";
	this.type    = type;
	this.message = "There is no validation rule for '" + type + "'";
	this.stack   = (new Error).stack;
};
FieldValidationError.prototype = Object.create(Error.prototype);
FieldValidationError.prototype.constructor = FieldValidationError;
