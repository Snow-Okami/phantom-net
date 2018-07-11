module.exports = {
	/*
		This will make string comparison between two string regardless of string case.
	*/
	compIgnoreCase : ( str1, str2) => {
		return str1.toUpperCase() === str2.toUpperCase();
	}
}