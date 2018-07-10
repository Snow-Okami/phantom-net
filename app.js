//REQUIRES
//MAIN
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');
const jwt = require('jsonwebtoken');
const http = require('http');
const url = require('url');
//LOGGING
const morgan  = require('morgan');
//FILES
var fs = require('fs');
var rfs = require('rotating-file-stream');
//SOCKETS
const WebSocket = require('ws');
//const WebSocket = require('uws');
//CUSTOM
const constants = require('./utilities/constants');
const utils = require('./utilities/utilities');
const users = require('./routes/users');
const socketengine = require('./services/socketengine');
const msgengine = require('./services/messagingengine');
const user = require('./models/user');
const passportConfig = require('./config/passport');
//Redis
const redisclient = redis.createClient();
const redisStore = connectRedis(expressSession);
const redisSessionStore = new redisStore({client: redisclient});

//Set Mongo Promise
mongoose.Promise = global.Promise;

//Connect to MongoDB
mongoose.connect(constants.database, { useMongoClient: false });
// var mongoDB = mongoose.connect(constants.database, {
//     useMongoClient: false,
//     promiseLibrary: global.Promise
// });
//
// mongoDB
//     .then(function (db) {
//         console.log(`[${utils.getDateTimeNow()}] Connected to Database ${constants.database}`);
//     })
//     .catch(function (err) {
//         console.log(`[${utils.getDateTimeNow()}] Failed to connect to Database ${constants.database} - Error: ${err}`);
//     });
//
// module.exports = mongoDB;

// const mongoConnection = mongoose.createConnection(constants.database, {
//     useMongoClient: true,
//     promiseLibrary: global.Promise
//   }).then( () => {
//     var mongoDB = mongoose.connect(constants.database, {
//         useMongoClient: true,
//         promiseLibrary: global.Promise
//     });
//     //Connection Event
//     mongoose.connection.on('connected', () => {
//       console.log(`[${utils.getDateTimeNow()}] Connected to Database ${constants.database}`);
//     });
//
//     //Connection Failure Event
//     mongoose.connection.on('error', (err) => {
//       console.log(`[${utils.getDateTimeNow()}] Failed to connect to Database ${constants.database} - Error: ${err}`);
//     });
//
//
// });
//
// mongoConnection.then( () => {
//
//   mongoConnection.model('User', user.UserSchema);
// }).catch( ()=> {
//
// });

//user.createModel(mongodb);

//const conn = mongoose.createConnection(constants.database);
//mongoose.connect(constants.database);

//Connection Event
mongoose.connection.on('connected', () => {
  console.log(`[${utils.getDateTimeNow()}] Connected to Database ${constants.database}`);
});

//Connection Failure Event
mongoose.connection.on('error', (err) => {
  console.log(`[${utils.getDateTimeNow()}] Failed to connect to Database ${constants.database} - Error: ${err}`);
});

//Start our app using Express Middleware (web framework)
const app = express();

//Setup Port to be environment port (on whatever service we are using) or fallback to 3000
const port = process.env.PORT || constants.expressPort;

//Handle Logging to a file
const logDirectory = path.join(__dirname, 'access.log');
//Set log directory
//Make it if it doesn't exist
fs.access(logDirectory, function (err) {
    if (err && err.code === 'ENOENT') {
        fs.mkdir(logDirectory);
    }
});
//Set up log stream
const accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    size:     '10M', // rotate every 10 MegaBytes written
    compress: 'gzip', // compress rotated files
    path: logDirectory
});

//This tells express to log via morgan
//and morgan to log using rotated file stream
app.use(morgan('combined', { stream: accessLogStream }));

//Setup Websockets
const server = http.createServer(app);
//Set up authentication for connecting to websocket
const wss = new WebSocket.Server({
  server,
  verifyClient: function (info, cb) {
    var signedtoken = info.req.headers.token;
    //console.log(info.req)
    //console.log(info.req.headers);
    console.log(info.req.headers.cookie);
    signedtoken = info.req.headers.cookie;
    signedtoken = signedtoken.substring(6)
    console.log(signedtoken)
    //Safe guard to prevent the app from crashing because it cannot handle
    //a case of a missing token (we must return instead of just using cb)
    // if(!signedtoken) {
    //     cb(false, 401, 'No Token Received');
    //     return false;
    // }
    //Safe guard to prevent the app from crashing because it cannot handle
    //a case of a missing token (we must return instead of just using cb)
    if(signedtoken.length < 4) {
      cb(false, 401, 'Token invalid length:' + signedtoken);
      console.log(signedtoken)
      return false;
    }
    var token = signedtoken.substring(4); //Remove the added 'JWT '
    if (!token)
        cb(false, 401, 'Unauthorized');
    else {
        jwt.verify(token, constants.jwtSecretKey, function (err, decoded) {
            if (err) {
                var failureMsg = `Failed to auth a WS user: ${err}!`;
                console.log(failureMsg);
                cb(false, 401, 'Unauthorized: ' + err);
            } else {
                info.req.user = decoded; //the decoded user that was signed in the JWT
                cb(true);
            }
        });
    }
  }
});

