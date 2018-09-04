const request = require('async-request');

const helper = {
  collection: {},

  init: async () => {
    io.on('connection', function(socket) {
      console.log(socket, 'is connected');
    });
  }
};

module.exports = helper;