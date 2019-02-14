const Models = require('../models/').objects;
const _ = require('../models/')._;

const ReplyController = {

  create: async (req, res) => {

    if(!req.body.commentId || !req.body.createdFor) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'please include commentId & createdFor in body.' }); }

    let p = await Models.comment.findOne({ id: req.body.commentId });
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }

    const id = await Models.id.findOne({});
    if(id.error) { return res.status(404).set('Content-Type', 'application/json').send(id.error); }

    /**
     * @description Increment id field with 1.
     */
    let idu = {q: {'reply': id.data.reply}, d: {'reply': Number(id.data.reply) + 1}};
    await Models.id.updateOne(idu.q, idu.d, {});

    /**
     * @description SET id property for Admin.
     */
    req.body.id = id.data.reply;

    const c = await Models.reply.create(req.body);
    if(c.error) { return res.status(404).set('Content-Type', 'application/json').send(c.error); }

    let cid = _.map(p.data.replies, '_id').concat(c.data._id);
    p = await Models.comment.updateOne({'id': req.body.commentId}, {'replies': cid}, {});
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }

    return res.status(200).send(c);
  }
};

module.exports = ReplyController;