function ModelEventsTest() {
	// Create Unit Test
	var unit = new UnitTest("Model CRUD");
	unit.setup = function() {
		if( gscript.SPREADSHEET.getSheetByName("test_table")!==null )
			gscript.Database.drop("test_table");
		gscript.Database.create("eventlogs", function(table) {
			table.string("model");
			table.string("type");
		});
	};
	unit.close = function() {
		if( gscript.SPREADSHEET.getSheetByName("test_table")!==null )
			gscript.Database.drop("test_table");
		if( gscript.SPREADSHEET.getSheetByName("eventlogs")!==null )
			gscript.Database.drop("eventlogs");
	};
	
	// Add Tests
	unit.add("Create event flow", function() {
		this.assertEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
		
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			gscript.Model.call(this, data);
		}
		gscript.Model.init(TestModel, function(table) {
			table.primary("id");
			table.string("email").unique();
			table.string("test_field").nullable();
		});
		TestModel.prototype.before_save = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"before_save"});
		};
		TestModel.prototype.before_create = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"before_create"});
		};
		TestModel.prototype.after_create = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"after_create"});
		};
		TestModel.prototype.after_save = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"after_save"});
		};
		
		this.assertNotEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
		var model = new TestModel({"email":"test@test.com"});
		model.save();
		
		var rows;
		rows = gscript.Database.table("eventlogs").get();
		this.assertEquals(rows.length, 4);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").get();
		this.assertEquals(rows.length, 4);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "before_save").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "before_create").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "after_create").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "after_save").get();
		this.assertEquals(rows.length, 1);
	});
	
	unit.add("Update event flow", function() {
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			gscript.Model.call(this, data);
		}
		gscript.Model.init(TestModel, function(table) { /* table */ });
		TestModel.prototype.before_save = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"before_save"});
		};
		TestModel.prototype.before_update = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"before_update"});
		};
		TestModel.prototype.after_update = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"after_update"});
		};
		TestModel.prototype.after_save = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"after_save"});
		};
		
		var model = TestModel.where("email", "=", "test@test.com").get()[0];
		model.data.test_field = "test_value";
		model.save();
		
		var rows;
		rows = gscript.Database.table("eventlogs").get();
		this.assertEquals(rows.length, 8);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").get();
		this.assertEquals(rows.length, 8);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "before_save").get();
		this.assertEquals(rows.length, 2);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "before_update").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "after_update").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "after_save").get();
		this.assertEquals(rows.length, 2);
	});
	
	unit.add("Removing event flow", function() {
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			gscript.Model.call(this, data);
		}
		gscript.Model.init(TestModel, function(table) { /* table */ });
		TestModel.prototype.before_remove = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"before_remove"});
		};
		TestModel.prototype.after_remove = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"after_remove"});
		};
		
		TestModel.where("email", "~=", /^test2@/).remove(true);
		this.assertEquals(TestModel.count(), 0);
		
		var rows;
		rows = gscript.Database.table("eventlogs").get();
		this.assertEquals(rows.length, 10);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").get();
		this.assertEquals(rows.length, 10);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "before_remove").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "after_remove").get();
		this.assertEquals(rows.length, 1);
	});
	
	// Run and return results
	unit.run(); return unit;
}
