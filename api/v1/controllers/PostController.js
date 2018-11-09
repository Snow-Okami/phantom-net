const Models = require('../models/').objects;
const _ = require('../models/')._;

const PostController = {
  findOne: async (req, res) => {
    const p = await Models.post.findOne(req.params);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  /**
   * @description Need to complete this API.
   */
  findLimited: async (req, res) => {
    return res.status(200).send({
      message: { type: 'success' },
      data: 'API is under construction. Please try after some time.'
    });
  },

  findAll: async (req, res) => {
    const p = await Models.post.findAll({});
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  create: async (req, res) => {
    const id = await Models.id.findOne({});
    if(id.error) { return res.status(404).set('Content-Type', 'application/json').send(id.error); }

    /**
     * @description Increment id field with 1.
     */
    await Models.id.updateOne({'post': id.data.post}, {'post': Number(id.data.post) + 1}, {});

    /**
     * @description SET id property for Admin.
     */

    req.body.id = id.data.post;
    if(req.file) { req.body.image = req.file.filename; }
    const p = await Models.post.create(req.body);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }

    return res.status(200).send(p);
  },

  updateOne: async (req, res) => {
    const p = await Models.post.updateOne(req.params, req.body, {});
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  deleteOne: async (req, res) => {
    const p = await Models.post.deleteOne(req.params);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

};

module.exports = PostController;