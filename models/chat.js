const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');
//CUSTOM
const app = require('../app');
const constants = require('../utilities/constants');

const UsersSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  msgs: {
    type: Number,
    default: 0,
    required: true
  },
});

//Schema Setup
const ChatSchema = mongoose.Schema({
  uuid: {
    type: String,
    required: true
  },
  users: [ UsersSchema ],
  msgs: {
    type: Number,
    default: 0
  },
});

//Model Setup
const Chat = mongoose.model('Chat', ChatSchema);

//Export
module.exports = Chat;

//Find User by ID
module.exports.getChatById = function (id, callback) {
  Chat.findById(id, callback);
};

//Find User by Username
module.exports.getChatByUuid = function (uuid, callback) {
  const query = {uuid : uuid};
  Chat.findOne(query, callback);
};

module.exports.addChat = function (creatingUser, callback) {
  var uuid = uuidv4();
  //Check that this UUID doesn't match a previously saved chat
  //Function for recursion
  var uuidIsValid = function(value) {
    const query = {uuid : value};
    Chat.findOne(query, (err, chat) => {
      if(chat) {
        //Get a new UUID while we do not have a valid one
        uuid = uuidv4();
        //Recurse to find another
        uuidIsValid(uuid);
      } else {
        //Create a new chat using our schema
        //Set UUID
        let newChat = new Chat({
          uuid: uuid,
          users: [{username: creatingUser, msgs: 0}],
          msgs: 0
        });
        //Save chat
        newChat.save(callback);
        return false;
      }
    });
  }
  //Call above defined function
  uuidIsValid();
};

module.exports.removeChat = function (uuid, callback) {
  const query = {uuid : uuid};
  Chat.findOneAndRemove(query, callback);
};
