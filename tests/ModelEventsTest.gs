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
	unit.add("Creating event flow", function() {
		this.assertEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
		
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			gscript.Model.call(this, data);
		}
		gscript.Model.init(TestModel, function(table) {
			table.primary("id");
			table.string("email").unique();
		});
		TestModel.prototype.saving = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"saving"});
		};
		TestModel.prototype.creating = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"creating"});
		};
		TestModel.prototype.created = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"created"});
		};
		TestModel.prototype.saved = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"saved"});
		};
		
		this.assertNotEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
		var model = new TestModel({"email":"test@test.com"});
		model.save();
		
		var rows;
		rows = gscript.Database.table("eventlogs").get();
		this.assertEquals(rows.length, 4);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").get();
		this.assertEquals(rows.length, 4);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saving").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "creating").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "created").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saved").get();
		this.assertEquals(rows.length, 1);
	});
	
	unit.add("Updating event flow", function() {
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			gscript.Model.call(this, data);
		}
		gscript.Model.init(TestModel, function(table) { /* table */ });
		TestModel.prototype.saving = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"saving"});
		};
		TestModel.prototype.updating = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"updating"});
		};
		TestModel.prototype.updated = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"updated"});
		};
		TestModel.prototype.saved = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"saved"});
		};
		
		var model = TestModel.where("email", "=", "test@test.com").get()[0];
		model.email = "test2@test.com";
		model.save();
		
		var rows;
		rows = gscript.Database.table("eventlogs").get();
		this.assertEquals(rows.length, 8);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").get();
		this.assertEquals(rows.length, 8);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saving").get();
		this.assertEquals(rows.length, 2);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "updating").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "updated").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saved").get();
		this.assertEquals(rows.length, 2);
	});
	
	unit.add("Removing event flow", function() {
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			gscript.Model.call(this, data);
		}
		gscript.Model.init(TestModel, function(table) { /* table */ });
		TestModel.prototype.removing = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"removing"});
		};
		TestModel.prototype.removed = function() {
			gscript.Database.table("eventlogs").insert({"model":"TestModel", "type":"removed"});
		};
		
		TestModel.where("email", "~=", /^test2@/).remove(true);
		this.assertEquals(TestModel.count(), 0);
		
		var rows;
		rows = gscript.Database.table("eventlogs").get();
		this.assertEquals(rows.length, 10);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").get();
		this.assertEquals(rows.length, 10);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saving").get();
		this.assertEquals(rows.length, 2);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "removing").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "removed").get();
		this.assertEquals(rows.length, 1);
		rows = gscript.Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saved").get();
		this.assertEquals(rows.length, 2);
	});
	
	// Run and return results
	unit.run(); return unit;
}
