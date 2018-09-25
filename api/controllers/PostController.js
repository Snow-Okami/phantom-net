const models = require('../models/');

const API = {
  find: async (req, res) => {
    const post = await models.post.find();

    res.status(200).set('Content-Type', 'application/json')
    .send(post);
  },

  create: async (req, res) => {
    const post = await models.post.create(req);

    res.status(200).set('Content-Type', 'application/json')
    .send(post);
  },

  delete: async (req, res) => {
    const post = await models.post.delete(req.params);

    res.status(200).set('Content-Type', 'application/json')
    .send(post);
  }
};

module.exports = API;