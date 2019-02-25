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
const ReplyController = require('../api/v1/controllers/ReplyController');
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
  api.get('/user/:email', Policies.isLoggedIn, UserController.findOne);
  api.get('/users', Policies.isAdmin, UserController.findAll);
  api.post('/user', UserController.create);
  api.post('/user/login', UserController.login);
  api.post('/user/logout', UserController.logout);
  /**
   * @description Request Body can contain Form-Data or Raw JSON data.
   */
  api.put('/user/:email', Policies.isLoggedIn, UploadAvatar.single('avatar'), UserController.updateOne);
  api.delete('/user/:email', Policies.isAdmin, UserController.deleteOne);

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
  api.get('/posts', Policies.isAdmin, PostController.findAll);
  api.post('/post', Policies.isAdmin, UploadImage.single('image'), PostController.create);
  api.put('/post/:id', Policies.isAdmin, UploadImage.single('image'), PostController.updateOne);

  /**
   * @description Comments API CRUD operation.
   */
  api.get('/postcomment/:id', CommentController.findOne);
  api.get('/postcomments', CommentController.findAll);
  api.post('/postcomment', CommentController.create);

  /**
   * @descaription Reply CRUD API operation.
   */
  api.get('/commentreply/:id', ReplyController.create);
  api.get('/commentreplies', ReplyController.create);
  api.post('/commentreply', ReplyController.create);

  return api;
};

module.exports = routes();