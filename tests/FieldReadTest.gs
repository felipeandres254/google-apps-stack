function FieldReadTest() {
	// Create Unit Test
	var unit = new UnitTest("Field Read");
	unit.setup = function() {
		if( gscript.SPREADSHEET.getSheetByName("test_table")!==null )
			gscript.Database.drop("test_table");
		gscript.Database.create("test_table", function(table) {
			table.boolean("test_boolean");
			table.int("test_int");
			table.float("test_float");
		});
		gscript.Database.table("test_table").insert({
			"test_boolean":true,
			"test_int":123456,
			"test_float":parseFloat(Math.PI.toFixed(6))
		});
		gscript.Database.table("test_table").insert({
			"test_boolean":false,
			"test_int":987654,
			"test_float":-parseFloat(Math.E.toFixed(6))
		});
	};
	unit.close = function() {
		gscript.Database.drop("test_table");
	};
	
	// Add Tests
	unit.add("Read fields", function() {
		var data = gscript.Database.table("test_table").get();
		
		this.assertEquals(data[0].test_boolean, false);
		this.assertEquals(data[1].test_boolean, true);
		
		this.assertEquals(data[0].test_int, 987654);
		this.assertEquals(data[1].test_int, 123456);
		
		this.assertEquals(data[0].test_int, -parseFloat(Math.E.toFixed(6)));
		this.assertEquals(data[1].test_int, parseFloat(Math.PI.toFixed(6)));
	});
	
	// Run and return results
	unit.run(); return unit;
}
