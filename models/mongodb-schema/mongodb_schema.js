//IMPORT REQUIRED MODULES
var mongoose = require('../../config/database-connection/mongodb');
var posts;
var comments;
var replies;
var tags;
var tagsPost;

module.exports = {

	initialize : (collection) => {

		//Initialing a mongodb document, called 'posts' which will have all the paramter required to create post.
		var postsSchema = new mongoose.Schema({

			post_title : String,
			post_type : String,
			post_desc : String,
			post_date : Date,
			post_by_email : String,
			post_by_name : String,
			post_file_type : String,
			post_file_url : String,
			post_status : Boolean

		})

		var commentsSchema = new mongoose.Schema({

			post_id : String,
			comnt_date : Date,
			comnt_text : String,
			comnt_by_email : String,
			comnt_by_name : String

		})

		var repliesSchema =  new mongoose.Schema({

			comnt_id : String,
			post_id : String,
			rep_date : Date,
			rep_text : String,
			rep_by_email : String,
			rep_by_name : String

		})

		var tagsSchema = new mongoose.Schema({

			tag_title : String,
			tag_link : String,
			tag_desc : String

		})

		var tagsPostSchema = new mongoose.Schema({
			post_id : String,
			tag_id : String
		})

		switch(collection) {
			case 'posts' : return mongoose.model('posts', postsSchema); break;
			case 'comments' : return mongoose.model('comments', commentsSchema); break;
			case 'replies' : return mongoose.model('replies', repliesSchema); break;
			case 'tags' : return mongoose.model('tags', tagsSchema); break;
			case 'tagsPost' : return mongoose.model('post-tags', tagsPostSchema); break;
		}
	}
}