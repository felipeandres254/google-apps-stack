function TableCRUDTest() {
	// Create Unit Test
	var unit = new UnitTest("Table CRUD");
	unit.setup = function() {
		if( $SS.getSheetByName("test_table")!==null )
			Database.drop("test_table");
		Database.create("test_table", function(table) {
			table.primary("id");
			table.string("test_string");
			table.string("test_string_length", 15);
			table.string("test_string_unique").unique();
			table.string("test_string_nullable").nullable();
		});
		var sheet = $SS.getSheetByName("test_table");
		sheet.getRange(2, 1, 1, sheet.getMaxColumns()).setValues([["da39a3ee5e", "test", "abcdefghijklmno", "unique", null]]);
	};
	unit.close = function() {
		Database.drop("test_table");
	};
	
	// Add Tests
	unit.add("Read row", function() {
		var rows = Database.table("test_table").get();
		this.assertEquals(rows.length, 1);
		this.assertEquals(rows[0].id, "da39a3ee5e");
		this.assertEquals(rows[0].test_string, "test");
		this.assertEquals(rows[0].test_string_length, "abcdefghijklmno");
		this.assertEquals(rows[0].test_string_unique, "unique");
		this.assertEquals(rows[0].test_string_nullable, "");
	});
	
	unit.add("Insert row", function() {
		Database.table("test_table").insert({
			"id":"e5ee3a93ad",
			"test_string":"test_2",
			"test_string_length":"zyxwvutsrqponml",
			"test_string_unique":"unique_2",
			"test_string_nullable":null
		});
		
		var rows = Database.table("test_table").get();
		this.assertEquals(rows.length, 2);
		this.assertEquals(rows[0].id, "e5ee3a93ad");
		this.assertEquals(rows[0].test_string, "test_2");
		this.assertEquals(rows[0].test_string_length, "zyxwvutsrqponml");
		this.assertEquals(rows[0].test_string_unique, "unique_2");
		this.assertEquals(rows[0].test_string_nullable, "");
	});
	
	unit.add("Update row", function() {
		var row;
		
		Database.table("test_table").where("id", "=", "da39a3ee5e").update({"test_string":"aaaaaaaaaa"});
		row = Database.table("test_table").where("id", "=", "da39a3ee5e").get()[0];
		this.assertEquals(row.test_string, "aaaaaaaaaa");
		
		Database.table("test_table").where("id", "=", "da39a3ee5e").update({"test_string_length":"abcdefghijklmno"});
		row = Database.table("test_table").where("id", "=", "da39a3ee5e").get()[0];
		this.assertEquals(row.test_string_length, "abcdefghijklmno");
		
		Database.table("test_table").where("id", "=", "da39a3ee5e").update({"test_string_unique":"unique_3"});
		row = Database.table("test_table").where("id", "=", "da39a3ee5e").get()[0];
		this.assertEquals(row.test_string_unique, "unique_3");
	});
	
	unit.add("Update row with errors", function() {
		try {
			Database.table("test_table").where("id", "=", "da39a3ee5e").update({"test_string":null});
		} catch( error ) {
			this.assertEquals(error.constructor, FieldValueError);
			this.assertEquals(error.field, "test_string");
		}
		this.assertEquals(Database.table("test_table").get()[1].test_string, "aaaaaaaaaa");
		
		try {
			Database.table("test_table").where("id", "=", "da39a3ee5e").update({"test_string_length":"abc"});
		} catch( error ) {
			this.assertEquals(error.constructor, FieldValueError);
			this.assertEquals(error.field, "test_string_length");
		}
		this.assertEquals(Database.table("test_table").get()[1].test_string_length, "abcdefghijklmno");
	});
	
	unit.add("Delete row", function() {
		var rows = Database.table("test_table").get();
		this.assertEquals(rows.length, 2);
		
		Database.table("test_table").where("id", "=", "e5ee3a93ad").remove();
		rows = Database.table("test_table").get();
		this.assertEquals(rows.length, 1);
		
		Database.table("test_table").where("id", "=", "da39a3ee5e").remove();
		rows = Database.table("test_table").get();
		this.assertEquals(rows.length, 0);
	});
	
	// Run and return results
	unit.run(); return unit;
}
