//REQUIRES
//MAIN
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');
const url = require('url');
const busboy = require('connect-busboy');
const gridfs = require('gridfs-stream');
//LOGGING
const morgan  = require('morgan');
//FILES
var fs = require('fs');
var rfs = require('rotating-file-stream');
//Original Websockets library
const WebSocket = require('ws');
//const WebSocket = require('uws');
//CUSTOM
const constants = require('./utilities/constants');
const utils = require('./utilities/utilities');
const users = require('./routes/users');
const socketengine = require('./services/socketengine');
const user = require('./models/user');

const passportConfig = require('./config/passport');

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
const accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    size:     '10M', // rotate every 10 MegaBytes written
    compress: 'gzip', // compress rotated files
    path: logDirectory
});

app.use(busboy());

//This tells express to log via morgan
//and morgan to log in the "combined" pre-defined format
app.use(morgan('combined', { stream: accessLogStream }));
//That's it. Everything in your snippet after this are just
//other variations your might want to use

//Setup Socket.io
// const server = http.createServer(express);
// const io = socketio(server);
// //Start
// io.on('connection', function(){
//   socket.on('reply', function(){
//    console.log('reply received');
//  }); // listen to the event
// });
// server.listen(constants.socketioPort);

//Setup Websockets
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true);
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message', function incoming(message) {
    socketengine.parseCommandRequest(ws, message);
    console.log('received: %s', message);
  });

  ws.send('something');
});
server.listen(8080, function listening() {
  console.log(`[${utils.getDateTimeNow()}] WebSocket started on port: ${server.address().port} - Listening...`);
});

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

//Setup CORS (Cross-Origin Resource Sharing)
app.use(cors());

//Set up Body Parser Middleware (Parse incoming request bodies in a middleware before your handlers, available under the req.body)
app.use(bodyParser.json());

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

app.get('/avatars/:username', (req, res) => {
  console.log(path.join(__dirname, 'uploads/images/avatars/') + req.params.username + '.png');
  res.sendFile(path.join(__dirname, 'uploads/images/avatars/') + req.params.username + '.png');
});

//Force all other requests to home
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/index/html'));
// });

//module.exports = conn;
