const Models = require('../models/').objects;
const _ = require('../models/')._;
const jwt = require('../helpers/jwt');

const policies = {
  track: async (req, res, next) => {
    console.log(req.method, req.url);
    next();
  },

  isLoggedIn: async (req, res, next) => {
    if(!req.headers.authorization) { return res.status(404).set('Content-Type', 'application/json').send({ error: { type: 'error', text: 'please include authorization in header' } }); }
    /**
     * @description Decode and Authenticate JWT token.
     */
    const token = await jwt.decode(req.headers.authorization);
    if(token.error) {
      return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: token.error });    
    }

    const u = await Models.user.findOne(
      _.pick(token, ['email', 'createdAt', 'jwtValidatedAt', 'capability'])
    );
    if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }

    req.body.capability = u.data.capability;

    next();
  },

  allowPublic: async (req, res, next) => {
    if(!req.headers.authorization) { req.body.capability = 0; }
    else {
      /**
       * @description Decode and Authenticate JWT token.
       */
      const token = await jwt.decode(req.headers.authorization);
      if(token.error) {
        return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: token.error });    
      }

      const c = await Models.user.findOne(
        _.pick(token, ['email', 'createdAt', 'jwtValidatedAt', 'capability'])
      );
      if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }

      req.body.capability = u.data.capability;
    }

    next();
  }
};

module.exports = policies;