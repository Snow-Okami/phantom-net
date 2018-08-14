const jwt = require('jsonwebtoken');
const env = require('../../environment/');

const key = process.env.phantomapikey || env.const.phantomapikey;

const jwthelper = {
  sign: async (param) => {
    let payload = {
      'username': param.username,
      'email': param.email,
      'createdAt': param.createdAt,
      'jwtValidatedAt': param.jwtValidatedAt
    };
    return await jwt.sign(payload, key);
  },

  decode: async (token) => {
    let r;
    try {
      r = await jwt.verify(token, key);
    } catch(e) {
      return { error: e.message };
    }
    return r;
  }
}

module.exports = jwthelper;