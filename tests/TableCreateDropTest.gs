function TableCreateDropTest() {
	// Create Unit Test
	var unit = new UnitTest("Database tables");
	
	// Add Tests
	unit.add("Create new table", function() {
		this.assertEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
		gscript.Database.create("test_table", function(table) { /* table */ });
		this.assertNotEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
	});
	
	unit.add("Create existing table", function() {
		this.assertNotEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
		try {
			gscript.Database.create("test_table", function(table) { /* table */ });
		} catch( error ) {
			this.assertEquals(error.constructor, gscript.TableExistsError);
		}
	});
	
	unit.add("Drop existing table", function() {
		this.assertNotEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
		gscript.Database.drop("test_table");
		this.assertEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
	});
	
	unit.add("Drop non-existing table", function() {
		this.assertEquals(gscript.SPREADSHEET.getSheetByName("test_table"), null);
		var error = null;
		try {
			gscript.Database.drop("test_table");
		} catch( e ) {
			error = e;
		}
		this.assertNotEquals(error, null);
		this.assertEquals(error.constructor, gscript.TableNotFoundError);
	});
	
	// Run and return results
	unit.run(); return unit;
}