wss.on('connection', function connection(ws, req) {
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  const location = url.parse(req.url, true);
  const ip = req.connection.remoteAddress;
  const proxyIp = req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];
  const user = req.user;
  console.log(ip)
  console.log(proxyIp)
  //OPEN
  const open = () => {
    socketengine.openWs(ws, user.username);
    console.log(`Opened WS: ${ip}!`);
    //Begin detecting broken connections
    socketengine.pong(ws);
    socketengine.ping();
  };
  //This has been done this way for the sake of fashion-> LOL (the code lines up better now)
  open();

  ws.on('close', function (message) {
    socketengine.closeWs(ws);
    console.log(`Closed WS: ${ip}!`);
  });

  ws.on('error', function (err) {
    console.log(`WS: ${err}!`);
  });

  ws.on('message', function incoming(message) {
    //Create final message for parsing
    var finalMsg = utils.addToFrontOfString(message, user.username, constants.RECIPIENT_SEPARATOR);
    //Send message to Kafka for logging (commiting) TODO: Kafka is disabled until it is fixed for windows!
    //msgengine.sendMsgToKafka(finalMsg);
    //Send message to Redis for relaying
    msgengine.sendMsgToRedis(finalMsg);
    console.log(finalMsg)
    console.log(`Received WS Msg: ${message} from ${ip}`);
  });
});

server.listen(8080, function listening() {
  console.log(`[${utils.getDateTimeNow()}] WebSocket started on port: ${server.address().port} - Listening...`);
});

//Setup Kafka TODO: Kafka is disabled until it is fixed for windows!
// msgengine.initKafkaProducer();
// msgengine.initKafkaConsumer();
//Setup Redis
msgengine.initRedis();

//Setup uWebsockets
// const requestHandler = (request, response) =>{
//     response.end('Hello Node.js Server!')
// };
//
// const wss = new WebSocket.Server({ port: 8080 });
// const server = WebSocket.http.createServer(requestHandler);
//
// wss.on('connection', function(ws) {
//   console.log('got connection');
//   ws.on('message', function(message) {
//     socketengine.parseCommandRequest(ws, message);
//     console.log('received: %s', message);
//   });
//
//   ws.send('something');
// });
// server.listen(8080, (err) =>{
//     console.log(`HTTP Server is listening on ${port}`)
// });

//Create express session
var sessionMiddleware = expressSession({
  store: redisSessionStore,
  key: constants.expressSessionId,
  secret: constants.expressSessionSecret,
  resave: true,
  saveUninitialized: true
});
//Use session
app.use(sessionMiddleware);
//Retry session if lost
app.use(function (req, res, next) {
  var tries = 3;

  function lookupSession(error) {
    if (error) {
      return next(error);
    }

    tries -= 1

    if (req.session !== undefined) {
      return next();
    }

    if (tries < 0) {
      return next(new Error('oh no'));
    }

    sessionMiddleware(req, res, lookupSession);
  }

  lookupSession();
});

//Setup CORS (Cross-Origin Resource Sharing)
app.use(cors());

//Set up Body Parser Middleware (Parse incoming request bodies in a middleware before your handlers, available under the req.body)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

//Setup Cookie Parser Middleware
//app.use(cookieParser);

//Passport Middleware (User Authentication)
app.use(passport.initialize());
app.use(passport.session());

//Launch the passport function in passport config
passportConfig(passport);

//Set static files
app.use(express.static(path.join(__dirname, 'public')));

//Use the users routes
app.use('/users', users);

//Begin our Web Service on the port that was chosen
app.listen(port, () => {
  console.log(`[${utils.getDateTimeNow()}] NodeJS Server started on port: ${port} - Listening...`);
});

//Index Route
//Register
app.get('/', (req, res) => {
  res.send('Invalid Endpoint');
});

//Force all other requests to home
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/index/html'));
// });

//module.exports = conn;
