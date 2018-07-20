//MODULES
require('dotenv').config();
const jwt = require('jsonwebtoken');

//CUSTOM UTILITIES
const token = require('../../../utilities/authentication/token');
const utils = require('../../../utilities/utils');

//IMPORTING MODEL
const modelPost = require('../../../models/blog_posts/posts')

/*
	@Description: This the api end body of Login api. This api will be responded as succes if user gave the right login 
	credentials otherwise it will be responded with login fail message.
	*API Request Url : localhost:3000/admin/authentication/login
	*Request Method : POST
	*Request Data Payload : 
							{
								"admin" : "string",
								"password" : "string"
							}

	*Response : 
		success login flow : res.meta.dataValidate (true) --> res.meta.login (true) --> res.meta.token (true) --> res.meta.sessionCreated (true) -->login succes
*/

module.exports = (req, res, next) => {

	//Checking login credential validation (reuired)
	if (req.body.admin !== "" && req.body.password !== "" && 
		req.body.admin !== null && req.body.password !== null &&
		req.body.admin !== undefined && req.body.password !== undefined
	) {
		//Checking login credential validation (white spaces)
		let admin = req.body.admin.trim();
		let pass = req.body.password.trim();
		if ( admin !== "" && admin !== null && pass !== "" && pass !== null ) {
			//Checking login credential is same as the credential which specified in .env file
			if ( utils.compIgnoreCase(admin, process.env.ADMIN_USER_ID) && (pass === process.env.ADMIN_PASSWORD) ) {
				//Login credential correct
				let loginData = {
					admin : admin,
					loginTime : new Date()
				}
				// Generating a new web token of loginData
				token.getJwtToken(loginData, process.env.TOKEN_KEY).then( token => {
					//A successfull token generation
					//Login success response
					//Createing a new login session for admin
					modelPost.setNewSession(token).then(resModel => {
						//When a new session saved to database
						res.status(200).send({
						  	meta : {
						  		code: 200,
						  		status : 'error',
						  		login : true,
						  		dataValidate : true,
						  		token : true,
						  		sessionCreated : true
						  	},
						  	data : {
						  		msg : 'Login successful : ' + resModel,
						  		token : token,
						  	}
				    	});
					}).catch( err => {
						//When got error while saving new session in database
						res.status(200).send({
						  	meta : {
						  		code: 200,
						  		status : 'error',
						  		err : err,
						  		login : false,
						  		dataValidate : true,
						  		token : false,
						  		sessionCreated : false
						  	},
						  	data : {
						  		msg : 'Got error while saving token in database.'
						  	}
				    	});
					})
					

				}).catch( err => {
					// Getting exception while generating token
					res.status(200).send({
					  	meta : {
					  		code: 200,
					  		status : 'error',
					  		login : false,
					  		dataValidate : true,
					  		token : false,
					  		sessionCreated : false
					  	},
					  	data : {
					  		msg : 'Getting error while token generation!!'
					  	}
			    	});
				})
				
			}else {
				//Incorrect Login credential
				res.status(200).send({
				  	meta : {
				  		code: 200,
				  		status : 'error',
				  		login : false,
				  		dataValidate : true,
				  		sessionCreated : false
				  	},
				  	data : {
				  		msg : 'Invalid login credential'
				  	}
		    	});
			}

		}else{
			//invalidate login credential
			res.status(200).send({
			  	meta : {
			  		code: 200,
			  		status : 'error',
			  		login : false,
			  		dataValidate : false,
			  		sessionCreated : false
			  	},
			  	data : {
			  		msg : 'All the login credential must be filled'
			  	}
	    	});
		}
	}else {
		//When request body is empty
		res.status(200).send({
			  meta : {
			  	code: 200,
			  	status : 'error',
			  	login : false,
			  	dataValidate : false,
			  	sessionCreated : false
			  },
			  data : {
			  	msg : 'All the login credential must be filled up or request Payload body is empty'
			  }
	    });
	}

}