const WebSocket = require('ws');

const helper = {
  init: () => {
    const ws = new WebSocket.Server({ port: 8008 });
    ws.on('connection', function(socket, req) {
      socket.on('message', function(message) {
        console.log('message is: ', message);
      });

      socket.on('close', function(message) {
        console.log('closing message is: ', message);
      });
    });
  }
};

module.exports = helper;