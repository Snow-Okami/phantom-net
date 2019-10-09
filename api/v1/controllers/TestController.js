const _ = require('../models')._;
const jwt = require('../helpers/jwt');
const jwtdecode = require('../helpers/jwtdecode');

const TestController = {
  findAll: async (req, res) => {
    return res.status(200).send(
      {
        message: { type: 'success' },
        data: 'You are connected to Psynapsus Node.js server.'
      }
    );
  },
  
  jwtDecode: async (req, res) => {
    const decoded = await jwtdecode.decode(req.body.token);
    return res.status(200).send(decoded);
  },

  jwtSign: async (req, res) => {
    const token = await jwt.sign(
      _.pick(req.body, ['email', 'jwtValidatedAt', 'role']), { expiresIn: '50h' }
    );

    return res.status(200).send({ message: { type: 'success' }, data: `Bearer ${token}` });
  },

  jwtVerify: async (req, res) => {
    const token = await jwt.decode(req.body.token);

    if(token.error) {
      return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: token.error });    
    }

    return res.status(200).send(token);
  }

};

module.exports = TestController;