eval(gscript.LOAD(PropertiesService.getScriptProperties().getProperties()));

// ==================================================
//  RUN TESTS
// ==================================================
function TEST() {
	var tests = [TableCreateDropTest, SchemaTest, TableCRUDTest, ModelCRUDTest, ModelEventsTest, FileTest];
	tests = tests.map(function(unit) { return unit(); });
	
	var totals = {"pass":0, "fail":0, "error":0};
	tests.forEach(function(unit) {
		totals.pass  += unit.tests.filter(function(test) { return test.result.outcome=="PASS"; }).length;
		totals.fail  += unit.tests.filter(function(test) { return test.result.outcome=="FAIL"; }).length;
		totals.error += unit.tests.filter(function(test) { return test.result.outcome=="ERROR"; }).length;
	});
	
	Logger.log("Passed: %s  //  Failed: %s  //  Errors: %s", totals.pass.toString(), totals.fail.toString(), totals.error.toString());
	tests.forEach(function(unit) {
		unit.tests.forEach(function(test) {
			if( test.result.outcome!=="PASS" ) {
				if( test.result.outcome==="ERROR" && test.result.error.stack )
					test.result.error.stack = test.result.error.stack.replace(/\t/g, "").split("\n");
				Logger.log("%s %s", test.name, JSON.stringify(test.result, null, 2) );
			}
		});
	});
}
