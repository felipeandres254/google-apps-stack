// ==================================================
//  STRING HELPERS
// ==================================================
/**
 * Get the SHA1 digest of a String
 * 
 * @return {string} The SHA1 digest of the String
 */
String.prototype.sha1 = function() {
	var hash = "", raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, this);
	for( var i=0; i<raw.length; i++ ) {
		var txt = raw[i] + (raw[i]<0 ? 256 : 0);
		hash += (txt.toString(16).length==1 ? "0" : "") + txt.toString(16);
	}
	return hash;
};
