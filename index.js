/**
 * @description this is a node server project. It will generate several API's.
 */

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const v1 = require('./config/v1');
const v2 = require('./config/v2');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cors({ origin: ['https://psynapsus.netlify.com'
, 'http://localhost:4004'
, 'https://codesandbox.io/s/52w09o3q1k'
, 'https://52w09o3q1k.codesandbox.io'
, 'https://practical-benz-6bc9a1.netlify.com'] }));
app.use('/api/v1', v1);
app.use('/api/v2', v2);

const server = http.Server(app);
/**
 * @description Heroku server listen.
 */
server.listen(process.env.PORT);
/**
 * @description Local server listen.
 */
// server.listen(5000, 'localhost');