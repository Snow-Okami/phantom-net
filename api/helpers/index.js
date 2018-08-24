const mongodb = require('../helpers/MongoDB');
const socketio = require('../helpers/Socket.io');
const websocket = require('../helpers/Websocket');

const helpers = {
  WebSocket: websocket,
  SocketIO: socketio,
  mongo: mongodb
};

module.exports = helpers;