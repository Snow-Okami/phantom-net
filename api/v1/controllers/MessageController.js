const Models = require('../models/').objects;
const _ = require('../models/')._;

let io, Socket;

const MessageController = {
  connect: async (server) => {
    io = require('socket.io')(server);
    io.on('connection', MessageController.connected);
  },

  connected: async (res) => {
    Socket = res;
    // console.log('socket', Socket.handshake.headers);

    Socket.on('login', MessageController.onLogin);
  },

  onLogin: async (data) => {
    console.log('data ', data);
  }
};

module.exports = MessageController;
