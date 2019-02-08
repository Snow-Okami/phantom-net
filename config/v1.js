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
const UserController = require('../api/v1/controllers/UserController');
const PostController = require('../api/v1/controllers/PostController');
const CommentController = require('../api/v1/controllers/CommentController');
const VersionController = require('../api/v1/controllers/VersionController');

const api = express.Router();

/**
 * @description version 1 API routes
 */
const routes = () => {
  api.get('/test', TestController.findAll);

  /**
   * @description Version controller CRUD operations.
   */
  api.get('/version', VersionController.findOne);
  api.post('/version', VersionController.create);
  api.put('/version', VersionController.updateOne);

  /**
   * @description Admin API CRUD operation.
   */
  api.get('/admin/:email', Policies.isLoggedIn, UserController.findOne);
  api.get('/admins', Policies.isLoggedIn, UserController.findAll);
  api.post('/admin', UserController.create);
  api.post('/admin/login', UserController.login);
  api.post('/admin/logout', UserController.logout);
  /**
   * @description Request Body can contain Form-Data or Raw JSON data.
   */
  api.put('/admin/:email', Policies.isLoggedIn, UploadAvatar.single('avatar'), UserController.updateOne);
  api.delete('/admin/:email', Policies.isLoggedIn, UserController.deleteOne);

  /**
   * @description Post API CRUD operation.
   */
  api.get('/post/:id', Policies.allowPublic, PostController.findOne);
  /**
   * @param sort: -1 (Descending) (Default) & 1 (Ascending). OPTIONAL Query Parameter.
   * @param skip: Only POSITIVE Numbers. Default is 0. OPTIONAL Query Parameter.
   * @param limit: Only POSITIVE Numbers. Default is 10. OPTIONAL Query Parameter.
   */
  api.get('/post', Policies.allowPublic, PostController.findLimited);
  api.get('/posts', Policies.isLoggedIn, PostController.findAll);
  api.post('/post', Policies.isLoggedIn, UploadImage.single('image'), PostController.create);
  api.put('/post/:id', Policies.isLoggedIn, UploadImage.single('image'), PostController.updateOne);

  /**
   * @description Comments API CRUD operation.
   */
  api.get('/postcomment/:type/:id', CommentController.findOne);
  api.get('/postcomments/:type', CommentController.findAll);
  api.post('/postcomment', CommentController.create);

  return api;
};

module.exports = routes();