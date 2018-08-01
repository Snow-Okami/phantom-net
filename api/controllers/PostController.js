const models = require('../models/');

const API = {
  find: async (req, res) => {
    try {
      const post = await models.post.find();

      res.status(200).set('Content-Type', 'application/json')
      .send(post);
    } catch(e) {
      res.status(404).set('Content-Type', 'application/json')
      .send(e);
    }
  },

  create: async (req, res) => {
    try {
      const post = await models.post.create(req);

      res.status(200).set('Content-Type', 'application/json')
      .send(post);
    } catch(e) {
      res.status(404).set('Content-Type', 'application/json')
      .send(e);
    }
  },

  delete: async (req, res) => {
    try {
      const post = await models.post.delete(req.params);

      res.status(200).set('Content-Type', 'application/json')
      .send(post);
    } catch(e) {
      res.status(404).set('Content-Type', 'application/json')
      .send(e);
    }
  }
};

module.exports = API;