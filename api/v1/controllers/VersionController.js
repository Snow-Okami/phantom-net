const Models = require('../models').objects;

const VersionController = {

  findOne: async (req, res) => {
    const v = await Models.version.findOne(req.params);
    if(v.error) { return res.status(404).set('Content-Type', 'application/json').send(v.error); }
    return res.status(200).send(v);
  },
    
  create: async (req, res) => {
    const v = await Models.version.create(req.body);
    if(v.error) { return res.status(404).set('Content-Type', 'application/json').send(v.error); }
    return res.status(200).send(v);
  },

  updateOne: async (req, res) => {
    const v = await Models.version.updateOne(req.params, req.body, {});
    if(v.error) { return res.status(404).set('Content-Type', 'application/json').send(v.error); }
    return res.status(200).send(v);
  },
  
  };
  
  module.exports = VersionController;