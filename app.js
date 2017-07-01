//REQUIRES
//MAIN
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const bodyParser = require('body-parser');
//CUSTOM
const constants = require('./utilities/constants');
const utils = require('./utilities/utilities');
const users = require('./routes/users');

const passportConfig = require('./config/passport');

//Set Mongo Promise
mongoose.Promise = global.Promise;

//Connect to MongoDB
mongoose.connect(constants.database);

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
const port = process.env.PORT || 3000;

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
  console.log(`[${utils.getDateTimeNow()}] Server started on port: ${port} - Listening...`);
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
