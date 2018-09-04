const request = require('async-request');

const helper = {
  collection: {},

  init: async () => {
    io.on('connection', (socket) => {
      socket.on('login', (data) => {
        console.log('socket is connected with', data);
      });
    });
  }
};

module.exports = helper;