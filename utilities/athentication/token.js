const jwt = require('jsonwebtoken');

module.exports={

	/*
		This method has two parameter, first one 'object' will going to convert into a long string formatted JWT 
		token based on the key (second parameter 'key').
	*/
	getJwtToken : ( object, key ) => {
		
		return new Promise( ( resolve, reject ) => {
			jwt.sign( object, key, (err,token) => {
			
				if ( err ) {
					reject ( null );
				}
				resolve( token );
			})
		})
	},

	/*
		This method will verify the string contained by first parameter ('token') of this method is a valid token
		according to key that carried by second parameter of this method('key').
	*/
	verifyToken : ( token , key) => {

		return new Promise( ( resolve , reject ) => {
			jwt.verify( token ,key ,( err, auth )=>{
				if(err){
					reject( 'invalid auth key');
				}else{
					resolve( auth );
				}
			})
		})

	}

}