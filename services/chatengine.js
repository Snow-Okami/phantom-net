//REQUIRES
const Chat = require('../models/chat');
const User = require('../models/user');
const constants = require('../utilities/constants');
const utils = require('../utilities/utilities');

module.exports = {

  createChatOld : function(creatingUser, cb) {
    var newCreatedChat;
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
        //Add chat
        Chat.addChat(creatingUser, (err, chat) => {
          if(err) {
            var failureMsg = `Create chat failed - Failed to add chat: ${err}`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(newCreatedChat);
            return false;
          } else {
          //Chat array may not be made yet, so create it before pushing this chat to the array
          user.chat = [];
          //Save the user before updating so it is ready for the collection to be updated
          user.save((err) => {
            if(err)  {
              console.log(`[${utils.getDateTimeNow()}] ${err}`);
              cb(newCreatedChat);
              return false;
            } else {
            //Pushes the chat to the array if it does NOT exist, if it does exist skips it
            User.db.collections.users.update(
            //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
             { username: creatingUser, 'chats.uuid' : {$ne: chat.uuid} },
             { $addToSet: { chats: { 'uuid': chat.uuid } } },
             { upsert: true },
             //Function to call AFTER the update is complete
             (err, numAffected) => {
               newCreatedChat = chat;
               cb(newCreatedChat);
               var successMsg = `Successfully created chat ${chat.uuid} for ${user.username}!`;
               console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
             }
           );
          }
          });
          }
        });
        }
      }
    });
  },

  createChat : function(creatingUser, cb) {
    var newCreatedChat;

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
      Chat.addChat(creatingUser, (err, chat) => {
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

   getUser(cb);
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

  addUserToChatOld : function(uuid, username, cb) {
    var success = false;
    module.exports.getChat(uuid, (chat) => {
      if(!chat) {
        if(constants.DEBUG_VERBOSITY > 0) {
          var failureMsg = `Failed to add ${username} to chat. No chat ${uuid} found!`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        }
        cb(success);
        return false;
      } else {
        User.getUserByUsername(username, (err, user) => {
          if(err) {
            if(constants.DEBUG_VERBOSITY > 0) {
              var failureMsg = `Add user to chat failed: ${err}`;
              console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            }
            cb(success);
            return false;
          } else {
            if(!user) {
              var failureMsg = `Add user to chat failed: ${username} not found!`;
              console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
              cb(success);
              return false;
            } else {
              var foundPos = chat.users.map(function(x) {return x.username; }).indexOf(username);
              if(foundPos > -1) {
                var failureMsg = `Failed to add ${username} to chat. They already are a participant!`;
                cb(success);
                console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
                return false;
              } else {
                //Chat array may not be made yet, so create it before pushing this chat to the array
                user.chat = [];
                //Save the user before updating so it is ready for the collection to be updated
                user.save((err) => {
                  if(err)  {
                    console.log(`[${utils.getDateTimeNow()}] ${err}`);
                    cb(success);
                    return false;
                  } else {
                  //Pushes the chat to the array if it does NOT exist, if it does exist skips it
                  Chat.db.collections.chats.update(
                  //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
                   { uuid: uuid, 'users.username' : {$ne: username} },
                   { $addToSet: { users: { 'username': username, 'msgs': 0 } } },
                   { upsert: true },
                   //Function to call AFTER the update is complete
                   (err, numAffected) => {
                     //Pushes the chat to the array if it does NOT exist, if it does exist skips it
                     User.db.collections.users.update(
                     //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
                      { username: username, 'chats.uuid' : {$ne: uuid} },
                      { $addToSet: { chats: { 'uuid': uuid } } },
                      { upsert: true },
                      //Function to call AFTER the update is complete
                      (err, numAffected) => {
                        success = true;
                        var successMsg = `Successfully added ${username} to chat ${uuid}!`;
                        console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
                        cb(success);
                      });
                    });
                  }
                 });
               }
              }
            }
        });
      }
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
            checkParticipation(chat, user, cb);
          }
        }
      });
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
}
