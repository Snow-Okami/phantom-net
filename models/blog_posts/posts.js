const mongodb_schema = require('../mongodb-schema/mongodb_schema');

var posts = mongodb_schema.initialize('posts');
var comments = mongodb_schema.initialize('comments');
var replies = mongodb_schema.initialize('replies');
var tags = mongodb_schema.initialize('tags');
var tagsPost = mongodb_schema.initialize('tagsPost');
var session = mongodb_schema.initialize('session');

module.exports = {

	setNewSession : (token) => {
		return new Promise(( resolve, reject ) => {	
			session({
				sessionToken : token
			}).save((err, data) => {
				if (err) {
					reject('Something went wrong while saving data to DB');
				}
				resolve('A session token has been saved to DB');
			})
		})
	}
}