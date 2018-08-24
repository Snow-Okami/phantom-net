const SocketIO = require('./api/helpers/Socket.io');
const app = require('express')();
const http = require('http')
const server = http.Server(app);
const io = require('socket.io')(server);

global.app = app;
global.http = http;
global.io = io;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

const nodeServer = {
  connect: async () => {
    SocketIO.init();
    server.listen(3000, function(){
      console.log('listening on http://localhost:3000');
    });
  }
};

nodeServer.connect();