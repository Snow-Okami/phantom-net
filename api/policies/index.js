const helpers = require('../helpers/');
const models  = require('../models/');

const policies = {

  track: async (req, res, next) => {
    console.log(req.method, req.url);
    next();
  },

  isLoggedIn: async (req, res, next) => {
    if(!req.headers.authorization) {
      return res.status(403).send('authorization not found!');
    }

    let token = await helpers.jwt.decode(req.headers.authorization);
    let user = await models.user.findOne({ 'username': token.username, 'email': token.email, 'jwtValidatedAt': token.jwtValidatedAt });
    console.log(user);
    next();
  }

};

module.exports = policies;