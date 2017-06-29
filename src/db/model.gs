// ==================================================
//  MODEL ORM EXTENSION
// ==================================================
/**
 * Define an ORM for the Database
 * 
 * @constructor
 * @param {object=} data The Model data
 * @throws Error, if table is not defined
 */
Model = function( data ) {
	if( !this.table )
		throw new Error("Model does not have an associated table");
	
	this.data = data;
};

/**
 * Initialize inheritance and static methods
 * 
 * @param {function} model The ORM constructor
 * @param {function} fields The closure of Table Fields
 */
Model.init = function( model, fields ) {
	// Inherit from Model
	model.prototype = Object.create(Model.prototype);
	model.prototype.constructor = model;
	
	try { model.prototype.table = Database.table((new model).table); }
	catch(e) { Database.create((new model).table, fields); }
	finally { model.prototype.table = Database.table((new model).table); }
	
	// Define static methods
	model.all = function() {
		return model.prototype.table.all().map(function(m) { return new model(m); });
	};
	
	// Extend static methods
	model.count = function() {
		model.prototype.table.data = model.prototype.table.all();
		if( model.prototype.table.fields.deleted )
			return model.prototype.table.where("deleted", "=", "").get().length;
		else
			return model.prototype.table.get().length;
	};
	model.where = function(a, b, c) {
		model.prototype.table.data = model.prototype.table.all();
		return (new model).where(a, b, c);
	};
	model.removed = function() {
		model.prototype.table.data = model.prototype.table.all();
		return model.prototype.table.fields.deleted ? model.where("deleted", "!=", "") : model;
	};
};

/**
 * Count the current Models
 * 
 * @return {number} The number of objects
 */
Model.prototype.count = function() {
	return this.constructor.prototype.table.get().length;
};

/**
 * Get the current Models
 * 
 * @return {Array} The Model objects
 */
Model.prototype.get = function() {
	return this.constructor.prototype.table.get().map(function(m) { return new this.constructor(m); }, this);
};

/**
 * Filter the current Models
 * 
 * @param {string} field The Field name to compare
 * @param {string} compare The compare operator. One of "<", "<=", ">=", ">", "=", "!=" or "~="
 * @param {string|RegExp} value The value to compare against
 * @return {Model} The Model object. Useful for chaining.
 */
Model.prototype.where = function( field, compare, value ) {
	this.constructor.prototype.table = this.constructor.prototype.table.where(field, compare, value); return this;
};

/**
 * Insert or update a Model in the Database
 */
Model.prototype.save = function() {
	// Get the name of the Primary Key Field
	var primary = this.constructor.prototype.table.primary();
	
	if( !primary ) {
		this.constructor.prototype.table.insert(this.data); return;
	}
	
	if( !this.data[primary] ) {
		this.data[primary] = (this.constructor.name + " " + Date.now()).sha1().substr(0, 10);
		this.constructor.prototype.table.insert(this.data);
	} else {
		var value = this.data[primary];
		this.constructor.prototype.table.data = this.constructor.prototype.table.all();
		this.constructor.prototype.table.fields._.getValues()[0].forEach(function(field) {
			var attrs = this.constructor.prototype.table.fields[field].attrs;
			if( attrs.indexOf("primary")!==-1 || attrs.indexOf("unique")!==-1 )
				delete this.data[field];
		}, this);
		var table = this.constructor.prototype.table.sheet.getName();
		Database.table(table).where(primary, "=", value).update(this.data);
	}
};

/**
 * Soft-delete the current Model(s)
 * 
 * @param {boolean} forced To delete the Model completely
 */
Model.prototype.remove = function( forced ) {
	var date = (new Date).toISOString().substr(0, 19).replace("T", " ");
	
	if( forced || !this.constructor.prototype.table.fields.deleted ) {
		// Remove Model(s) from Database
		this.constructor.prototype.table.remove();
	} else {
		// Soft-delete the current Model(s)
		this.constructor.prototype.table.update({"deleted":date});
	}
};

/**
 * Restore the current Model(s)
 */
Model.prototype.restore = function() {
	if( !this.constructor.prototype.table.fields.deleted )
		return;
	this.constructor.prototype.table.update({"deleted":""});
};
