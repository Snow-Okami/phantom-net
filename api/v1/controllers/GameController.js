const Models = require('../models').objects;
const bycript = require('../models').bycript;
const _ = require('../models')._;
const jwt = require('../helpers/jwt');

const GameController = {
  findOne: async (req, res) => {
    const a = await Models.game.findOne(req.params, {});
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  /**
   * @description Need to complete this API.
   */
  findLimited: async (req, res) => {
    /** @params findLimited(query, options)  */
    /** @description options: {
     *  sort: { createdAt: -1 } // -1 is desc, 1 is asc in order.
     *  skip: Number // 0, 1, 2 ..., n
     *  limit: Number // 0, 1, 2 ..., n
     *  select: Array<String>
     * }
     * */
    const a = await Models.game.findLimited(req.params, {});
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