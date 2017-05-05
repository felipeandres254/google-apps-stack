function TableCreateDropTest() {
	// Create Unit Test
	var unit = new UnitTest("Database tables");
	
	// Add Tests
	unit.add("Create new table", function() {
		this.assertEquals( $SS.getSheetByName("test_table"), null );
		Database.create("test_table", function(table) { /* table */ });
		this.assertNotEquals( $SS.getSheetByName("test_table"), null );
	});
	
	unit.add("Create existing table", function() {
		this.assertNotEquals( $SS.getSheetByName("test_table"), null );
		try {
			Database.create("test_table", function(table) { /* table */ });
		} catch( error ) {
			this.assertTrue(error instanceof TableExistsError);
		}
	});
	
	unit.add("Drop existing table", function() {
		this.assertNotEquals( $SS.getSheetByName("test_table"), null );
		Database.drop("test_table");
		this.assertEquals( $SS.getSheetByName("test_table"), null );
	});
	
	unit.add("Drop non-existing table", function() {
		this.assertEquals( $SS.getSheetByName("test_table"), null );
		var error = null;
		try {
			Database.drop("test_table");
		} catch( e ) {
			error = e;
		}
		this.assertNotEquals( error, null );
		this.assertTrue(error instanceof TableNotFoundError);
	});
	
	// Run and return results
	unit.run(); return unit;
}
