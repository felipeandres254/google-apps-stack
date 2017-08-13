// ==================================================
//  Google Script Backend
//  Author:  Andrés Felipe Torres (@felipeandres254)
//  Version: v0.3
//  URL:     github.com/felipeandres254/gscript
// ==================================================

/**
 * The global configuration of the project
 * @type {object}
 */
CONFIG = {};

/**
 * The main Spreadsheet to use as Database
 * @type {Spreadsheet}
 */
SPREADSHEET = null;

/**
 * The root Folder to use as filesystem
 * @type {Folder}
 */
ROOT = null;

/**
 * Load configuration from Script Properties
 * - Configure main Spreadsheet for Database
 * - Configure root Folder for Files
 * 
 * @param {object} properties The Script Properties
 * @return {string} A command to save the Database ID
 */
function LOAD( properties ) {
	CONFIG = Object.keys(properties).reduce(function(config, key) {
		key.split(".").slice(0, -1).forEach(function(part, idx) {
			var k = key.split(".").splice(0, idx+1).join(".");
			if( !eval("config." + k) )
				eval("config." + k + " = {}");
		});
		eval("config." + key + " = " + properties[key]); return config;
	}, {});
	
	ROOT = DriveApp.getFileById(ScriptApp.getScriptId()).getParents().next();
	try { DriveApp.getFileById(CONFIG.database); }
	catch(e) { delete CONFIG.database; }
	
	if( !CONFIG.database ) {
		CONFIG.database = SpreadsheetApp.create("GScript DB", 1, 1).getId();
		var file = DriveApp.getFileById(CONFIG.database);
		var source = file.getParents().next();
		ROOT.addFile(file); source.removeFile(file);
		
		// Placeholder table
		SpreadsheetApp.openById(CONFIG.database).getSheetByName("Sheet1").setName(".");
	}
	SPREADSHEET = SpreadsheetApp.openById(CONFIG.database);
	return [
		"PropertiesService.getScriptProperties().setProperty('database', JSON.stringify(gscript.CONFIG.database))",
		"function get(request) { return gscript.Route.match(request); }",
		"function post(request) { return gscript.Route.match(request); }",
		"function doGet(request) { return gscript.Route.serve(request); }",
		"function doPost(request) { var response = JSON.stringify(gscript.Route.match(request))",
		"return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.JSON); }"
	].join("; ");
}
