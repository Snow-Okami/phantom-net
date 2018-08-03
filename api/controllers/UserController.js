const models    = require('../models/');
const helpers   = require('../helpers/');

const API = {
  create: async (req, res) => {
    // const user = await models.user.create(req.body);
    const mail = await helpers.mailer.sendMail(req.body.to);

    res.status(200).set('Content-Type', 'application/json')
    .send(mail);
  },

  delete: async (req, res) => {
    const user = await models.user.delete(req.params);

    res.status(200).set('Content-Type', 'application/json')
    .send(user);
  }
};

module.exports = API;