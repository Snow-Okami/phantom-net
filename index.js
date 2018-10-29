/**
 * @description this is a node server project. It will generate several API's.
 */

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const v1 = require('./config/v1');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/api/v1', v1);

const test = require('upload-npm-module');
test.printMsg();

const server = http.Server(app);
/**
 * @description Heroku server listen.
 */
server.listen(process.env.PORT);
/**
 * @description Local server listen.
 */
// server.listen(5000, 'localhost');