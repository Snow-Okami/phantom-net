const Models = require('../models/').objects;
const _ = require('../models/')._;

const CommentController = {
  findOne: async (req, res) => {
    const p = await Models.comment.findOne(req.params);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  findAll: async (req, res) => {
    const p = await Models.comment.findAll({});
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  create: async (req, res) => {

    if(!req.body.postId || !req.body.createdFor) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'please include postId & createdFor in body.' }); }

    let p = await Models.post.findOne({'id': req.body.postId});
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }

    const id = await Models.id.findOne({});
    if(id.error) { return res.status(404).set('Content-Type', 'application/json').send(id.error); }

    /**
     * @description Increment id field with 1.
     */
    let idu = {q: {'comment': id.data.comment}, d: {'comment': Number(id.data.comment) + 1}};
    await Models.id.updateOne(idu.q, idu.d, {});

    /**
     * @description SET id property for Admin.
     */
    req.body.id = id.data.comment;

    const c = await Models.comment.create(req.body);
    if(c.error) { return res.status(404).set('Content-Type', 'application/json').send(c.error); }

    const cp = await Models.comment.findOne({id: c.data.id});
    if(cp.error) { return res.status(404).set('Content-Type', 'application/json').send(cp.error); }

    let cid = _.map(p.data.comments, '_id').concat(c.data._id);
    p = await Models.post.updateOne({'id': req.body.postId}, {'comments': cid}, {});
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }

    return res.status(200).send(cp);
  },

  updateOne: async (req, res) => {
    const p = await Models.comment.updateOne(req.params, req.body, {});
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  }
};

module.exports = CommentController;