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
	this.add = function(name, test) { this.tests.push( new Test(name, test) ); }
	
	/**
	 * Runs the Unit
	 */
	this.run = function() { this.tests.forEach(function(test) { test.run(); }); this.tested = true; }
	
	/**
	 * Export Unit to HTML
	 * @param show      - Optional. True, to show a modal in the Spreadsheet.
     */
	this.exportHTML = function( show ) {
		if( !this.tested )
			return "";
		
		var css = [
			"<style type=\"text/css\">* { font-size:14px; font-family:sans-serif; } pre, pre * { font-size:13px; font-family:monospace; } ",
			"ul { list-style:none; padding-left:25px; } ul.results li { width:125px; display:inline-block; } ul:not(.results) { max-height:425px; overflow-x:hidden; overflow-y:auto; } li.result:before { content:\"\"; width:25px; height:25px; margin-left:-25px; float:left; display:block; } li.result span { line-height:25px; } li.result pre { margin-top:0px; } ",
			"li.result.pass:before { background:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='25' height='25'><defs><radialGradient id='radial' cx='40%' cy='40%' r='40%' fx='25%' fy='25%'><stop offset='0%' style='stop-color:#fff;'/><stop offset='100%' style='stop-color:#0a0;'/></radialGradient></defs><circle cx='12.5' cy='12.5' r='7.5' fill='url(#radial)'></circle></svg>\"); } ",
			"li.result.fail:before { background:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='25' height='25'><defs><radialGradient id='radial' cx='40%' cy='40%' r='40%' fx='25%' fy='25%'><stop offset='0%' style='stop-color:#fff;'/><stop offset='100%' style='stop-color:#c00;'/></radialGradient></defs><circle cx='12.5' cy='12.5' r='7.5' fill='url(#radial)'></circle></svg>\"); } ",
			"li.result.error:before { background:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='25' height='25'><defs><radialGradient id='radial' cx='40%' cy='40%' r='40%' fx='25%' fy='25%'><stop offset='0%' style='stop-color:#fff;'/><stop offset='100%' style='stop-color:#666;'/></radialGradient></defs><circle cx='12.5' cy='12.5' r='7.5' fill='url(#radial)'></circle></svg>\"); }</style>"
		].join("");
		
		var totals = [
			"<ul class=\"results\"><li class=\"result pass\"><span><b>Passed:</b> ",
			this.tests.filter(function(test) { return test.result.outcome=="PASS"; }).length + "</span></li>",
			"<li class=\"result fail\"><span><b>Failed:</b> ",
			this.tests.filter(function(test) { return test.result.outcome=="FAIL"; }).length + "</span></li>",
			"<li class=\"result error\"><span><b>Errors:</b> ",
			this.tests.filter(function(test) { return test.result.outcome=="ERROR"; }).length + "</span></li></ul>",
		].join("");
		var results = "<ul>" + this.tests.map(function(test) { return test.parseHTML(); }).join("") + "</ul>";
		
		var html = css + totals + results;
		if( show ) {
			var content = HtmlService.createHtmlOutput(html).setWidth(500).setHeight(500);
			SpreadsheetApp.getUi().showModalDialog(content, "Test results - " + this.name);
		}
		return html;
	}
	
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
