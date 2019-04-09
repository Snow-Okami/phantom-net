const Models = require('../models/').objects;
const _ = require('../models/')._;
const jwt = require('../helpers/jwt');

const policies = {
  track: async (req, res, next) => {
    console.log(req.method, req.url);
    next();
  },

  isAdmin: async (req, res, next) => {
    if(!req.headers.authorization) { return res.status(404).set('Content-Type', 'application/json').send({ error: { type: 'error', text: 'please include authorization in header' } }); }
    /**
     * @description Decode and Authenticate JWT token.
     */
    const token = await jwt.decode(req.headers.authorization);
    if(token.error) {
      return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: token.error });    
    }
    /**
     * @description Check user is allowed or not.
     */
    if(!token.allowedToAccess) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'user is not allowed to access!' }); }
    /**
     * @description If the user has a role he must have the email in request params.
     * The email must match the authorization token.
     */
    if(token.capability < 2) {
      return res.status(400).set('Content-Type', 'application/json').send({ type: 'error', text: 'access denied' });
    }

    const u = await Models.user.findOne(
      _.pick(token, ['email', 'allowedToAccess', 'jwtValidatedAt', 'capability'])
    );
    if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }

    req.query.capability = u.data.capability;

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
    /**
     * @description Check user is allowed or not.
     */
    if(!token.allowedToAccess) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'user is not allowed to access!' }); }
    /**
     * @description If the user has a role he must have the email in request params.
     * The email must match the authorization token.
     */
    if(token.capability < 2) {
      if(!req.params.email) { return res.status(400).set('Content-Type', 'application/json').send({ type: 'error', text: 'please include email in params' }); }
      if(req.params.email !== token.email) { return res.status(400).set('Content-Type', 'application/json').send({ type: 'error', text: 'invalid email in params' }); }
    }

    const u = await Models.user.findOne(
      _.pick(token, ['email', 'allowedToAccess', 'jwtValidatedAt', 'capability'])
    );
    if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }

    req.query.capability = u.data.capability;
    req.auth = { user: u };

    next();
  },

  allowPublic: async (req, res, next) => {
    if(!req.headers.authorization) { req.query.capability = 0; }
    else {
      /**
       * @description Decode and Authenticate JWT token.
       */
      const token = await jwt.decode(req.headers.authorization);
      if(token.error) {
        return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: token.error });    
      }

      const u = await Models.user.findOne(
        _.pick(token, ['email', 'allowedToAccess', 'jwtValidatedAt', 'capability'])
      );
      if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }

      req.query.capability = u.data.capability;
    }

    next();
  }
};

module.exports = policies;