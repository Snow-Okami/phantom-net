const jwt = require('jsonwebtoken');
const env = require('../../../environment/').JWT;

const jwthelper = {
  sign: async (param) => {
    let payload = {
      'username': param.username,
      'email': param.email,
      'createdAt': param.createdAt,
      'jwtValidatedAt': param.jwtValidatedAt
    };
    return await jwt.sign(payload, env.key);
  },

  decode: async (token) => {
    let r;
    try {
      r = await jwt.verify(token, env.key);
    } catch(e) {
      return { error: e.message };
    }
    return r;
  }
}

module.exports = jwthelper;