const Models = require('../models').objects;
const bycript = require('../models').bycript;
const _ = require('../models')._;
const jwt = require('../helpers/jwt');

const GameController = {

  findOne: async (req, res) => {
    const params = req.query;
    const option = {
      select: params.select ? params.select.split(',') : [],
      populate: params.populate ? params.populate.split(',') : []
    };
    const a = await Models.game.findOne(req.params, option);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  findLimited: async (req, res) => {
    const params = req.query;
    const option = {
      sort: {},
      skip: Number(params.skip) || 0,
      limit: Number(params.limit) || 100,
      select: params.select ? params.select.split(',') : [],
      populate: params.populate ? params.populate.split(',') : []
    };
    option.sort[params.sortedBy || 'createdAt'] = Number(params.sort) || 1;
    const a = await Models.game.findLimited(req.params, option);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  create: async (req, res) => {
    const a = await Models.game.create(req.body);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },
};

module.exports = GameController;