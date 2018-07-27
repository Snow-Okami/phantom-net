const express       = require('express');
const api           = express.Router();

const policies      = require('../api/policies/');
const models        = require('../api/models/');
const Test          = require('../api/controllers/TestController');

models.connect();

const routes = () => {

  api.get('/test', policies.track, Test.find);

  return api;
};

module.exports = routes();