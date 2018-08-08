const express       = require('express');
const multer        = require('multer');
const helpers       = require('../api/helpers/');
const storage       = multer.diskStorage({ destination: './public/upload/image/', filename: helpers.file.getName });
const upload        = multer({ storage: storage, fileFilter: helpers.file.filter });
const avpath        = multer.diskStorage({ destination: './public/upload/avatar/', filename: helpers.file.getName });
const avupload      = multer({ storage: avpath, fileFilter: helpers.file.filter });
const api           = express.Router();

const policies      = require('../api/policies/');
const models        = require('../api/models/');
const Test          = require('../api/controllers/TestController');
const Auth          = require('../api/controllers/AuthController');
const User          = require('../api/controllers/UserController');
const Post          = require('../api/controllers/PostController');
const Kafka         = require('../api/controllers/KafkaController');

models.connect();

const routes = () => {

  api.get('/test', policies.track, Test.find);

  /**
   * GET
   * /api/user/checkemail/:email,
   * /api/user/checkusername/:username   is now POST /api/user/findExists
   * 
   * POST
   * /api/user/resend             is now POST /api/auth/resend
   * /api/user/activate/:token    will be POST /api/auth/validate?token=token
   * /api/user/register           is now POST /api/user
   * /api/user/uploadAvatar,
   * /avatar/:username            is working with PUT /api/user/:username
   * 
   * PUT
   * /api/user/unlock,
   * /api/user/savepassword       are now PUT /api/user/:username
   */
  api.post('/auth/resend', policies.track, Auth.resendValidationMail);
  api.post('/auth/validate', policies.track, Auth.validateEmail);

  api.post('/user/findExists', policies.track, User.findExists);
  api.post('/user', policies.track, User.create);
  api.delete('/user/:username', policies.track, User.delete);
  api.put('/user/:username', policies.track, avupload.single('avatar'), User.update);

  api.get('/post', policies.track, Post.find);
  api.post('/post', policies.track, upload.single('image'), Post.create);

  api.get('/kafka/:message', policies.track, Kafka.find);

  return api;
};

module.exports = routes();