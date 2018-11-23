const Models = require('../models/').objects;
const _ = require('../models/')._;
const cookie = require('../helpers/cookie');
const jwt = require('../helpers/jwt');

let io;

const MessageController = {

  data: {

  },

  connect: async (server) => {
    io = require('socket.io')(server);
    io.on('connection', MessageController.connected);
  },

  connected: async (Socket) => {
    /**
     * @description Login EventListener is here.
     */
    Socket.on('login', async (data) => {
      /**
       * @description DECODE the cookie to get 'ps-t-a-p' & 'ps-u-a-p' keys.
       */
      const c = cookie.decode(Socket.handshake.headers.cookie);
      const token = await jwt.decode(c['ps-t-a-p']);
      if(token.error) {
        
      }

      console.log(token.email, ' is connected');
    });

    /**
     * @description Disconnected EventListener is here.
     */
    Socket.on('disconnect', async () => {
      /**
       * @description DECODE the cookie to get 'ps-t-a-p' & 'ps-u-a-p' keys.
       */
      const c = cookie.decode(Socket.handshake.headers.cookie);
      const token = await jwt.decode(c['ps-t-a-p']);
      if(token.error) {
        
      }

      console.log(token.email, ' is disconnected');
    });
  }
};

module.exports = MessageController;
