const utils  = require('../utils/');
const models = require('../models/');

const API = {
  find: async (req, res) => {
    return true;
  },

  create: async (req, res) => {
    console.log(req.body);
    return res.send('Okay!');
  },

  update: async (req, res) => {
    return true;
  },

  delete: async (req, res) => {
    return true;
  },
};

module.exports = API;