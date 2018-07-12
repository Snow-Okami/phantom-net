const mongodb_schema = require('../mongodb-schema/mongodb_schema');

var posts = mongodb_schema.initialize('posts');
var comments = mongodb_schema.initialize('comments');
var replies = mongodb_schema.initialize('replies');
var tags = mongodb_schema.initialize('tags');
var tagsPost = mongodb_schema.initialize('tagsPost');