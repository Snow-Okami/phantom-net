//REQUIRES
const express = require('express');
const router = express.Router();

//CUSTOM MIDDLEWARES
const login = require('./authentication/login')

//Login API
router.post('/authentication/login', login)

module.exports = router;