const services  = require('../services/');
const utils     = require('../utils/');
const env       = require('../../environment/');

const socket = {
  connect: async (WebSocket, server) => {
    const wss = new WebSocket.Server({
      server,
      verifyClient: function (info, cb) {
        cb(true);
      }
    });
    
    wss.on('connection', async function connection(ws, req) {
      const ip = req.connection.remoteAddress;
      const proxyIp = req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];
      console.log({ 'ip': ip, 'proxyIp': proxyIp });
    
      ws.on('open', async function open() {
        await services.socket.openWs(ws, req.user.username);
        console.log('connected!');
      });
    
      ws.on('close', async function close() {
        await services.socket.closeWs(ws);
        console.log('disconnected!');
      });
    
      ws.on('error', async function error() {
        console.log('error detected!');
      });
    
      ws.on('message', async function incoming(data) {
        var msg = utils.addToFrontOfString(data, req.user.username, env.const.RECIPIENT_SEPARATOR);
        console.log('received: %s', msg);
      });
    
    });
    
    server.listen(process.env.socketport, function() {
      console.log('WebSocket started on port: ' + process.env.socketport);
    });
  }
}

module.exports = socket;