const jwtDecode = require('jwt-decode');

const jwtdecodehelper = {
  decode: async (token) => {
    /**
     * @description token must start with Bearer text.
     */
    let regex = /^(Bearer\s)/gm;
    if(!regex.test(token)) {
      return { error: 'invalid token' };
    }
    
    let r;
    try {
      r = await jwtDecode(token);
    } catch(e) {
      return { error: e.message };
    }
    return r;
  }
}

module.exports = jwtdecodehelper;