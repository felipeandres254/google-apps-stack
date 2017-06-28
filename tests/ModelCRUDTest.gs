function ModelCRUDTest() {
	// Create Unit Test
	var unit = new UnitTest("Model CRUD");
	unit.setup = function() {
		if( gscript.SPREADSHEET.getSheetByName("test_table")!==null )
			gscript.Database.drop("test_table");
	};
	unit.close = function() {
		if( gscript.SPREADSHEET.getSheetByName("test_table")!==null )
			gscript.Database.drop("test_table");
	};
	
	// Add Tests
	unit.add("Create new model", function() {
		this.assertEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
		
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			gscript.Model.call(this, data);
		}
		gscript.Model.init(TestModel, function(table) {
			table.primary("id");
			table.string("email").unique();
			table.datetime("deleted").nullable();
		});
		
		this.assertNotEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
	});
	
	unit.add("Save new model", function() {
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			gscript.Model.call(this, data);
		}
		gscript.Model.init(TestModel, function(table) { /* table */ });
		
		var rows;
		rows = gscript.Database.table("test_table").get();
		this.assertEquals(rows.length, 0);
		
		var model = new TestModel({"email":"test@test.com"});
		model.save();
		
		rows = gscript.Database.table("test_table").get();
		this.assertEquals(rows.length, 1);
		this.assertEquals(rows[0].email, "test@test.com");
	});
	
	unit.add("Update existing model", function() {
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			gscript.Model.call(this, data);
		}
		gscript.Model.init(TestModel, function(table) { /* table */ });
		
		var rows;
		rows = gscript.Database.table("test_table").get();
		this.assertEquals(rows.length, 1);
		
		var model = TestModel.where("email", "=", "test@test.com").get()[0];
		model.email = "test2@test.com";
		model.save();
		
		rows = gscript.Database.table("test_table").get();
		this.assertEquals(rows.length, 1);
		this.assertEquals(rows[0].email, "test2@test.com");
	});
	
	unit.add("Read models", function() {
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			gscript.Model.call(this, data);
		}
		gscript.Model.init(TestModel, function(table) { /* table */ });
		
		var model = new TestModel({"email":"test2@test.com"});
		model.save();
		
		this.assertEquals(TestModel.count(), 2);
		this.assertEquals(TestModel.where("email", "~=", /^test2@/).count(), 1);
	});
	
	unit.add("Remove models", function() {
		function TestModel( data ) {
			this.table = "test_table";
			
			// Call superclass constructor
			gscript.Model.call(this, data);
		}
		gscript.Model.init(TestModel, function(table) { /* table */ });
		
		TestModel.where("email", "~=", /^test2@/).remove();
		this.assertEquals(TestModel.count(), 1);
		this.assertEquals(TestModel.removed().count(), 1);
		
		TestModel.removed().where("email", "~=", /^test2@/).restore();
		this.assertEquals(TestModel.count(), 2);
		this.assertEquals(TestModel.removed().count(), 0);
		
		TestModel.where("email", "~=", /^test2@/).remove(true);
		this.assertEquals(TestModel.count(), 1);
		this.assertEquals(TestModel.removed().count(), 0);
	});
	
	// Run and return results
	unit.run(); return unit;
}
