// ==================================================
//  UNIT TEST CORE
// ==================================================
function UnitTest( unit_name ) {
	/**
	 * Test definition
	 * @param name      - The Test name
	 * @param test      - The Test function
	 */
	var Test = function Test(name, test) {
		this.name = name;
		this.test = test;
		this.result = {};
		
		this.assertTrue = function(value) {
			if( !value )
				throw new AssertionError(value, true, "Expected true");
		};
		
		this.assertFalse = function(value) {
			if( value )
				throw new AssertionError(value, true, "Expected false");
		};
		
		this.assertEquals = function(value, expected) {
			if( expected!==value )
				throw new AssertionError(value, expected, "Expected " + expected + ", but was " + value);
		};
		
		this.assertNotEquals = function(value, expected) {
			if( expected===value )
				throw new AssertionError(value, expected, "Unexpected equality on given value (was " + value + ")");
		};
		
		this.run = function() {
			try {
				this.test(); this.result = {"outcome":"PASS"};
			} catch( error ) {
				if( error instanceof AssertionError )
					this.result = {"outcome":"FAIL", "message":error.message};
				else
					this.result = {"outcome":"ERROR", "error":error};
			}
		};
		
		this.parseHTML = function() {
			if( !this.result.outcome )
				return "";
			var html = "<li class=\"result " + this.result.outcome.toLowerCase()  + "\">";
			html += "<span><b>" + this.name + "</b> " + (this.result.message ? this.result.message : "") + "</span>";
			if( this.result.outcome=="ERROR" ) {
				html += "<pre><b>" + this.result.error.name + "</b> " + this.result.error.message;
				html += "<br>" + (this.result.error.stack ? this.result.error.stack.replace(/\n/g, "<br>").replace(/\t/g, "  ") : "") + "</pre>";
			}
			return html + "</li>";
		};
	};
	
	this.name   = unit_name;
	this.tests  = [];
	this.tested = false;
	
	/**
	 * Adds a new Test
	 * @param name      - The Test name
	 * @param test      - The Test function
	 */
	this.add = function(name, test) { this.tests.push( new Test(name, test) ); };
	
	/**
	 * Runs the Unit
	 */
	this.setup = function() {}; this.close = function() {};
	this.run   = function() { this.setup(); this.tests.forEach(function(test) { test.run(); }); this.tested = true; this.close(); };
	
	var AssertionError = function AssertionError(value, expected, message) {
		this.name     = "AssertionError";
		this.expected = expected;
		this.value    = value;
		this.message  = message;
		this.stack    = (new Error).stack;
	};
	AssertionError.prototype = Object.create(Error.prototype);
	AssertionError.prototype.constructor = AssertionError;
}

// ==================================================
//  RUN TESTS MAIN FUNCTION
// ==================================================
function RunTests() {
	var tests = [TableCreateDropTest, TableFieldsTest, TableCRUDTest, ModelCRUDTest];
	tests = tests.map(function(unit) { return unit(); });
	
	var totals = {"pass":0, "fail":0, "error":0};
	tests.forEach(function(unit) {
		totals.pass  += unit.tests.filter(function(test) { return test.result.outcome=="PASS"; }).length;
		totals.fail  += unit.tests.filter(function(test) { return test.result.outcome=="FAIL"; }).length;
		totals.error += unit.tests.filter(function(test) { return test.result.outcome=="ERROR"; }).length;
	});
	
	Logger.log("Passed: " + totals.pass + " // Failed: " + totals.fail + " // Errors: " + totals.error);
	tests.forEach(function(unit) {
		unit.tests.forEach(function(test) {
			if( test.result.outcome!=="PASS" ) {
				if( test.result.outcome==="ERROR" && test.result.error.stack )
					test.result.error.stack = test.result.error.stack.replace(/\t/g, "").split("\n");
				Logger.log( test.name + " " + JSON.stringify(test.result, null, 2) );
			}
		});
	});
}
