const ObjectId = require('../models/').ObjectId;
const Models = require('../models/').objects;
const Selector = require('../models/').data.selector;
const _ = require('../models/')._;

const AchievementController = {

  findOne: async (req, res) => {
    const p = await Models.achievement.findOne(req.params);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  findAll: async (req, res) => {
    const params = req.query;
    const next = params.populate ? JSON.parse(params.populate) : {};
    const option = {
      sort: !isNaN(Number(params.sort)) ? Number(params.sort) : -1,
      skip: !isNaN(Number(params.skip)) ? Number(params.skip) : 0,
      limit: !isNaN(Number(params.limit)) ? Number(params.limit) : 100,
      select: params.select ? params.select.split(',') : [],
      populate: next ? Object.keys(next).map(path => { return {path: path, select: next[path].length ? next[path].split(',') : Selector[path]}; }) : []
    };

    let q = params.users ? {users: {$in: params.users.split(',')}} : {};
    const p = await Models.achievement.findAll(q, option);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    
    // modify the API response
    p.data = _.groupBy(p.data, it => it.game._id);
    return res.status(200).send(p);
  },

  create: async (req, res) => {
    const option = {
      select: ['achievements'],
    };
    const r = await Models.game.findOne({ _id: req.body.game }, option);
    if(r.error) { return res.status(404).set('Content-Type', 'application/json').send(r.error); }
    /**
     * @description UPLOADS the image file on Cloudinary.
     */
    if(req.file) {
      let URL = (process.env.DEVELOPMENT ? `http://localhost:${process.env.PORT}/image/achievement/` : 'https://psynapsus.herokuapp.com/image/achievement/') + req.file.filename;
      const i = await Models.post.uploadImage(req.file.path);
      req.body.thumbnail = i.error ? URL : i['data']['secure_url'];
    }
    const a = await Models.achievement.create(req.body);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }

    let acv = _.uniq(_.concat(_.map(r.data.achievements, ur => new ObjectId(ur).toString()), new ObjectId(a.data._id).toString()));

    const g = await Models.game.updateOne({ _id: req.body.game }, { achievements: acv }, {});
    if(g.error) { return res.status(404).set('Content-Type', 'application/json').send(g.error); }

    return res.status(200).send(a);
  },

  updateOne: async (req, res) => {
    /**
     * @description UPLOADS the image file on Cloudinary.
     */
    if(req.file) {
      let URL = (process.env.DEVELOPMENT ? `http://localhost:${process.env.PORT}/image/achievement/` : 'https://psynapsus.herokuapp.com/image/achievement/') + req.file.filename;
      const i = await Models.post.uploadImage(req.file.path);
      req.body.thumbnail = i.error ? URL : i['data']['secure_url'];
    }

    /** @description UPDATE the achievement */
    const a = await Models.achievement.updateOne(req.params, req.body, {});
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }

    /** @description Find game which has the achievement */
    const r = await Models.game.findOne({achievements: {$in: [ObjectId(req.params._id)]}}, {});
    if(r.error) { return res.status(404).set('Content-Type', 'application/json').send(r.error); }

    /** @description Remove the achievement from the list */
    _.remove(r.data.achievements, n => ObjectId(n).toString() === req.params._id);

    /** @description Update the same with the game data */
    const g = await Models.game.updateOne(_.pick(r.data, ['_id']), _.pick(r.data, ['achievements']), {});
    if(g.error) { return res.status(404).set('Content-Type', 'application/json').send(g.error); }

    /** @description Finds the new game where it is to be updated */
    const t = await Models.game.findOne({_id: req.body.game}, {});
    if(t.error) { return res.status(404).set('Content-Type', 'application/json').send(t.error); }

    /** @description Append the achievement _id with the games achievement _ids */
    let acv = _.uniq(_.concat(_.map(t.data.achievements, ur => ObjectId(ur).toString()), req.params._id));

    /** @description Update the same with the game data */
    const u = await Models.game.updateOne({ _id: req.body.game }, { achievements: acv }, {});
    if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }

    return res.status(200).send(a);
  },

  deleteOne: async (req, res) => {
    const a = await Models.achievement.deleteOne(req.params);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  updateUsersInAchievement: async (req, res) => {
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
      req.body.users = _.uniq(_.concat(_.map(p.data.users, ur => new ObjectId(ur._id).toString()), new ObjectId(u.data._id).toString()));
    } else {
      return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'please include user\'s _id or id or email or username!' });
    }
    /**
     * @description remove users array to get rid of data loss
     */
    req.body = _.omit(req.body, ['id', '_id', 'email', 'username']);

    const a = await Models.achievement.updateOne(req.params, req.body, {});
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  deleteUserFromAchievement: async (req, res) => {
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
      req.body.users = _.uniq(_.pull(_.map(p.data.users, ur => new ObjectId(ur._id).toString()), new ObjectId(u.data._id).toString()));
    } else {
      return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'please include user\'s _id or id or email or username!' });
    }
    /**
     * @description remove users array to get rid of data loss
     */
    req.body = _.omit(req.body, ['id', '_id', 'email', 'username']);

    const a = await Models.achievement.updateOne(req.params, req.body, {});
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  }

};

module.exports = AchievementController;