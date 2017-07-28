const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//CUSTOM
const app = require('../app');
const constants = require('../utilities/constants');

const ChatsSchema = mongoose.Schema({
  uuid: {
    type: String,
    required: true
  },
});

const FriendsSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
});

const BlockedSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
});

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
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
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
    required: true,
    default: false
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
  passwordresets: {
    type: Number,
    default: 0
  },
  passwordresetrequests: {
    type: Number,
    default: 0
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
  logins: {
    type: Number,
    default: 0
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
  avatar: {
    type: String,
    default: 'none'
  },
  onlinestatus: {
    type: String,
    default: 'offline'
  },
  friends:
  [ FriendsSchema ],
  blocked:
  [ BlockedSchema ],
  chats:
  [ ChatsSchema ],
  participatedchats:
  [ ChatsSchema ],
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

//Schema Middleware to Encrypt Password
// UserSchema.pre('save', function(next) {
//   // Ensure password is new or modified before applying encryption
//   if (!this.isModified('password'))
//     return next();
//
//   //Apply encryption
//   //Hashes password, so we do not send plaintext
//   bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(this.password, salt, (err, hash) => {
//       //Error handling
//       if(err) throw err;
//       this.password = hash;
//       next();
//     });
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
