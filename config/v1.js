const express = require('express');
const multer = require('multer');
const Policies = require('../api/v1/policies');
const FileHelper = require('../api/v1/helpers/file');
require('../api/v1/models/').connect();

const storage = multer.diskStorage({ destination: './public/avatar/', filename: FileHelper.getName });
const Upload = multer({ storage: storage, fileFilter: FileHelper.filter });

const TestController = require('../api/v1/controllers/TestController');
const AdminController = require('../api/v1/controllers/AdminController');
// const DatabaseController = require('../api/v1/controllers/DatabaseController');

const api = express.Router();

/**
 * @description version 1 API routes
 */
const routes = () => {
  api.get('/test', TestController.findAll);

  /**
   * @description Admin API CRUD operation.
   */
  api.get('/admin/:email', AdminController.findOne);
  api.get('/admins', AdminController.findAll);
  api.post('/admin', AdminController.create);
  api.put('/admin/:email', AdminController.updateOne);
  api.delete('/admin/:email', AdminController.deleteOne);

  /**
   * @description store JSON data to MongoDB database.
   */
  // api.post('/store', Upload.array('files'), DatabaseController.create);

  return api;
};

module.exports = routes();