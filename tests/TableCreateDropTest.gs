function TableCreateDropTest() {
	// Create Unit Test
	var unit = new UnitTest("Database tables");
	
	// Add Tests
	unit.add("Create new table", function() {
		this.assertEquals( $SHEET.getSheetByName("test_table"), null );
		Database.create("test_table", function(table) {
			table.primary("id");
			table.timestamps();
		});
		this.assertNotEquals( $SHEET.getSheetByName("test_table"), null );
	});
	
	unit.add("Create existing table", function() {
		this.assertNotEquals( $SHEET.getSheetByName("test_table"), null );
		try {
			Database.create("test_table", function(table) {
				table.primary("id");
				table.timestamps();
			});
		} catch( error ) {
			this.assertTrue(error instanceof TableExistsError);
		}
	});
	
	unit.add("Drop existing table", function() {
		this.assertNotEquals( $SHEET.getSheetByName("test_table"), null );
		Database.drop("test_table");
		this.assertEquals( $SHEET.getSheetByName("test_table"), null );
	});
	
	unit.add("Drop non-existing table", function() {
		this.assertEquals( $SHEET.getSheetByName("test_table"), null );
		var error = null;
		try {
			Database.drop("test_table");
		} catch( e ) {
			error = e;
		}
		this.assertNotEquals( error, null );
		this.assertTrue(error instanceof TableNotFoundError);
	});
	
	// Run and show results
	unit.run(); unit.exportHTML(true);
}
