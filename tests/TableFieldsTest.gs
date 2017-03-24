function TableFieldsTest() {
	// Create Unit Test
	var unit = new UnitTest("Table fields");
	unit.setup = function() {
		if( $SHEET.getSheetByName("test_table")!==null )
			Database.drop("test_table");
		Database.create("test_table", function(table) {});
	};
	unit.close = function() {
		Database.drop("test_table");
	};
	
	// Add Tests
	unit.add("Primary Key field", function() {
		Database.table("test_table", function(table) {
			table.primary("test_primary");
		});
		var sheet = $SHEET.getSheetByName("test_table"), cell;
		
		cell = sheet.getRange(1, sheet.getMaxColumns(), 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_primary");
		this.assertEquals(cell.getNotes()[0][0], "hex,10\nprimary");
	});
	
	unit.add("Existing Primary Key field", function() {
		try {
			Database.table("test_table", function(table) {
				table.primary("test_primary_2");
			});
		} catch( error ) {
			this.assertTrue(error instanceof TableIntegrityError);
			this.assertEquals(error.message, "Table has a Primary Key already");
		}
	});
	
	unit.add("String fields", function() {
		Database.table("test_table", function(table) {
			table.string("test_string");
			table.string("test_string_length", 25);
		});
		var sheet = $SHEET.getSheetByName("test_table"), cell;
		
		cell = sheet.getRange(1, sheet.getMaxColumns()-1, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string");
		this.assertEquals(cell.getNotes()[0][0], "string");
		
		cell = sheet.getRange(1, sheet.getMaxColumns(), 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string_length");
		this.assertEquals(cell.getNotes()[0][0], "string,25");
	});
	
	unit.add("Existing field", function() {
		try {
			Database.table("test_table", function(table) {
				table.string("test_string");
			});
		} catch( error ) {
			this.assertTrue(error instanceof TableIntegrityError);
			this.assertEquals(error.message, "Field 'test_string' exists already");
		}
	});
	
	unit.add("Field tags", function() {
		Database.table("test_table", function(table) {
			table.string("test_string_unique").unique();
			table.string("test_string_nullable").nullable();
		});
		var sheet = $SHEET.getSheetByName("test_table"), cell;
		
		cell = sheet.getRange(1, sheet.getMaxColumns()-1, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string_unique");
		this.assertEquals(cell.getNotes()[0][0], "string\nunique");
		
		cell = sheet.getRange(1, sheet.getMaxColumns(), 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string_nullable");
		this.assertEquals(cell.getNotes()[0][0], "string\nnullable");
	});
	
	// Run and show results
	unit.run(); unit.exportHTML(true);
}
