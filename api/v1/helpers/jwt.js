const jwt = require('jsonwebtoken');
const env = require('../../../environment/').JWT;

const jwthelper = {
  sign: async (payload, option) => {
    return await jwt.sign(payload, env.key || 'abc', option);
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
      r = await jwt.verify(token, env.key || 'abc');
    } catch(e) {
      return { error: e.message };
    }
    return r;
  }
}

module.exports = jwthelper;