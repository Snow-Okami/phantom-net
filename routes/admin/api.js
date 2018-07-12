//REQUIRES
const express = require('express');
const router = express.Router();

//CUSTOM MIDDLEWARES
const login = require('./authentication/login');
const tokenVerification = require('./authentication/token_verify'); 
const createPost = require('./posts/create_post');

//Login API
router.post('/authentication/login', login);
//Create a new post API
router.post('/post/create' , tokenVerification, createPost);

module.exports = router;