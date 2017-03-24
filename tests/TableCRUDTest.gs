function TableCRUDTest() {
	// Create Unit Test
	var unit = new UnitTest("Table CRUD");
	unit.setup = function() {
		if( $SHEET.getSheetByName("test_table")!==null )
			Database.drop("test_table");
		Database.create("test_table", function(table) {
			table.primary("id");
			table.string("test_string");
			table.string("test_string_length", 15);
			table.string("test_string_unique").unique();
			table.string("test_string_nullable").nullable();
		});
		var sheet = $SHEET.getSheetByName("test_table");
		sheet.getRange(2, 1, 1, sheet.getMaxColumns()).setValues([["da39a3ee5e", "test", "abcdefghijklmno", "unique", null]]);
	};
	unit.close = function() {
		Database.drop("test_table");
	};
	
	// Add Tests
	unit.add("Read row", function() {
		var rows = Table.get("test_table").get();
		this.assertEquals(rows.length, 1);
		this.assertEquals(rows[0].id, "da39a3ee5e");
		this.assertEquals(rows[0].test_string, "test");
		this.assertEquals(rows[0].test_string_length, "abcdefghijklmno");
		this.assertEquals(rows[0].test_string_unique, "unique");
		this.assertEquals(rows[0].test_string_nullable, "NULL");
	});
	
	unit.add("Insert row", function() {
		Table.get("test_table").insert({
			"id":"e5ee3a93ad",
			"test_string":"test_2",
			"test_string_length":"zyxwvutsrqponml",
			"test_string_unique":"unique_2",
			"test_string_nullable":null
		});
		
		var rows = Table.get("test_table").get();
		this.assertEquals(rows.length, 2);
		this.assertEquals(rows[0].id, "e5ee3a93ad");
		this.assertEquals(rows[0].test_string, "test_2");
		this.assertEquals(rows[0].test_string_length, "zyxwvutsrqponml");
		this.assertEquals(rows[0].test_string_unique, "unique_2");
		this.assertEquals(rows[0].test_string_nullable, "");
	});
	
	unit.add("Update row", function() {
		var row;
		
		Table.get("test_table").where("id", "e5ee3a93ad").update({"test_string":"aaaaaaaaaa"});
		row = Table.get("test_table").where("id", "e5ee3a93ad").get()[0];
		this.assertEquals(row.test_string, "aaaaaaaaaa");
		
		Table.get("test_table").where("id", "e5ee3a93ad").update({"test_string_length":"abcdefghijklmno"});
		row = Table.get("test_table").where("id", "e5ee3a93ad").get()[0];
		this.assertEquals(row.test_string_length, "abcdefghijklmno");
		
		Table.get("test_table").where("id", "e5ee3a93ad").update({"test_string_unique":"unique_3"});
		row = Table.get("test_table").where("id", "e5ee3a93ad").get()[0];
		this.assertEquals(row.test_string_unique, "unique_3");
	});
	
	unit.add("Update row with errors", function() {
		try {
			Table.get("test_table").where("id", "e5ee3a93ad").update({"id":"aaaaaaaaaa"});
		} catch( error ) {
			this.assertTrue(error instanceof TableIntegrityError);
			this.assertEquals(error.message, "Can't update Primary Key value");
		}
		
		try {
			Table.get("test_table").where("id", "e5ee3a93ad").update({"test_string":null});
		} catch( error ) {
			this.assertTrue(error instanceof TableFieldError);
			this.assertEquals(error.field, "test_string");
			this.assertEquals(error.message, "Field value is invalid");
		}
		
		try {
			Table.get("test_table").where("id", "e5ee3a93ad").update({"test_string_length":"abc"});
		} catch( error ) {
			this.assertTrue(error instanceof TableFieldError);
			this.assertEquals(error.field, "test_string_length");
			this.assertEquals(error.message, "Field length is invalid");
		}
	});
	
	unit.add("Delete row", function() {
		var rows;
		this.assertEquals(rows.length, 2);
		
		Table.get("test_table").where("id", "e5ee3a93ad").remove();
		rows = Table.get("test_table").get();
		this.assertEquals(rows.length, 1);
		
		Table.get("test_table").where("id", "da39a3ee5e").remove();
		rows = Table.get("test_table").get();
		this.assertEquals(rows.length, 0);
	});
	
	// Run and show results
	unit.run(); unit.exportHTML(true);
}
