const _ = require('lodash');
/**
 * @description Gets the key from Users object.
 */
const chat = {
  
  getEmail: async (users, sid) => {
    return _.findKey(users, (o) => {
      return _.includes(o.rooms, sid);
    });
  }

};

module.exports = chat;