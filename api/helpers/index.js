const file    = require('./file');
const mailer  = require('./mailer');
const log     = require('./log');
const socket  = require('./socket');
const password  = require('./password');

const helpers = {

  file:   file,
  mailer: mailer,
  log:    log,
  socket: socket,
  password: password

};

module.exports = helpers;