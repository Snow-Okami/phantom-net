const Models = require('../models/').objects;
const _ = require('../models/')._;

const NewsController = {

  findOne: async (req, res) => {
    const p = await Models.news.findOne(req.params);
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
    
    const p = await Models.news.findLimited(query, option);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  findAll: async (req, res) => {
    const p = await Models.news.findAll({});
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  create: async (req, res) => {
    const p = await Models.news.create(req.body);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  updateOne: async (req, res) => {
    const p = await Models.news.updateOne(req.params, req.body, {});
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  deleteOne: async (req, res) => {
    const p = await Models.news.deleteOne(req.params);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    return res.status(200).send(p);
  },

  createHTML: async (req, res) => {
    /**
     * @description create the news
     */
    const p = await Models.news.create(req.body);
    if(p.error) { return res.status(404).set('Content-Type', 'application/json').send(p.error); }
    /**
     * @description bind data with the template & return
     */
    const r = await Models.template.create({ template: 'news' }, req.body);
    if(r.error) { return res.status(404).set('Content-Type', 'application/json').send(r.error); }
    return res.status(200).set('Content-Type', 'text/html').send(r.data);
  },

};

module.exports = NewsController;