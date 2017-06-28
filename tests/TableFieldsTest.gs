function TableFieldsTest() {
	// Create Unit Test
	var unit = new UnitTest("Table fields");
	unit.setup = function() {
		if( gscript.SPREADSHEET.getSheetByName("test_table")!==null )
			gscript.Database.drop("test_table");
	};
	
	// Add Tests
	unit.add("Primary Key field", function() {
		gscript.Database.create("test_table", function(table) {
			table.primary("test_primary");
		});
		var sheet = gscript.SPREADSHEET.getSheetByName("test_table"), cell;
		
		cell = sheet.getRange(1, sheet.getMaxColumns(), 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_primary");
		this.assertEquals(cell.getNotes()[0][0], "hex,10\nprimary");
		gscript.Database.drop("test_table");
	});
	
	unit.add("Existing Primary Key field", function() {
		try {
			gscript.Database.create("test_table", function(table) {
				table.primary("test_primary");
				table.primary("test_primary_2");
			});
		} catch( error ) {
			this.assertEquals(error.constructor, gscript.TableIntegrityError);
			this.assertEquals(error.message, "Table has a Primary Key already");
		}
		gscript.Database.drop("test_table");
	});
	
	unit.add("String fields", function() {
		gscript.Database.create("test_table", function(table) {
			table.string("test_string");
			table.string("test_string_length", 25);
		});
		var sheet = gscript.SPREADSHEET.getSheetByName("test_table"), cell;
		
		cell = sheet.getRange(1, sheet.getMaxColumns()-1, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string");
		this.assertEquals(cell.getNotes()[0][0], "string");
		
		cell = sheet.getRange(1, sheet.getMaxColumns(), 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string_length");
		this.assertEquals(cell.getNotes()[0][0], "string,25");
		gscript.Database.drop("test_table");
	});
	
	unit.add("Existing field", function() {
		try {
			gscript.Database.create("test_table", function(table) {
				table.string("test_string");
				table.string("test_string");
			});
		} catch( error ) {
			this.assertEquals(error.constructor, gscript.TableIntegrityError);
			this.assertEquals(error.message, "Table has a Field with the same name");
		}
		gscript.Database.drop("test_table");
	});
	
	unit.add("Field tags", function() {
		gscript.Database.create("test_table", function(table) {
			table.string("test_string_unique").unique();
			table.string("test_string_nullable").nullable();
		});
		var sheet = gscript.SPREADSHEET.getSheetByName("test_table"), cell;
		
		cell = sheet.getRange(1, sheet.getMaxColumns()-1, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string_unique");
		this.assertEquals(cell.getNotes()[0][0], "string\nunique");
		
		cell = sheet.getRange(1, sheet.getMaxColumns(), 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string_nullable");
		this.assertEquals(cell.getNotes()[0][0], "string\nnullable");
		gscript.Database.drop("test_table");
	});
	
	// Run and return results
	unit.run(); return unit;
}
