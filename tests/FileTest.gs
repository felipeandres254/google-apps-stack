function FileTest() {
	// Create Unit Test
	var unit = new UnitTest("File");
	unit.setup = function() {
		if( !gscript.ROOT.getFoldersByName(".tmp").hasNext() )
			gscript.ROOT.createFolder(".tmp");
		var folder = gscript.ROOT.getFoldersByName(".tmp").next();
		folder.createFile("temp.txt", "test");
	};
	unit.close = function() {
		gscript.ROOT.getFoldersByName(".tmp").next().setTrashed(true);
	};
	
	// Add Tests
	unit.add("Read file", function() {
		this.assertEquals(gscript.File.read(".tmp/temp.txt"), "test");
	});
	
	unit.add("Read non-existing file", function() {
		try {
			gscript.File.read(".tmp/temp2.txt");
		} catch( error ) {
			this.assertEquals(error.constructor, gscript.FileNotFoundError);
		}
	});
	
	unit.add("Create new file", function() {
		var folder = gscript.ROOT.getFoldersByName(".tmp").next();
		gscript.File.write(".tmp/temp2.txt", "test #3");
		
		this.assertEquals(folder.getFilesByName("temp2.txt").hasNext(), true);
		this.assertEquals(gscript.File.read(".tmp/temp2.txt"), "test #3\n");
	});
	
	unit.add("Append to file", function() {
		var folder = gscript.ROOT.getFoldersByName(".tmp").next();
		gscript.File.write(".tmp/temp2.txt", "test #4", true);
		
		this.assertEquals(folder.getFilesByName("temp2.txt").hasNext(), true);
		this.assertEquals(gscript.File.read(".tmp/temp2.txt"), "test #3\ntest #4\n");
	});
	
	// Run and return results
	unit.run(); return unit;
}
