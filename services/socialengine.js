
module.exports = {

  //Set online status of user
  setStatus : function(status, username, cb) {
    var success = false;
    //Fail if status is invalid
    if(status !== 'online' && status !== 'offline' && status !== 'away' && status !== 'busy') {
      //Failed
      if(constants.DEBUG_VERBOSITY > 1) {
        var failureMsg = `Set status ${status} failed for user ${username}, status is invalid!`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      }
      cb(success);
    }
    const query = {username : username}
    User.findOne(query, (err, user) => {
      if(err) {
        //Failed
        console.log(err);
        var failureMsg = `Set status ${status} failed for user ${username}, could not find: ${err}`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        }
        cb(success);
      } else {
        //Set status
        user.onlinestatus = status;
        user.save((err) => {
          if(err) {
            console.log(err);
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
    });
  },

  addFriend : function(username, friendname, cb) {
    var success = false;

    function findRequestingUser(cb) {

    };

    function findFriend(requestinguser, cb) {

    };

    function checkFriendDoesntExist(cb) {
      
    };

    function addFriend(cb) {

    };

    findRequestingUser(cb);
  },

  removeFriend : function(username, friendname, cb) {

  },

  addBlocked : function(username, blockedname, cb) {

  },

  removeBlocked : function(username, blockedname, cb) {

  },
}
