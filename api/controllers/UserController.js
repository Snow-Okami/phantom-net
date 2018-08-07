const models    = require('../models/');
const helpers   = require('../helpers/');

const API = {
  create: async (req, res) => {
    const user = await models.user.create(req.body);
    if(user.error) {
      return res.status(404).set('Content-Type', 'application/json')
      .send(user);
    }
    const auth = await models.authUser.create(user);
    helpers.mailer.sendValidationMail(auth);
    return res.status(200).set('Content-Type', 'application/json')
    .send(user);
  },

  delete: async (req, res) => {
    const user = await models.user.delete(req.params);

    return res.status(200).set('Content-Type', 'application/json')
    .send(user);
  },

  update: async (req, res) => {
    const user = await models.user.update(req.params, req.body, {});
    let s = 200, m = 'User is updated successfully!';
    if(user.error) { s = 404, m = user.error; }
    return res.status(s).set('Content-Type', 'text/plain').send(m);
  },
};

module.exports = API;