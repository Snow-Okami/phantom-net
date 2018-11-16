const express = require('express');
require('../api/v2/models/').connect();

const ColleagueController = require('../api/v2/controllers/ColleagueController');

const api = express.Router();

/**
 * @description version 2 API routes
 */
const v2 = () => {
  api.get('/colleagues', ColleagueController.findAll);
  api.post('/colleague', ColleagueController.create);
  api.delete('/colleague/:name', ColleagueController.deleteOne);

  return api;
};

module.exports = v2();