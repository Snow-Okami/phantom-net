const Models = require('../models/').objects;
const _ = require('../models/')._;
const cookie = require('./cookie');
const jwt = require('./jwt');
/**
 * @description Gets the key from Users object.
 */
const chat = {

  models: Models,

  _: _,

  fn: {
    getEmail: async (users, sid) => {
      return _.findKey(users, (o) => {
        return _.includes(o.rooms, sid);
      });
    },

    isSecure: async (param) => {
      /**
       * @description DECODE the cookie to get 'ps-t-a-p' & 'ps-u-a-p' keys.
       */
      const c = await cookie.decode(param.localCookie);
      const token = await jwt.decode(c['ps-t-a-p']);
      if(token.error) { return token; }
  
      const u = await Models.user.findOne(
        _.pick(token, ['email', 'createdAt', 'jwtValidatedAt', 'capability'])
      );
      if(u.error) { return u; }
  
      return u.data;
    }
  },

};

module.exports = chat;