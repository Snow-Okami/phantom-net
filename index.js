console.clear();
console.log('Starting Phantom Net Server Application... Time: ' + new Date().toUTCString());
console.log('using process.env for connections...');

require('dotenv').config();
const express       = require('express');
const bodyParser    = require('body-parser');
const http          = require('http');
const cors          = require('cors');
const morgan        = require('morgan');
const env           = require('./environment/');
const helpers       = require('./api/helpers/');
const config        = require('./config/');
const app           = express();

/**
 * Websocket Module Requirements
 */
const WebSocket       = require('ws');
const expressSession  = require('express-session');
const redis           = require('redis');
const connectRedis    = require('connect-redis');

const redisclient = redis.createClient();
const redisStore = connectRedis(expressSession);
const redisSessionStore = new redisStore({ client: redisclient });

let sessionMiddleware = expressSession({
  store: redisSessionStore,
  key: env.const.expressSessionId,
  secret: env.const.expressSessionSecret,
  resave: true,
  saveUninitialized: true
});

app.set('hostname', process.env.serverhostname);
app.set('port', process.env.serverport);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(morgan('combined', { stream: helpers.log }));
app.use(sessionMiddleware);
app.use(cors());
app.use('/api', config);

const server = http.createServer(app);

helpers.socket.connect(WebSocket, server);

app.listen(app.get('port'), app.get('hostname'), function() {
  console.log('Node.js server running at http://' + process.env.serverhostname + ':' + process.env.serverport + '/api');
});
