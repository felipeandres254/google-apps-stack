function ModelEventsTest() {
	// Create Unit Test
	var unit = new UnitTest("Model CRUD");
	unit.setup = function() {
		if( $SS.getSheetByName("test_table")!==null )
			Database.drop("test_table");
		Database.create("eventlogs", function(table) {
			table.string("model");
			table.string("type");
		});
	};
	unit.close = function() {
		if( $SS.getSheetByName("test_table")!==null )
			Database.drop("test_table");
		if( $SS.getSheetByName("eventlogs")!==null )
			Database.drop("eventlogs");
	};
	
	// Add Tests
	unit.add("Creating event flow", function() {
		this.assertEquals($SS.getSheetByName("test_table"), null);
		
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			Model.call(this, data);
		}
		Model.init(TestModel, function(table) {
			table.primary("id");
			table.string("email").unique();
		});
		TestModel.prototype.saving = function() {
			Database.table("eventlogs").insert({"model":"TestModel", "type":"saving"});
		};
		TestModel.prototype.creating = function() {
			Database.table("eventlogs").insert({"model":"TestModel", "type":"creating"});
		};
		TestModel.prototype.created = function() {
			Database.table("eventlogs").insert({"model":"TestModel", "type":"created"});
		};
		TestModel.prototype.saved = function() {
			Database.table("eventlogs").insert({"model":"TestModel", "type":"saved"});
		};
		
		this.assertNotEquals($SS.getSheetByName("test_table"), null);
		var model = new TestModel({"email":"test@test.com"});
		model.save();
		
		var rows;
		rows = Database.table("eventlogs").get();
		this.assertEquals(rows.length, 4);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").get();
		this.assertEquals(rows.length, 4);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saving").get();
		this.assertEquals(rows.length, 1);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "creating").get();
		this.assertEquals(rows.length, 1);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "created").get();
		this.assertEquals(rows.length, 1);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saved").get();
		this.assertEquals(rows.length, 1);
	});
	
	unit.add("Updating event flow", function() {
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			Model.call(this, data);
		}
		Model.init(TestModel, function(table) { /* table */ });
		TestModel.prototype.saving = function() {
			Database.table("eventlogs").insert({"model":"TestModel", "type":"saving"});
		};
		TestModel.prototype.updating = function() {
			Database.table("eventlogs").insert({"model":"TestModel", "type":"updating"});
		};
		TestModel.prototype.updated = function() {
			Database.table("eventlogs").insert({"model":"TestModel", "type":"updated"});
		};
		TestModel.prototype.saved = function() {
			Database.table("eventlogs").insert({"model":"TestModel", "type":"saved"});
		};
		
		var model = TestModel.where("email", "=", "test@test.com").get()[0];
		model.data.email = "test2@test.com";
		model.save();
		
		var rows;
		rows = Database.table("eventlogs").get();
		this.assertEquals(rows.length, 8);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").get();
		this.assertEquals(rows.length, 8);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saving").get();
		this.assertEquals(rows.length, 2);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "updating").get();
		this.assertEquals(rows.length, 1);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "updated").get();
		this.assertEquals(rows.length, 1);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saved").get();
		this.assertEquals(rows.length, 2);
	});
	
	unit.add("Removing event flow", function() {
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			Model.call(this, data);
		}
		Model.init(TestModel, function(table) { /* table */ });
		TestModel.prototype.removing = function() {
			Database.table("eventlogs").insert({"model":"TestModel", "type":"removing"});
		};
		TestModel.prototype.removed = function() {
			Database.table("eventlogs").insert({"model":"TestModel", "type":"removed"});
		};
		
		TestModel.where("email", "~=", /^test2@/).remove(true);
		this.assertEquals(TestModel.count(), 0);
		
		var rows;
		rows = Database.table("eventlogs").get();
		this.assertEquals(rows.length, 10);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").get();
		this.assertEquals(rows.length, 10);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saving").get();
		this.assertEquals(rows.length, 2);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "removing").get();
		this.assertEquals(rows.length, 1);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "removed").get();
		this.assertEquals(rows.length, 1);
		rows = Database.table("eventlogs").where("model", "=", "TestModel").where("type", "=", "saved").get();
		this.assertEquals(rows.length, 2);
	});
	
	// Run and return results
	unit.run(); return unit;
}
