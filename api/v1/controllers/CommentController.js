const Models = require('../models/').objects;
const _ = require('../models/')._;

const CommentController = {
  findOne: async (req, res) => {
    if(!req.params.type) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'Please include type in body. Type is either comment or reply.' }); }

    let t = ['comment', 'reply'];
    if(!_.includes(t, req.params.type)) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'type is either comment or reply.' }); }

    const p = await Models.post.findOne(req.params);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  findAll: async (req, res) => {
    if(!req.params.type) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'Please include type in body. Type is either comment or reply.' }); }

    let t = ['comment', 'reply'];
    if(!_.includes(t, req.params.type)) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'type is either comment or reply.' }); }

    const p = await Models.comment.findAll({'type': req.params.type});
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  create: async (req, res) => {
    if(!req.body.type) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'Please include type in body. Type is either comment or reply.' }); }

    let t = ['comment', 'reply'];
    if(!_.includes(t, req.body.type)) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'type is either comment or reply.' }); }

    const id = await Models.id.findOne({});
    if(id.error) { return res.status(404).set('Content-Type', 'application/json').send(id.error); }

    /**
     * @description Increment id field with 1.
     */
    let idu = req.body.type === 'comment' ? {q: {'comment': id.data.comment}, d: {'comment': Number(id.data.comment) + 1}} : {q: {'reply': id.data.reply}, d: {'reply': Number(id.data.reply) + 1}};
    await Models.id.updateOne(idu.q, idu.d, {});

    /**
     * @description SET id property for Admin.
     */
    req.body.id = id.data.post;

    const p = await Models.comment.create(req.body);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }

    return res.status(200).send(p);
  }
};

module.exports = CommentController;