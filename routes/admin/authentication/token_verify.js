const blogsModel = require('../../../models/blog_posts/posts');

const token = require('../../../utilities/authentication/token');

module.exports = (req, res, next) => {
	
	let auth_key = req.headers.authorization;

	if (typeof(auth_key) !== 'undefined' && auth_key !== "" && auth_key !== null) {
		//When there is something is defined on request header
		
		token.verifyToken(auth_key, process.env.TOKEN_KEY).then( (verifiedToken) => {
			//When token generated successfully!
			next();
		}).catch( err => {
			res.status(400).send({
				meta: {
					code : 400,
					status : 'token_error',
					session : false,
					valid_token : false
				},
				data : {
					msg : 'Got error while verifying jwt token!'
				}
			})
		})
	}else {
		res.status(400).send({
			meta : {
				code : 400,
				status : 'bad_request',
				session : false,
				valid_token : false
			},
			data : {
				msg : 'Authorization headers is not defined!'
			}
		})
	}
}