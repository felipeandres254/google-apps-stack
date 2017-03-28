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
			} catch( error if error instanceof AssertionError ) {
				this.result = {"outcome":"FAIL", "message":error.message};
			} catch( e ) {
				this.result = {"outcome":"ERROR", "error":e};
			}
		};
		
		this.parseHTML = function() {
			if( !this.result.outcome )
				return "";
			var html = "<li class=\"result " + this.result.outcome.toLowerCase()  + "\">";
			html += "<span><b>" + this.name + "</b> " + (this.result.message ? this.result.message : "") + "</span>";
			if( this.result.outcome=="ERROR" ) {
				html += "<pre><b>" + this.result.error.name + "</b> " + this.result.error.message;
				html += "<br>" + this.result.error.stack.replace(/\n/g, "<br>").replace(/\t/g, "  ") + "</pre>";
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
	}
	AssertionError.prototype = Object.create(Error.prototype);
	AssertionError.prototype.constructor = AssertionError;
}

function RunTests() {
	var tests = [TableCreateDropTest, TableFieldsTest, TableCRUDTest];
	tests = tests.map(function(unit) { return unit(); });
	
	var css = [
		"<style type=\"text/css\">* { font-size:14px; font-family:sans-serif; } pre, pre * { font-size:10px; font-family:monospace; } .test-results { margin:5px 0px; } hr { width:90%; margin:15px 5%; border:none; border-top:1px solid gray; } ul { list-style:none; padding-left:20px; } ",
		"ul#totals li { width:125px; display:inline-block; } div#results { max-height:425px; overflow-x:hidden; overflow-y:auto; } li.result:before { content:\"\"; width:20px; height:20px; margin-left:-20px; float:left; display:block; } li.result span { line-height:20px; } div#results li.result span, div#results li.result span b { font-size:12px; } li.result pre { margin-top:0px; } ",
		"li.result.pass:before { background:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><defs><radialGradient id='radial' cx='40%' cy='40%' r='40%' fx='25%' fy='25%'><stop offset='0%' style='stop-color:#fff;'/><stop offset='100%' style='stop-color:#0a0;'/></radialGradient></defs><circle cx='10' cy='10' r='5' fill='url(#radial)'></circle></svg>\"); } ",
		"li.result.fail:before { background:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><defs><radialGradient id='radial' cx='40%' cy='40%' r='40%' fx='25%' fy='25%'><stop offset='0%' style='stop-color:#fff;'/><stop offset='100%' style='stop-color:#c00;'/></radialGradient></defs><circle cx='10' cy='10' r='5' fill='url(#radial)'></circle></svg>\"); } ",
		"li.result.error:before { background:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><defs><radialGradient id='radial' cx='40%' cy='40%' r='40%' fx='25%' fy='25%'><stop offset='0%' style='stop-color:#fff;'/><stop offset='100%' style='stop-color:#666;'/></radialGradient></defs><circle cx='10' cy='10' r='5' fill='url(#radial)'></circle></svg>\"); }</style>"
	].join("");
	
	var totals = {"pass":0, "fail":0, "error":0};
	tests.forEach(function(unit) {
		totals.pass  += unit.tests.filter(function(test) { return test.result.outcome=="PASS"; }).length;
		totals.fail  += unit.tests.filter(function(test) { return test.result.outcome=="FAIL"; }).length;
		totals.error += unit.tests.filter(function(test) { return test.result.outcome=="ERROR"; }).length;
	});
	totals = [
		"<ul id=\"totals\"><li class=\"result pass\"><span><b>Passed:</b> " + totals.pass + "</span></li>",
		"<li class=\"result fail\"><span><b>Failed:</b> " + totals.fail + "</span></li>",
		"<li class=\"result error\"><span><b>Errors:</b> " + totals.error + "</span></li></ul>"
	].join("");
	
	var results = "<div id=\"results\">" + tests.map(function(unit) {
		return "<b>" + unit.name + "</b><ul class=\"test-results\">" + unit.tests.map(function(test) { return test.parseHTML(); }).join("") + "</ul>";
	}).join("<hr>") + "</div>";
	var content = HtmlService.createHtmlOutput(css + totals + results).setWidth(500).setHeight(500);
	SpreadsheetApp.getUi().showModalDialog(content, "Test results");
}
