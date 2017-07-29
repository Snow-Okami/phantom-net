//REQUIRES
const Chat = require('../models/chat');
const User = require('../models/user');

const constants = require('../utilities/constants');
const utils = require('../utilities/utilities');

module.exports = {

  //Set online status of user
  setStatus : function(username, status, cb) {
    var success = false;
    //Fail if status is invalid
    if(status !== 'online' && status !== 'offline' && status !== 'away' && status !== 'busy') {
      //Failed
      if(constants.DEBUG_VERBOSITY > 1) {
        var failureMsg = `Set status ${status} failed for user ${username}, status is invalid!`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      }
      cb(success);
    } else {
    const query = {username : username}
    User.findOne(query, (err, user) => {
      if(err) {
        //Failed
        if(constants.DEBUG_VERBOSITY > 0) {
          var failureMsg = `Set status ${status} failed for user ${username}, could not find: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        }
        cb(success);
      } else {
        if(!user) {
          if(constants.DEBUG_VERBOSITY > 0) {
            var failureMsg = `Set status ${status} failed. ${username} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          }
        } else {
        //Set status
        user.onlinestatus = status;
        user.save((err) => {
          if(err) {
            if(constants.DEBUG_VERBOSITY > 0) {
              var failureMsg = `Set status ${status} failed for user ${username}, could not save: ${err}`;
              console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            }
          } else {
            if(constants.DEBUG_VERBOSITY > 1) {
              var successMsg = `Successfully set status ${status} for ${username}!`;
              console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
            }
            success = true;
            cb(success);
          }
        });
        }
      }
    });
    }
  },

  addFriend : function(username, friendname, cb) {
    var success = false;

    function findRequestingUser(cb) {
      User.getUserByUsername(username, (err, user) => {
        if(err) {
          var failureMsg = `Add friend failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Add friend failed: User ${username} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          } else {
            findFriend(user, cb);
          }
        }
      });
    };

    function findFriend(requestinguser, cb) {
      User.getUserByUsername(friendname, (err, user) => {
        if(err) {
          var failureMsg = `Add friend failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Add friend failed: Friend ${friendname} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          } else {
            processFriendAdd(requestinguser, user, cb);
          }
        }
      });
    };

    function processFriendAdd(requestinguser, friend, cb) {
      User.db.collections.users.update(
      //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
       { username: requestinguser.username, 'friends.username' : {$ne: username} },
       { $addToSet: { friends: { 'username': friend.username } } },
       { upsert: true },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         //If we modify, we have added a friend
         if(numAffected.result.nModified === 1) {
           success = true;
           var successMsg = `Successfully added ${friend.username} to ${requestinguser.username}'s friends'!`;
           console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
           cb(success);
           //We can also check numAffected.result.nModified > 1 for multiple adds, which should NEVER happen
           //If we don't modify we haven't added a friend
         } else {
           success = false;
           var failureMsg = `Failed to add ${friend.username} to ${requestinguser.username}'s friends'. ${requestinguser.username} is already a friend!`;
           console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
           cb(success);
         }
       });
    };

    findRequestingUser(cb);
  },

  removeFriend : function(username, friendname, cb) {
    var success = false;

    function findRequestingUser(cb) {
      User.getUserByUsername(username, (err, user) => {
        if(err) {
          var failureMsg = `Remove friend failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Remove friend failed: User ${username} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          } else {
            findFriend(user, cb);
          }
        }
      });
    };

    function findFriend(requestinguser, cb) {
      User.getUserByUsername(friendname, (err, user) => {
        if(err) {
          var failureMsg = `Remove friend failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Remove friend failed: Friend ${friendname} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          } else {
            processFriendRemove(requestinguser, user, cb);
          }
        }
      });
    };

    function processFriendRemove(requestinguser, friend, cb) {
      User.db.collections.users.update(
      //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
       { username: requestinguser.username },
       { $pull: { friends: { 'username': friend.username } } },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         //If we modify, we have added a friend
         if(numAffected.result.nModified === 1) {
           success = true;
           var successMsg = `Successfully removed ${friend.username} from ${requestinguser.username}'s friends!`;
           console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
           cb(success);
           //We can also check numAffected.result.nModified > 1 for multiple adds, which should NEVER happen
           //If we don't modify we haven't added a friend
         } else {
           success = false;
           var failureMsg = `Failed to remove ${friend.username} from ${requestinguser.username}'s friends. ${requestinguser.username} is not a friend!`;
           console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
           cb(success);
         }
       });
    };

    findRequestingUser(cb);
  },

  addBlocked : function(username, blockedname, cb) {
    var success = false;

    function findRequestingUser(cb) {
      User.getUserByUsername(username, (err, user) => {
        if(err) {
          var failureMsg = `Add blocked user failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Add blocked user failed: User ${username} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          } else {
            findFriend(user, cb);
          }
        }
      });
    };

    function findFriend(requestinguser, cb) {
      User.getUserByUsername(blockedname, (err, user) => {
        if(err) {
          var failureMsg = `Add blocked user failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Add blocked failed: Blocked user ${blockedname} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          } else {
            processBlockAdd(requestinguser, user, cb);
          }
        }
      });
    };

    function processBlockAdd(requestinguser, block, cb) {
      User.db.collections.users.update(
      //Updates the friends array using addToSet, and upsert to insert if doesn't exist (may not be needed)
       { username: requestinguser.username, 'blocked.username' : {$ne: username} },
       { $addToSet: { blocked: { 'username': block.username } } },
       { upsert: true },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         //If we modify, we have added a block
         if(numAffected.result.nModified === 1) {
           success = true;
           var successMsg = `Successfully added ${block.username} to ${requestinguser.username}'s blocked list'!`;
           console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
           cb(success);
           //We can also check numAffected.result.nModified > 1 for multiple adds, which should NEVER happen
           //If we don't modify we haven't added a block
         } else {
           success = false;
           var failureMsg = `Failed to add ${block.username} to ${requestinguser.username}'s blocked list. ${requestinguser.username} is already blocked!`;
           console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
           cb(success);
         }
       });
    };

    findRequestingUser(cb);
  },

  removeBlocked : function(username, blockedname, cb) {
    var success = false;

    function findRequestingUser(cb) {
      User.getUserByUsername(username, (err, user) => {
        if(err) {
          var failureMsg = `Remove blocked user failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Remove blocked user failed: User ${username} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          } else {
            findBlocked(user, cb);
          }
        }
      });
    };

    function findBlocked(requestinguser, cb) {
      User.getUserByUsername(blockedname, (err, user) => {
        if(err) {
          var failureMsg = `Remove blocked user failed: ${err}`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          cb(success);
          return false;
        } else {
          if(!user) {
            var failureMsg = `Remove blocked user failed: Blocked user ${blockedname} not found!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            cb(success);
            return false;
          } else {
            processBlockedRemove(requestinguser, user, cb);
          }
        }
      });
    };

    function processBlockedRemove(requestinguser, block, cb) {
      User.db.collections.users.update(
      //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
       { username: requestinguser.username },
       { $pull: { blocked: { 'username': block.username } } },
       //Function to call AFTER the update is complete
       (err, numAffected) => {
         //If we modify, we have added a block
         if(numAffected.result.nModified === 1) {
           success = true;
           var successMsg = `Successfully removed ${block.username} from ${requestinguser.username}'s blocked list!`;
           console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
           cb(success);
           //We can also check numAffected.result.nModified > 1 for multiple adds, which should NEVER happen
           //If we don't modify we haven't added a block
         } else {
           success = false;
           var failureMsg = `Failed to remove ${block.username} from ${requestinguser.username}'s blocked list. ${requestinguser.username} is not blocked!`;
           console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
           cb(success);
         }
       });
    };

    findRequestingUser(cb);
  },

  getPm : function(touser, fromuser, cb) {

    function getPm(cb) {
      //Pushes the chat to the array if it does NOT exist, if it does exist skips it
      Chat.db.collections.chats.findOne(
      //Updates the chat array using addToSet, and upset to insert if doesn't exist (may not be needed)
       { kind: 'bidirectional', users: { $all: [ { $elemMatch : { username: touser } },  { $elemMatch : { username: fromuser } } ] } },
       //Function to call AFTER the update is complete
       (err, chat) => {
         cb(chat.uuid);
       });
     };

    getPm(cb);
  },
}
