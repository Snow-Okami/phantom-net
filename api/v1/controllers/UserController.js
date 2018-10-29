const Models = require('../models/').objects;

const UserController = {
  findOne: async (req, res) => {
    const u = await Models.user.findOne(req.params);
    if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }
    return res.status(200).send(u);
  },

  /**
   * @description Need to complete this API.
   */
  findLimited: async (req, res) => {
    return res.status(200).send({
      message: { type: 'success' },
      data: 'You are connected to Node.js server.'
    });
  },

  findAll: async (req, res) => {
    const u = await Models.user.findAll({});
    if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }
    return res.status(200).send(u);
  },

  create: async (req, res) => {
    const u = await Models.user.create(req.body);
    if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }
    return res.status(200).send(u);
  },

  updateOne: async (req, res) => {
    const u = await Models.user.updateOne(req.params, req.body, {});
    if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }
    return res.status(200).send(u);
  },

  deleteOne: async (req, res) => {
    const u = await Models.user.deleteOne(req.params);
    if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }
    return res.status(200).send(u);
  }
};

module.exports = UserController;