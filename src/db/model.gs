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
 * @param {function} schema The closure of Model Schema
 */
Model.init = function( model, schema ) {
	// Inherit from Model
	model.prototype = Object.create(Model.prototype);
	model.prototype.constructor = model;
	
	try { model.prototype.table = Database.table((new model).table); }
	catch(e) { Database.create((new model).table, schema); }
	finally { model.prototype.table = Database.table((new model).table); }
	
	// Define static methods
	model.all = function() {
		model.prototype.table.reset();
		return model.prototype.table.all().map(function(m) {
			m = new model(m); delete m.data.__index__; return m;
		});
	};
	
	// Extend static methods
	model.count = function() {
		model.prototype.table.reset();
		if( model.prototype.table.fields.deleted )
			return model.prototype.table.where("deleted", "=", "").get().length;
		else
			return model.prototype.table.get().length;
	};
	model.where = function(a, b, c) {
		model.prototype.table.reset();
		return (new model).where(a, b, c);
	};
	model.removed = function() {
		model.prototype.table.reset();
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

// ==================================================
//  MODEL CRUD FUNCTIONS
// ==================================================
/**
 * Get the current Models
 * 
 * @return {Array} The Model objects
 */
Model.prototype.get = function() {
	return this.constructor.prototype.table.get().map(function(m) {
		m = new this.constructor(m); delete m.data.__index__; return m;
	}, this);
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
	var date = (new Date).toISOString().substr(0, 19).replace("T", " ");
	
	// BEFORE SAVE EVENT
	(function(model) {
		// Default behaviour: set 'updated' Field, if exists
		if( model.constructor.prototype.table.fields._.getValues()[0].indexOf("updated")!==-1 )
			model.data.updated = date;
		// Run custom behaviour, if before_save exists
		if( model.before_save && (typeof model.before_save === "function") )
			model.before_save();
	})( this );
	
	// Get the name of the Primary Key Field
	var primary = this.constructor.prototype.table.primary();
	if( !primary ) {
		this.constructor.prototype.table.insert(this.data); return;
	}
	
	if( !this.data[primary] ) {
		// BEFORE CREATE EVENT
		(function(model) {
			// Default behaviour: set Primary Key Field and 'created' Field, if exists
			model.data[primary] = (model.constructor.name + " " + Date.now()).sha1().substr(0, 10);
			if( model.constructor.prototype.table.fields._.getValues()[0].indexOf("created")!==-1 )
				model.data.created = date;
			// Run custom behaviour, if before_create exists
			if( model.before_create && (typeof model.before_create === "function") )
				model.before_create();
		})( this );
		
		this.constructor.prototype.table.insert(this.data);
		
		// AFTER CREATE EVENT
		(function(model) {
			// Run custom behaviour, if after_create exists
			if( model.after_create && (typeof model.after_create === "function") )
				model.after_create();
		})( this );
	} else {
		// BEFORE UPDATE EVENT
		(function(model) {
			// Run custom behaviour, if before_update exists
			if( model.before_update && (typeof model.before_update === "function") )
				model.before_update();
		})( this );
		
		var value = this.data[primary];
		this.constructor.prototype.table.reset();
		this.constructor.prototype.table.fields._.getValues()[0].forEach(function(field) {
			var attrs = this.constructor.prototype.table.fields[field].attrs;
			if( attrs.indexOf("primary")!==-1 || attrs.indexOf("unique")!==-1 )
				delete this.data[field];
		}, this);
		var table = this.constructor.prototype.table.sheet.getName();
		Database.table(table).where(primary, "=", value).update(this.data);
		
		// AFTER UPDATE EVENT
		(function(model) {
			// Run custom behaviour, if after_update exists
			if( model.after_update && (typeof model.after_update === "function") )
				model.after_update();
		})( this );
	}
	
	// AFTER SAVE EVENT
	(function(model) {
		// Run custom behaviour, if after_save exists
		if( model.after_save && (typeof model.after_save === "function") )
			model.after_save();
	})( this );
};

/**
 * Soft-delete the current Model(s)
 * 
 * @param {boolean} forced To delete the Model completely
 */
Model.prototype.remove = function( forced ) {
	var date = (new Date).toISOString().substr(0, 19).replace("T", " ");
	
	// BEFORE REMOVE EVENT
	(function(model) {
		// Run custom behaviour, if before_remove exists
		if( model.before_remove && (typeof model.before_remove === "function") )
			model.before_remove();
	})( this );
	
	if( forced || !this.constructor.prototype.table.fields.deleted ) {
		// Remove Model(s) from Database
		this.constructor.prototype.table.remove();
	} else {
		// Soft-delete the current Model(s)
		this.constructor.prototype.table.update({"deleted":date});
	}
	
	// AFTER REMOVE EVENT
	(function(model) {
		// Run custom behaviour, if after_remove exists
		if( model.after_remove && (typeof model.after_remove === "function") )
			model.after_remove();
	})( this );
};

/**
 * Restore the current Model(s)
 */
Model.prototype.restore = function() {
	if( !this.constructor.prototype.table.fields.deleted )
		return;
	this.constructor.prototype.table.update({"deleted":""});
};
