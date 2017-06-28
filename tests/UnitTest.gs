gscript.load(PropertiesService.getScriptProperties().getProperties());

// ==================================================
//  RUN TESTS
// ==================================================
function TEST() {
	var tests = [TableCreateDropTest, TableFieldsTest, TableCRUDTest, ModelCRUDTest, ModelEventsTest];
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

// ==================================================
//  UNIT TEST CORE
// ==================================================
/**
 * Define the Unit Test core
 * 
 * @constructor
 * @param {string} unit_name
 */
function UnitTest( unit_name ) {
	/**
	 * Test definition
     * 
     * @constructor
	 * @param {string} name The Test name
	 * @param {function} test The Test function
	 */
	var Test = function Test(name, test) {
		this.name = name;
		this.test = test;
		this.result = {};
		
		this.assertEquals = function(value, expected) {
			if( value!==expected )
				throw new AssertionError(this.name, "Expected " + expected + ", but was " + value);
		};
		
		this.assertNotEquals = function(value, unexpected) {
			if( value===unexpected )
				throw new AssertionError(this.name, "Unexpected " + value);
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
	};
	
	this.name   = unit_name;
	this.tests  = [];
	this.tested = false;
	
	/**
	 * Add a new Test
	 * @param {string} name The Test name
	 * @param {function} test The Test function
	 */
	this.add = function(name, test) { this.tests.push( new Test(name, test) ); };
	
	/**
	 * Runs the Unit
	 */
	this.setup = function() {}; this.close = function() {};
	this.run   = function() { this.setup(); this.tests.forEach(function(test) { test.run(); }); this.tested = true; this.close(); };
	
	var AssertionError = function AssertionError(test, message) {
		this.name    = "AssertionError";
		this.test    = test;
		this.message = message;
		this.stack   = (new Error).stack;
	};
	AssertionError.prototype = Object.create(Error.prototype);
	AssertionError.prototype.constructor = AssertionError;
}
