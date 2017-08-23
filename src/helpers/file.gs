// ==================================================
//  FILE HELPERS
// ==================================================
Folder = {}; File = {};

/**
 * Get a Folder using Drive ROOT folder as filesystem
 * - If the route Folders doesn't exist, they will be created in sequence
 * 
 * @param {string} route The Folder route
 * @return {Folder} The Folder object
 */
Folder.get = function( route ) {
	if( route==="" )
		return ROOT;
	var folder = DriveApp.getFolderById(ROOT.getId());
	route.split("/").forEach(function(f) {
		var folders = folder.getFoldersByName(f);
		if( folders.hasNext() )
			folder = folders.next();
		else
			folder = folder.createFolder(f);
	});
	return folder;
};

/**
 * Get a File using Drive ROOT folder as filesystem
 * 
 * @param {string} route The File route
 * @return {File} The File object
 * @throws {FileNotFoundError} If File doesn't exist
 */
File.get = function( route ) {
	var folder = Folder.get(route.split("/").slice(0, -1).join("/"));
	var files = folder.getFilesByName(route.split("/").slice(-1)[0]);
	if( !files.hasNext() )
		throw new FileNotFoundError;
	return files.next();
};

/**
 * Read a File object data
 * 
 * @param {string} route The File route
 * @return {string} The File data as string
 * @throws {FileNotFoundError} If File doesn't exist
 */
File.read = function( route ) {
	var file = File.get( route );
	return file.getBlob().getDataAsString();
};

/**
 * Write to a File object
 * 
 * @param {string} route The File route
 * @param {string} data The data to write
 * @param {boolean=} append To append the data, instead of overwriting
 */
File.write = function( route, data, append ) {
	if( !/\n$/.test(data) )
		data += "\n";
	var file;
	try {
		file = File.get( route );
	} catch( error ) {
		var folder = Folder.get(route.split("/").slice(0, -1).join("/"));
		file = folder.createFile(route.split("/").slice(-1)[0], "");
	}
	if( append )
		data = File.read( route ) + data;
	file.setContent(data);
};

// ==================================================
//  FILE ERRORS
// ==================================================
FileNotFoundError = function() {
	this.name    = "FileNotFoundError";
	this.stack   = (new Error).stack;
};
FileNotFoundError.prototype = Object.create(Error.prototype);
FileNotFoundError.prototype.constructor = FileNotFoundError;
