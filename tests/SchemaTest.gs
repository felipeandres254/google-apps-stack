function SchemaTest() {
	// Create Unit Test
	var unit = new UnitTest("Database Schema Test");
	unit.setup = function() {
		if( gscript.SPREADSHEET.getSheetByName("test_table")!==null )
			gscript.Database.drop("test_table");
	};
	unit.close = function() {
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
			table.string("test_hex");
			table.string("test_hex_length", 20);
			table.string("test_num");
			table.string("test_num_length", 15);
			table.string("test_alpha");
			table.string("test_alpha_length", 10);
			table.string("test_alphanum");
			table.string("test_alphanum_length", 5);
		});
		var sheet = gscript.SPREADSHEET.getSheetByName("test_table"), cell;
		
		cell = sheet.getRange(1, 1, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string");
		this.assertEquals(cell.getNotes()[0][0], "string");
		
		cell = sheet.getRange(1, 2, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string_length");
		this.assertEquals(cell.getNotes()[0][0], "string,25");
		
		cell = sheet.getRange(1, 3, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_hex");
		this.assertEquals(cell.getNotes()[0][0], "hex");
		
		cell = sheet.getRange(1, 4, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_hex_length");
		this.assertEquals(cell.getNotes()[0][0], "hex,20");
		
		cell = sheet.getRange(1, 5, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_num");
		this.assertEquals(cell.getNotes()[0][0], "num");
		
		cell = sheet.getRange(1, 6, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_num_length");
		this.assertEquals(cell.getNotes()[0][0], "num,15");
		
		cell = sheet.getRange(1, 7, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_alpha");
		this.assertEquals(cell.getNotes()[0][0], "alpha");
		
		cell = sheet.getRange(1, 8, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_alpha_length");
		this.assertEquals(cell.getNotes()[0][0], "alpha,10");
		
		cell = sheet.getRange(1, 9, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_alphanum");
		this.assertEquals(cell.getNotes()[0][0], "alphanum");
		
		cell = sheet.getRange(1, 10, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_alphanum_length");
		this.assertEquals(cell.getNotes()[0][0], "alphanum,5");
		
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
	
	unit.add("Field attributes", function() {
		gscript.Database.create("test_table", function(table) {
			table.string("test_string_unique").unique();
			table.string("test_string_nullable").nullable();
		});
		var sheet = gscript.SPREADSHEET.getSheetByName("test_table"), cell;
		
		cell = sheet.getRange(1, 1, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string_unique");
		this.assertEquals(cell.getNotes()[0][0], "string\nunique");
		
		cell = sheet.getRange(1, 2, 1, 1);
		this.assertEquals(cell.getValues()[0][0], "test_string_nullable");
		this.assertEquals(cell.getNotes()[0][0], "string\nnullable");
		
		gscript.Database.drop("test_table");
	});
	
	// Run and return results
	unit.run(); return unit;
}
