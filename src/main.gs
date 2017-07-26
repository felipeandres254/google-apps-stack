// ==================================================
//  Google Script Backend
//  Author:  Andrés Felipe Torres (@felipeandres254)
//  Version: v0.2
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
 */
function load( properties ) {
	CONFIG = Object.keys(properties).reduce(function(config, key) {
		key.split(".").slice(0, -1).forEach(function(part, idx) {
			var k = key.split(".").splice(0, idx+1).join(".");
			if( !eval("config." + k) )
				eval("config." + k + " = {}");
		});
		eval("config." + key + " = " + properties[key]); return config;
	}, {});
	
	SPREADSHEET = CONFIG.database ? SpreadsheetApp.openById(CONFIG.database) : SpreadsheetApp.getActiveSpreadsheet();
	ROOT = DriveApp.getFileById(ScriptApp.getScriptId()).getParents().next();
};
