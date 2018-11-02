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
    /**
     * @description token must start with Bearer text.
     */
    let regex = /^(Bearer\s)/gm;
    if(!regex.test(token)) {
      return { error: 'invalid token' };
    }

    /**
     * Remove the Bearer text from token.
     */
    token = token.replace('Bearer ', '');
    
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