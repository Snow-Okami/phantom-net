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
    return await jwt.verify(token, key);
  }
}

module.exports = jwthelper;