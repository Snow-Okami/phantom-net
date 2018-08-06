const models    = require('../models/');
const helpers   = require('../helpers/');

const API = {
  create: async (req, res) => {
    const user = await models.user.create(req.body);
    /* if(!req.body.to) {
      res.status(404).set('Content-Type', 'application/json')
      .send();
    }

    const mail = await helpers.mailer.sendLoginOTPMail(req.body.to); */

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