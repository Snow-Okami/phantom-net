const file    = require('./file');
const mailer  = require('./mailer');
const log     = require('./log');
const socket  = require('./socket');
const password  = require('./password');
const jwt       = require('./jwt');
const socketio  = require('./Socket.io');

const helpers = {

  file:   file,
  mailer: mailer,
  log:    log,
  socket: socket,
  password: password,
  jwt: jwt,
  socketio: socketio

};

module.exports = helpers;