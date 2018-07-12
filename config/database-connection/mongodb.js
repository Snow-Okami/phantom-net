//REQUIRED MODULES
const mongoose = require('mongoose');

/*
    @description: Establishing a local Mongodb database connection with required the credential which 
    			  are mentioned in .env file
*/

let mongoUrl = 'mongodb://' + process.env.MONGO_SERVER + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB;
mongoose.connect(mongoUrl);

//EXPORTING THE MONGODB CONNECTION MODULE
module.exports = mongoose;