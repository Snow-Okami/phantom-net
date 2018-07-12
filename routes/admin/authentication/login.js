//MODULES
require('dotenv').config();
const jwt = require('jsonwebtoken');

//CUSTOM UTILITIES
const token = require('../../../utilities/authentication/token');
const utils = require('../../../utilities/utils');

/*
	@Description: This the api end body of Login api. This api will be responded as succes if user gave the right login 
	credentials otherwise it will be responded with login fail message.

	*Request Data Payload : 
							{
								"admin" : "string",
								"password" : "string"
							}

	*Response : 
		success login flow : res.meta.dataValidate (true) --> res.meta.login (true) --> res.meta.token (true) -->login succes
*/

module.exports = (req, res, next) => {

	let admin = req.body.admin.trim();
	let pass = req.body.password.trim();
	//Checking login login credential validation
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
				res.status(200).send({
				  	meta : {
				  		code: 200,
				  		status : 'error',
				  		login : false,
				  		dataValidate : true,
				  		token : true
				  	},
				  	data : {
				  		msg : 'Login successful',
				  		token : token
				  	}
		    	});

			}).catch( err => {
				// Getting exception while generating token
				res.status(200).send({
				  	meta : {
				  		code: 200,
				  		status : 'error',
				  		login : false,
				  		dataValidate : true,
				  		token : false
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
			  		dataValidate : true
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
		  		dataValidate : false
		  	},
		  	data : {
		  		msg : 'All the login credential must be filled'
		  	}
    	});
	}

}