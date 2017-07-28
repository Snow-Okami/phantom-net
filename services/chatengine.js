//REQUIRES
const Chat = require('../models/chat');
const User = require('../models/user');
const constants = require('../utilities/constants');
const utils = require('../utilities/utilities');

module.exports = {

  createChat : function(creatingUser, createdtype, cb) {
    var newCreatedChat;

    function checkChatType(cb) {
      if(createdtype !== 'bidirectional' && createdtype !== 'private' && createdtype !== 'open') {
        if(constants.DEBUG_VERBOSITY > 0) {
          var failureMsg = `Create chat failed: Chat kind ${createdtype} is invalid!`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          }
          cb(newCreatedChat);
          return false;
        } else {
          getUser(cb);
        }
    };

    function getUser(cb) {
      User.getUserByUsername(creatingUser, (err, user) => {
        if(err) {
          var failureMsg = `Create chat failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(newCreatedChat);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Create chat failed - No user ${creatingUser} found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(newCreatedChat);
            return false;
          } else {
            addChat(user, cb);
          }
        }
      });
    };

    function addChat(user, cb) {
      //Add chat
      Chat.addChat(creatingUser, createdtype, (err, chat) => {
        if(err) {
          var failureMsg = `Create chat failed - Failed to add chat: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(newCreatedChat);
          return false;
        } else {
          updateUsersChat(user, chat, cb);
        }
      });
    };

    function updateUsersChat(user, chat, cb) {
      //Pushes the chat to the array if it does NOT exist, if it does exist skips it
      User.db.collections.users.update(
      //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
       { username: creatingUser, 'chats.uuid' : {$ne: chat.uuid} },
       { $addToSet: { chats: { 'uuid': chat.uuid } } },
       { upsert: true },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         updateUsersParticipatedChat(user, chat, cb);
       }
     );
   };

   function updateUsersParticipatedChat(user, chat, cb) {
     //Pushes the chat to the array if it does NOT exist, if it does exist skips it
     User.db.collections.users.update(
     //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
      { username: creatingUser, 'participatedchats.uuid' : {$ne: chat.uuid} },
      { $addToSet: { participatedchats: { 'uuid': chat.uuid } } },
      { upsert: true },
      //Function to call AFTER the update is complete
      (err, numAffected) => {
        newCreatedChat = chat;
        cb(newCreatedChat);
        var successMsg = `Successfully created chat ${chat.uuid} for ${user.username}!`;
        console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
      }
    );
  };

   checkChatType(cb);
 },

  removeChat : function(uuid) {
    Chat.removeChat(uuid, (err) => {
      if(err) {
        var failureMsg = `Failed to remove chat: ${err}`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        return false;
      }
      var successMsg = `Successfully removed chat ${uuid}!`;
      console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
    });
  },

  getChat : function(uuid, cb) {
    Chat.getChatByUuid(uuid, (err, chat) => {
      if(err) {
        var failureMsg = `Failed to get chat: ${err}`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        return false;
      } else {
        if(chat) {
          if(constants.DEBUG_VERBOSITY > 2) {
            var successMsg = `Successfully found chat ${uuid}!`;
            console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
          }
        } else {
          if(constants.DEBUG_VERBOSITY > 2) {
            var failureMsg = `Failed to find chat: ${uuid}`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          }
        }
      }
      cb(chat);
    });
  },

  addUserToChat : function(uuid, username, cb) {
    var success = false;

    function getChat(cb) {
      module.exports.getChat(uuid, (chat) => {
        if(!chat) {
          var failureMsg = `Failed to add ${username} to chat. No chat ${uuid} found!`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          getUser(chat, cb);
        }
      });
    };

    function getUser(chat, cb) {
      User.getUserByUsername(username, (err, user) => {
        if(err) {
          var failureMsg = `Add user to chat failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Add user to chat failed: ${username} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          } else {
            checkChatType(chat, user, cb);
          }
        }
      });
    };

    function checkChatType(chat, user, cb) {
      if(chat.kind === 'bidirectional') {
        if(chat.users.length >= 2) {
          if(constants.DEBUG_VERBOSITY > 1) {
            var failureMsg = `Add user to chat failed: Chat ${uuid} is bidirectional and cannot contain more than 2 participants!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            }
            cb(success);
            return false;
        } else {
          checkParticipation(chat, user, cb);
        }
      } else if (chat.kind === 'private') {
        //Add other options
        checkParticipation(chat, user, cb);
      } else if (chat.kind === 'open') {
        checkParticipation(chat, user, cb);
      } else {
        checkParticipation(chat, user, cb);
      }
    };

    function checkParticipation(chat, user, cb) {
      var foundPos = chat.users.map(function(x) {return x.username; }).indexOf(username);
      if(foundPos > -1) {
        var failureMsg = `Failed to add ${username} to chat. They already are a participant!`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        cb(success);
        return false;
      } else {
        chatUpdate(chat, user, cb);
      }
    };

    function chatUpdate(chat, user, cb) {
      //Pushes the chat to the array if it does NOT exist, if it does exist skips it
      Chat.db.collections.chats.update(
      //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
       { uuid: uuid, 'users.username' : {$ne: username} },
       { $addToSet: { users: { 'username': username, 'msgs': 0 } } },
       { upsert: true },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         userUpdateCurrentChats(chat, user, cb);
       });
    };

    function userUpdateCurrentChats(chat, user, cb)  {
      User.db.collections.users.update(
      //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
       { username: username, 'chats.uuid' : {$ne: uuid} },
       { $addToSet: { chats: { 'uuid': uuid } } },
       { upsert: true },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         userUpdateParticipatedChats(chat, user, cb);
       });
    };

    function userUpdateParticipatedChats(chat, user, cb)  {
      User.db.collections.users.update(
      //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
       { username: username, 'participatedchats.uuid' : {$ne: uuid} },
       { $addToSet: { participatedchats: { 'uuid': uuid } } },
       { upsert: true },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         success = true;
         var successMsg = `Successfully added ${username} to chat ${uuid}!`;
         console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
         cb(success);
       });
    };

    getChat(cb);
  },

  removeUserFromChat : function(uuid, username, cb) {
    var success = false;

    function getChat(cb) {
      module.exports.getChat(uuid, (chat) => {
        if(!chat) {
          var failureMsg = `Failed to remove ${username} from chat. No chat ${uuid} found!`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          getUser(chat, cb);
        }
      });
    };

    function getUser(chat, cb) {
      User.getUserByUsername(username, (err, user) => {
        if(err) {
          var failureMsg = `Remove user from chat failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Remove user from chat failed: ${username} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          } else {
            checkChatType(chat, user, cb);
          }
        }
      });
    };

    function checkChatType(chat, user, cb) {
      if(chat.kind === 'bidirectional') {
        if(chat.users.length <= 0) {
          if(constants.DEBUG_VERBOSITY > 1) {
            var failureMsg = `Remove user from chat failed: Chat ${uuid} already has no participants!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          }
        } else {
          checkParticipation(chat, user, cb);
        }
        //Last person to be removed
        if(chat.users.length  === 1) {
          //Method to handle removing the last participant in a conversation
        }
      } else if (chat.kind === 'private') {
        //Add other options
        checkParticipation(chat, user, cb);
      } else if (chat.kind === 'open') {
        checkParticipation(chat, user, cb);
      } else {
        checkParticipation(chat, user, cb);
      }
    };

    function checkParticipation(chat, user, cb) {
      var foundPos = chat.users.map(function(x) {return x.username; }).indexOf(username);
      if(foundPos > -1) {
        chatUpdate(chat, user, cb);
      } else {
        var failureMsg = `Failed to remove ${username} from chat. They are not a participant!`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        cb(success);
        return false;
      }
    };

    function chatUpdate(chat, user, cb) {
      //Pushes the chat to the array if it does NOT exist, if it does exist skips it
      Chat.db.collections.chats.update(
      //Updates the chat array using pull, insert if doesn't exist (may not be needed)
       { uuid: uuid, 'users.username' : username },
       { $pull: { users: { 'username': username } } },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         userUpdateCurrentChats(chat, user, cb);
       });
    };

    function userUpdateCurrentChats(chat, user, cb)  {
      User.db.collections.users.update(
      //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
       { username: username, 'chats.uuid' : {$ne: uuid} },
       { $pull: { chats: { 'uuid': uuid } } },
       { upsert: true },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         userUpdateParticipatedChats(chat, user, cb);
       });
    };

    function userUpdateParticipatedChats(chat, user, cb)  {
      User.db.collections.users.update(
      //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
       { username: username, 'participatedchats.uuid' : {$ne: uuid} },
       { $pull: { participatedchats: { 'uuid': uuid } } },
       { upsert: true },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         success = true;
         var successMsg = `Successfully removed ${username} from chat ${uuid}!`;
         console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
         cb(success);
       });
    };

    getChat(cb);
  },

  sendChatMsg : function(username, uuid, msg, cb) {
    var success = false;

    function getChat(cb) {
      module.exports.getChat(uuid, (chat) => {
        if(!chat) {
          var failureMsg = `Failed to send ${username}:${msg} to chat ${uuid}. No chat ${uuid} found!`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          getUser(chat, cb);
        }
      });
    };

    function getUser(chat, cb) {
      User.getUserByUsername(username, (err, user) => {
        if(err) {
          var failureMsg = `Failed to send ${username}:${msg} to chat ${uuid}: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Failed to send ${msg} to chat ${uuid}: ${username} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          } else {
            chatUpdate(chat, user, cb);
          }
        }
      });
    };
    //ALTERNATE UPDATE METHOD
    function chatUpdateAlt(chat, user, cb) {
      //Create new msg base don schema
      let newMsg = new Chat({
        owner: user.username,
        createdon: Date.now(),
        text: msg
      });
      //Push new msg to the chat message array
      chat.msgs.push(newMsg);
      //Save the chat
      chat.save( (err) => {
        if(err) {
          var failureMsg = `Save chat failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          chatUserUpdate(chat, user, cb);
        }
      });
    }
    //This fails to save the date properly, also gives no object ID
    function chatUpdateAlt(chat, user, cb) {
      //Pushes the msg to the chat array
      Chat.db.collections.chats.update(
      //Updates the chat array using push, insert it no matter what
       { uuid: uuid, 'users.username' : username },
       { $push: { msgs: { createdon: Date.now(), 'owner': username, 'text': msg } } },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         chatUserUpdate(chat, user, cb);
       });
    };

    function chatUserUpdate(chat, user, cb) {
      //Find and increment the users msg count in the chat users array
      Chat.db.collections.chats.update(
      //Updates the chat users array using inc
       { uuid: uuid, 'users': {$elemMatch: {username: username}} },
       { $inc: { 'users.$.msgs': 1 }  },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         success = true;
         var successMsg = `Successfully sent ${username}:${msg} to chat ${uuid}!`;
         console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
         cb(success);
       });
    };

    getChat(cb);
  },
}
