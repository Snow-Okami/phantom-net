const express = require('express');
const multer = require('multer');
const Policies = require('../api/v1/policies');
const FileHelper = require('../api/v1/helpers/file');
require('../api/v1/models/').connect();

const storage = multer.diskStorage({ destination: './public/data_store/', filename: FileHelper.getName });
const Upload = multer({ storage: storage, fileFilter: FileHelper.filter });

const TestController = require('../api/v1/controllers/TestController');
const UserController = require('../api/v1/controllers/UserController');
const DatabaseController = require('../api/v1/controllers/DatabaseController');

const api = express.Router();

/**
 * @description version 1 API routes
 */
const routes = () => {
  api.get('/test', TestController.findAll);

  /**
   * @description User API CRUD operation.
   */
  api.get('/user/:username', UserController.findOne);
  api.get('/users', UserController.findAll);
  api.post('/user', UserController.create);
  api.put('/user/:username', UserController.updateOne);
  api.delete('/user/:username', UserController.deleteOne);

  /**
   * @description store JSON data to MongoDB database.
   */
  api.post('/store', Upload.array('files'), DatabaseController.create);

  return api;
};

module.exports = routes();