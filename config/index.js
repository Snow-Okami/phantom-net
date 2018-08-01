const express       = require('express');
const multer        = require('multer');
const upload        = multer({ dest: './upload/image/' });
const api           = express.Router();

const policies      = require('../api/policies/');
const models        = require('../api/models/');
const Test          = require('../api/controllers/TestController');
const User          = require('../api/controllers/UserController');
const Post          = require('../api/controllers/PostController');

models.connect();

const routes = () => {

  api.get('/test', policies.track, Test.find);

  api.post('/user', policies.track, User.create);
  api.delete('/user/:name', policies.track, User.delete);

  api.get('/post', policies.track, Post.find);
  api.post('/post', policies.track, upload.single('image'), Post.create);

  return api;
};

module.exports = routes();