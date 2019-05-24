const ObjectId = require('../models/').ObjectId;
const Models = require('../models/').objects;
const _ = require('../models/')._;

const AchievementController = {

  findOne: async (req, res) => {
    const p = await Models.achievement.findOne(req.params);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  findAll: async (req, res) => {
    const p = await Models.achievement.findAll({});
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  create: async (req, res) => {
    const a = await Models.achievement.create(req.body);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  updateOne: async (req, res) => {
    const a = await Models.achievement.updateOne(req.params, req.body, {});
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  updateOneByCustomAPI: async (req, res) => {
    const p = await Models.achievement.findOne(req.params);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    /**
     * @description remove users array to get rid of data loss
     */
    req.body = _.omit(req.body, ['users']);
    /**
     * @description generate users array from email field
     */
    if(req.body.id || req.body._id || req.body.email || req.body.username) {
      const u = await Models.user.findOne(_.pick(req.body, ['_id', 'id', 'email', 'username']));
      if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }
      req.body.users = _.uniq(_.concat(_.map(p.data.users, uid => new ObjectId(uid).toString()), new ObjectId(u.data._id).toString()));
    } else {
      return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'please include user\'s _id or id or email or username!' });
    }

    const a = await Models.achievement.updateOne(req.params, req.body, {});
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  deleteOne: async (req, res) => {
    const a = await Models.achievement.deleteOne(req.params);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  }

};

module.exports = AchievementController;