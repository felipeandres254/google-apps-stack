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
 * @param {Schema=} schema The Field parent Schema
 */
function Field_( name, type, attrs, length, schema ) {
	this.name  = name;
	this.type  = type;
	this.attrs = attrs || []; this.attrs.sort();
	
	if( length ) this.length = length;
	if( schema ) this.schema = schema;
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
	
	return new Field_(name, type, attrs, length);
};

/**
 * Write the Field to a Table
 * 
 * @return {Field_} The Field object
 * @throws {FieldWriteError} If there is no Field Schema
 * @throws {TableIntegrityError} If there is a Field with the same name
 */
Field_.prototype.write = function() {
	if( !this.schema )
		throw new FieldWriteError;
	
	// Check for Field name
	if( this.schema.has(this.name) )
		throw new TableIntegrityError("Table has a Field with the same name");
	
	// Write to Schema Sheet
	return Utils.lock(function(field) {
		if( field.schema.sheet.getRange(1, field.schema.sheet.getMaxColumns(), 1, 1).getValues()[0][0]!=="" )
			field.schema.sheet.insertColumnAfter(field.schema.sheet.getMaxColumns());
		var range = field.schema.sheet.getRange(1, field.schema.sheet.getMaxColumns(), 1, 1);
		var notes = field.type +
			(field.length ? (","+field.length) : "") +
			(field.attrs.length>0 ? ("\n"+field.attrs.join(",")) : "");
		range.setValues([[field.name]]).setNotes([[notes]]);
		
		return field;
	}, this);
};

/**
 * Add attribute to the Field
 * 
 * @param {string} attr The attribute to add
 * @throws {FieldWriteError} If there is no Field Schema
 */
Field_.prototype.attr = function( attr ) {
	if( !this.schema )
		throw new FieldWriteError;
	if( this.attrs.indexOf(attr)!==-1 )
		return;
	
	Utils.lock(function(params) {
		params.field.schema.fields = params.field.schema.sheet.getRange(1, 1, 1, params.field.schema.sheet.getMaxColumns());
		
		params.field.attrs.push(params.attr); params.field.attrs.sort();
		var idx   = params.field.schema.fields.getValues()[0].indexOf(params.field.name);
		var notes = params.field.type +
			(params.field.length ? (","+params.field.length) : "") +
			(params.field.attrs.length>0 ? ("\n"+params.field.attrs.join(",")) : "");
		params.field.schema.sheet.getRange(1, idx+1, 1, 1).setNotes([[notes]]);
		
		params.field.schema.fields = params.field.schema.sheet.getRange(1, 1, 1, params.field.schema.sheet.getMaxColumns());
	}, {"field":this, "attr":attr});
};

/**
 * Add 'unique' attribute to the Field
 */
Field_.prototype.unique = function() { this.attr("unique"); };

/**
 * Add 'nullable' attribute to the Field
 */
Field_.prototype.nullable = function() { this.attr("nullable"); };

/**
 * Validate the Field against a given value
 * 
 * @param {*} value The Field value
 * @return {boolean} True, if Field value is valid. False, otherwise.
 * @throws {FieldValidationError} If there is no validation rule for the Field type
 */
Field_.prototype.validate = function( value ) {
	if( value===null || (value!==undefined && value==="") )
		return this.attrs.indexOf("nullable")!==-1;
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
	this.message = "Can't read Field from Schema";
	this.stack   = (new Error).stack;
};
FieldReadError.prototype = Object.create(Error.prototype);
FieldReadError.prototype.constructor = FieldReadError;

FieldWriteError = function() {
	this.name    = "FieldWriteError";
	this.message = "Can't write Field to Schema";
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
