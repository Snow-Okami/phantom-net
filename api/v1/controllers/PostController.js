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
    const params = req.query;

    /**
     * @description Convert String to Number.
     */
    const option = {
      sort: Number(params.sort) ? Number(params.sort) : -1,
      skip: Number(params.skip) ? Number(params.skip) : 0,
      limit: Number(params.limit) ? Number(params.limit) : 10
    };
    const p = await Models.post.findLimited({}, option);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
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

    /**
     * @description UPLOADS the image file on Cloudinary.
     */
    if(req.file) {
      let URL = (process.env.DEVELOPMENT ? `http://localhost:${process.env.PORT}/image/post/` : 'https://psynapsus.herokuapp.com/image/post/') + req.file.filename;
      const i = await Models.post.uploadImage(req.file.path);
      req.body.image = i.error ? URL : i['data']['secure_url'];
    }
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