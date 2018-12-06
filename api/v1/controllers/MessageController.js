const Models = require('../models/').objects;
const _ = require('../models/')._;
const cookie = require('../helpers/cookie');
const chat = require('../helpers/chat');
const jwt = require('../helpers/jwt');

let io;

const MessageController = {

  data: {
    users: {}
  },

  policy: {
    /**
     * @description Check Bearer token for security.
     */
    isSecure: async (param) => {
      /**
       * @description DECODE the cookie to get 'ps-t-a-p' & 'ps-u-a-p' keys.
       */
      const c = await cookie.decode(param.localCookie);
      const token = await jwt.decode(c['ps-t-a-p']);
      if(token.error) { return token; }

      const u = await Models.user.findOne(
        _.pick(token, ['email', 'createdAt', 'jwtValidatedAt', 'capability'])
      );
      if(u.error) { return u; }

      return u.data;
    }
  },

  connect: async (server) => {
    io = require('socket.io')(server);

    /**
     * @description EventListeners should stay inside the connect().
     */
    io.on('connection', async (Socket) => {
      /**
       * @description Login EventListener is here.
       */
      Socket.on('login', async (param) => {
        /**
         * @description Socket.handshake.headers.cookie contains the default cookie parameters.
         */
        const u = await MessageController.policy.isSecure(Object.assign({}, Socket.handshake.headers, param));
        if(u.error) { return u; }

        /**
         * @description Updates user's online field.
         */
        const ur = await Models.user.updateOne({ email: u.email }, { online: true });
        if(ur.error) { return ur; }

        const ch = await Models.chat.findAll({ users: u.email });
        if(ch.error) { return ch; }

        /**
         * @description Create CHAT rooms using chat ids.
         */
        let rooms = _.map(ch.data, (o) => { return '_c' + o.id; });        

        Socket.join(rooms, async () => {
          /**
           * @description Required when we do not have cookie support on server.
           */
          MessageController.data.users[u.email] = {};
          MessageController.data.users[u.email].rooms = Object.keys(Socket.rooms);

          console.log(u.email, 'is connected', MessageController.data.users[u.email]);
        });

      });

      /**
       * @description Disconnected EventListener is here.
       */
      Socket.on('disconnect', async (reason) => {
        /**
         * @description Get from controller data when cookie not available.
         */
        let email = await chat.getEmail(MessageController.data.users, Socket.id);

        await Models.user.updateOne({ email: email }, { online: false });

        console.log(email, 'is disconnected for', reason);
      });
    });
  }

};

module.exports = MessageController;
