/**
 * @description this is a node server project. It will generate several API's.
 */

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const os = require('os');
const v1 = require('./config/v1');
const v2 = require('./config/v2');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));
app.use(cors({ origin: require('./environment/').ao }));
app.use('/api/v1', v1);
app.use('/api/v2', v2);

const server = http.Server(app);

/**
 * @description CHAT SERVER generated in MessageController
 */
require('./api/v1/controllers/MessageController').connect(server);

// console.log(`${os.tmpdir()}/public`, `${__dirname}/public`);

/**
 * @description Heroku server listen.
 */
server.listen(process.env.PORT);
/**
 * @description Local server listen.
 */
// server.listen(5000, 'localhost');