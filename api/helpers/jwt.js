const jwt = require('jsonwebtoken');

const jwthelper = {
  sign: async (param) => {
    let payload = {
      'username': param.username,
      'email': param.email,
      'createdAt': param.createdAt,
      'jwtValidatedAt': param.jwtValidatedAt
    }
    return await jwt.sign(payload, '12345', {});
  }
}

module.exports = jwthelper;