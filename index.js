require('dotenv').config();
const express       = require('express');
const bodyParser    = require('body-parser');
const http          = require('http');
const cors          = require('cors');
const config        = require('./config/');
const app           = express();

app.set('hostname', process.env.serverhostname);
app.set('port', process.env.serverport);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use('/api', config);

const server = http.createServer(app);

server.listen(app.get('port'), app.get('hostname'), function() {
  console.log('Welcome to NodeJS server application!');
  console.log('Server running at http://' + process.env.serverhostname + ':' + process.env.serverport + '/api');
});
