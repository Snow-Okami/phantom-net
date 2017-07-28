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
}, //Stops the creation of the _id element (This was causing the creator to have an id, but anyone added with $addToSet gave no _id)
{ _id: false }
);

const MsgsSchema = mongoose.Schema({
  createdon: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: String,
    default: 'none',
    required: true
  },
  text: {
    type: String,
    default: '',
    required: true
  },
});

//Schema Setup
const ChatSchema = mongoose.Schema({
  uuid: {
    type: String,
    required: true
  },
  creator: {
    type: String,
    required: true
  },
  createdon: {
    type: Date,
    default: Date.now
  },
  kind: {
    type: String,
    default: 'bidirectional'
  },
  users: [ UsersSchema ],
  msgs: [ MsgsSchema ]
});

//Model Setup
const Chat = mongoose.model('Chat', ChatSchema);

const ChatMsg = mongoose.model('ChatMsg', MsgsSchema);

//Export
module.exports = Chat;

module.exports = ChatMsg;

//Find User by ID
module.exports.getChatById = function (id, callback) {
  Chat.findById(id, callback);
};

//Find User by Username
module.exports.getChatByUuid = function (uuid, callback) {
  const query = {uuid : uuid};
  Chat.findOne(query, callback);
};

module.exports.addChat = function (creatingUser, createdtype, callback) {
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
        //Set UUID and other fields
        let newChat = new Chat({
          uuid: uuid,
          creator: creatingUser,
          createdon: Date.now(),
          kind: createdtype,
          users: [{username: creatingUser, msgs: 0}],
          msgs: []
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
