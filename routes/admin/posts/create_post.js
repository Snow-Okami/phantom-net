const blogsModel = require('../../../models/blog_posts/posts');

module.exports = (req, res, next) => {
	res.send({
		status : 'create_post'
	})
}