const models    = require('../models/');
const helpers   = require('../helpers/');

const API = {
  resendValidationMail: async (req, res) => {
    const user = await models.user.findOne(req.body);
    if(!user) {
      return res.status(404).set('Content-Type', 'text/plain')
      .send('Email doesn\'t exists in the database!');
    }
    const auth = await models.authUser.create(user);
    let r = await helpers.mailer.sendValidationMail(auth);
    let status = 200;
    if(r.error) { status = 404; }
    return res.status(status).set('Content-Type', 'application/json')
    .send(r);
  },

  validateEmail: async (req, res) => {
    
  }
};

module.exports = API;