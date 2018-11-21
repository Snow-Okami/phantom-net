const Models = require('../models/').objects;
const _ = require('../models/')._;
const jwt = require('../helpers/jwt');

const policies = {
  track: async (req, res, next) => {
    console.log(req.method, req.url);
    next();
  },

  isLoggedIn: async (req, res, next) => {
    console.log(req.headers);

    if(!req.headers.authorization) { return res.status(404).set('Content-Type', 'application/json').send({ error: { type: 'error', text: 'please include authorization in header' } }); }

    /**
     * @description Decode and Authenticate JWT token.
     */
    const token = await jwt.decode(req.headers.authorization);
    if(token.error) {
      return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: token.error });    
    }

    const a = await Models.admin.findOne(
      _.pick(token, ['email', 'createdAt', 'jwtValidatedAt'])
    );
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }

    next();
  },
};

module.exports = policies;