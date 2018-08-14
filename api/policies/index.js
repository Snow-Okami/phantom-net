const utils   = require('../utils/');
const helpers = require('../helpers/');
const models  = require('../models/');

const policies = {

  track: async (req, res, next) => {
    console.log(req.method, req.url);
    next();
  },

  isLoggedIn: async (req, res, next) => {
    if(!req.headers.authorization) { return res.status(403).send('authorization not found!'); }
    
    let token = await helpers.jwt.decode(req.headers.authorization);
    if(token.error) { return res.status(403).send('invalid bearer token detected!'); }

    let user = await models.user.findOne({
      'username': token.username,
      'email': token.email,
      'createdAt': token.createdAt,
      'jwtValidatedAt': token.jwtValidatedAt
    });
    if(user.error) { return res.status(403).send('unauthorized login detected!'); }
    if(new Date() - new Date(user.jwtValidatedAt) > 86400000) { return res.status(403).send('Oop! the session has expired. Please login again.'); }
    next();
  }

};

module.exports = policies;