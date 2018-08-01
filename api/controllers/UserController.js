const models = require('../models/');

const API = {
  create: async (req, res) => {
    const user = await models.user.create(req.body);

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