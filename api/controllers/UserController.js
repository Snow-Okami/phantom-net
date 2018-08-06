const models    = require('../models/');
const helpers   = require('../helpers/');

const API = {
  create: async (req, res) => {
    const user = await models.user.create(req.body);
    if(user.status === false) {
      res.status(404).set('Content-Type', 'application/json')
      .send(user);
    }
    helpers.mailer.sendLoginOTPMail(user.email);
    res.status(200).set('Content-Type', 'application/json')
    .send(user);
  },

  delete: async (req, res) => {
    const user = await models.user.delete(req.params);

    res.status(200).set('Content-Type', 'application/json')
    .send(user);
  }
};

module.exports = API;