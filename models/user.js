const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//CUSTOM
const constants = require('../utilities/constants');

// Validate Function to check e-mail length
let emailLengthChecker = (email) => {
  // Check if e-mail exists
  if (!email) {
    return false; // Return error
  } else {
    // Check the length of e-mail string
    if (email.length < constants.emailLengthMin || email.length > constants.emailLengthMax) {
      return false; // Return error if not within proper length
    } else {
      return true; // Return as valid e-mail
    }
  }
};

// Validate Function to check if valid e-mail format
let validEmailChecker = (email) => {
  // Check if e-mail exists
  if (!email) {
    return false; // Return error
  } else {
    // Regular expression to test for a valid e-mail
    const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regExp.test(email); // Return regular expression test results (true or false)
  }
};

// Array of Email Validators
const emailValidators = [
  // First Email Validator
  {
    validator: emailLengthChecker,
    msg: 'E-mail must be at least 5 characters but no more than 30'
  },
  // Second Email Validator
  {
    validator: validEmailChecker,
    msg: 'Must be a valid e-mail'
  }
];

// Validate Function to check username length
let usernameLengthChecker = (username) => {
  // Check if username exists
  if (!username) {
    return false; // Return error
  } else {
    // Check length of username string
    if (username.length < constants.usernameLengthMin || username.length > constants.usernameLengthMax) {
      return false; // Return error if does not meet length requirement
    } else {
      return true; // Return as valid username
    }
  }
};

// Validate Function to check if valid username format
let validUsername = (username) => {
  // Check if username exists
  if (!username) {
    return false; // Return error
  } else {
    // Regular expression to test if username format is valid
    const regExp = new RegExp(/^[a-zA-Z0-9]+$/);
    return regExp.test(username); // Return regular expression test result (true or false)
  }
};

// Array of Username validators
const usernameValidators = [
  // First Username validator
  {
    validator: usernameLengthChecker,
    msg: 'Username must be at least 3 characters but no more than 15'
  },
  // Second username validator
  {
    validator: validUsername,
    msg: 'Username must not have any special characters'
  }
];

// Validate Function to check password length
let passwordLengthChecker = (password) => {
  // Check if password exists
  if (!password) {
    return false; // Return error
  } else {
    // Check password length
    if (password.length < constants.passwordLengthMin || password.length > constants.passwordLengthMax) {
      return false; // Return error if passord length requirement is not met
    } else {
      return true; // Return password as valid
    }
  }
};

// Validate Function to check if valid password format
let validPassword = (password) => {
  // Check if password exists
  if (!password) {
    return false; // Return error
  } else {
    // Regular Expression to test if password is valid format
    const regExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/);
    return regExp.test(password); // Return regular expression test result (true or false)
  }
};

// Array of Password validators
const passwordValidators = [
  // First password validator
  {
    validator: passwordLengthChecker,
    msg: 'Password must be at least 8 characters but no more than 35'
  },
  // Second password validator
  {
    validator: validPassword,
    msg: 'Must have at least one uppercase, lowercase, special character, and number'
  }
];

//Schema Setup
const UserSchema = mongoose.Schema({
  country: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  bmonth: {
    type: Number,
    required: true
  },
  bday: {
    type: Number,
    required: true
  },
  byear: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    validate: emailValidators
  },
  username: {
    type: String,
    required: true,
    unique: true,
    validate: usernameValidators
  },
  password: {
    type: String,
    required: true,
    validate: passwordValidators
  },
  secretone: {
    type: String,
    required: true
  },
  secretoneanswer: {
    type: String,
    required: true
  },
  temporarytoken: {
    type: String,
    required: true
  },
  lasttemporarytoken: {
    type: String,
    default: 'never'
  },
  resettoken: {
    type: String,
  },
  lastresettoken: {
    type: String,
    default: 'never'
  },
  active: {
    type: Boolean,
    required: true,
    default: false
  },
  createdon: {
    type: String,
    required: true,
  },
  activatedon: {
    type: String,
  },
  lastactive: {
    type: String,
    default: 'never'
  },
  lastip: {
    type: String,
    default: 'never'
  },
  lastforgotusername: {
    type: String,
    default: 'never'
  },
  failedlogins: {
    type: Number,
    default: 0
  },
  failedloginattempts: {
    type: Number,
    default: 0
  },
  lastfailedlogin: {
    type: String,
    default: 'never'
  },
  failedloginsessionstart: {
    type: String,
    default: 'never'
  },
  locked: {
    type: Boolean,
    default: false
  },
  lastlocked: {
    type: String,
    default: 'never'
  },
  devpoints: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number
  },
  review: {
    type: String
  },
  hoursplayed: {
    type: Number,
    default: 0
  },
});

// Schema Middleware to Encrypt Password
// userSchema.pre('save', function(next) {
//   // Ensure password is new or modified before applying encryption
//   if (!this.isModified('password'))
//     return next();
//
//   // Apply encryption
//   bcrypt.hash(this.password, null, null, (err, hash) => {
//     if (err) return next(err); // Ensure no errors
//     this.password = hash; // Apply encryption to password
//     next(); // Exit middleware
//   });
// });

//Model Setup
const User = mongoose.model('User', UserSchema);

//Export
module.exports = User;

//Find User by ID
module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}
//Find User by Username
module.exports.getUserByUsername = function(username, callback){
  const query = {username : username}
  User.findOne(query, callback);
}

//Find User by Email
module.exports.getUserByEmail = function(email, callback){
  const query = {email : email}
  User.findOne(query, callback);
}

//Find User by Reset Token
module.exports.getUserByResetToken = function(resettoken, callback){
  const query = {resettoken : resettoken}
  User.findOne(query, callback);
}

//Add a new users
module.exports.addUser = function(newUser, callback){
  //Hashes password, so we do not send plaintext
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      //Error handling
      if(err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

//Set new password
module.exports.saveUserPassword = function(user, callback) {
  //Hashes password, so we do not send plaintext
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      //Error handling
      if(err) throw err;
      user.password = hash;
      user.save(callback);
    });
  });
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  //Compares password
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
      if(err) throw err;
      callback(null, isMatch);
    });
}
