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
  api.get('/admin/:email', Policies.isLoggedIn, AdminController.findOne);
  api.get('/admins', Policies.isLoggedIn, AdminController.findAll);
  api.post('/admin', AdminController.create);
  api.post('/admin/login', AdminController.login);
  api.post('/admin/logout', Policies.isLoggedIn, AdminController.logout);
  /**
   * @description Request Body can contain Form-Data or Raw JSON data.
   */
  api.put('/admin/:email', Policies.isLoggedIn, UploadAvatar.single('avatar'), AdminController.updateOne);
  api.delete('/admin/:email', Policies.isLoggedIn, AdminController.deleteOne);

  /**
   * @description Post API CRUD operation.
   */
  api.get('/post/:id', Policies.isLoggedIn, PostController.findOne);
  /**
   * @param sort: -1 (Descending) (Default) & 1 (Ascending). OPTIONAL Query Parameter.
   * @param skip: Only POSITIVE Numbers. Default is 0. OPTIONAL Query Parameter.
   * @param limit: Only POSITIVE Numbers. Default is 10. OPTIONAL Query Parameter.
   */
  api.get('/post', Policies.isLoggedIn, PostController.findLimited);
  api.get('/posts', Policies.isLoggedIn, PostController.findAll);
  api.post('/post', Policies.isLoggedIn, UploadImage.single('image'), PostController.create);

  return api;
};

module.exports = routes();