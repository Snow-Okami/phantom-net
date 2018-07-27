require('dotenv').config();
const express       = require('express');
const bodyParser    = require('body-parser');
const http          = require('http');
const config        = require('./config/');
const cors          = require('cors');
const app           = express();

app.set('hostname', '127.0.0.1');
app.set('port', 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/api', config);

const server = http.createServer(app);

server.listen(app.get('port'), app.get('hostname'), function() {
  console.log('Welcome to NodeJS server application!');
  console.log('Server running at http://127.0.0.1:3000/api');
});
