const express = require('express');
const multer = require('multer');
const Policies = require('../api/v1/policies');
const FileHelper = require('../api/v1/helpers/file');
require('../api/v1/models/').connect();
require('../api/v1/models/').joinCloudinary();

let storage = multer.diskStorage({ destination: './public/image/avatar/', filename: FileHelper.getName });
const UploadAvatar = multer({ storage: storage, fileFilter: FileHelper.filter });

storage = multer.diskStorage({ destination: './public/image/post/', filename: FileHelper.getName });
const UploadImage = multer({ storage: storage, fileFilter: FileHelper.filter });

const TestController = require('../api/v1/controllers/TestController');
const AdminController = require('../api/v1/controllers/AdminController');
const PostController = require('../api/v1/controllers/PostController');

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
  api.post('/admin/login', AdminController.login);
  api.post('/admin/logout', AdminController.logout);
  /**
   * @description Request Body can contain Form-Data or Raw JSON data.
   */
  api.put('/admin/:email', UploadAvatar.single('avatar'), AdminController.updateOne);
  api.delete('/admin/:email', AdminController.deleteOne);

  /**
   * @description store JSON data to MongoDB database.
   */
  // api.post('/store', Upload.array('files'), DatabaseController.create);

  /**
   * @description Post API CRUD operation.
   */
  api.get('/post/:id', PostController.findOne);
  /**
   * @param sort: -1 (Descending) (Default) & 1 (Ascending). OPTIONAL Query Parameter.
   * @param skip: Only POSITIVE Numbers. Default is 0. OPTIONAL Query Parameter.
   * @param limit: Only POSITIVE Numbers. Default is 10. OPTIONAL Query Parameter.
   */
  api.get('/post', Policies.isLoggedIn, PostController.findLimited);
  api.get('/posts', PostController.findAll);
  api.post('/post', UploadImage.single('image'), PostController.create);

  return api;
};

module.exports = routes();