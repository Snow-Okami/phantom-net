const Models = require('../models/').objects;

const DatabaseController = {
  findOne: async (req, res) => {
    
  },

  findLimited: async (req, res) => {
    
  },

  findAll: async (req, res) => {
    
  },

  create: async (req, res) => {
    console.log('files', req.files);
    return res.status(200).send({ 'status': 'We are working on. Please try after some time.' });
  },

  updateOne: async (req, res) => {
    
  },

  deleteOne: async (req, res) => {
    
  }
};

module.exports = DatabaseController;