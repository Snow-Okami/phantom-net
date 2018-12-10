const chat = require('../helpers/chat').fn;
const Models = require('../helpers/chat').models;
const _ = require('../helpers/chat')._;

let io;

const MessageController = {

  data: {
    users: {}
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
        const u = await chat.isSecure(Object.assign({}, Socket.handshake.headers, param));
        if(u.error) { return u; }

        /**
         * @description Updates user's online field.
         */
        const ur = await Models.user.updateOne({ email: u.email }, { online: true });
        if(ur.error) { return ur; }

        /**
         * @description Pass the user info 
         */
        io.to(Socket.id).emit('user', _.pick(u, ['email', 'firstName', 'lastName', 'fullName', 'emailValidated', 'avatar', 'online']));

        const ch = await Models.chat.findAll({ "users.email": u.email });
        if(ch.error) { return ch; }

        /**
         * @description Create CHAT rooms using chat ids.
         */
        let rooms = _.map(ch.data, (o) => { return '_c' + o.id; });
        /**
         * @description Sends the CHAT informations to user.
         */
        io.to(Socket.id).emit('chats', ch);

        Socket.join(rooms, async () => {
          /**
           * @description Required when we do not have cookie support on server.
           */
          MessageController.data.users[u.email] = {};
          MessageController.data.users[u.email].rooms = Object.keys(Socket.rooms);

          console.log(u.email, 'is connected', MessageController.data.users[u.email]);
        });

      });

      Socket.on('findLimitedMessage', async (param) => {
        /**
         * @description Socket.handshake.headers.cookie contains the default cookie parameters.
         */
        const u = await chat.isSecure(Object.assign({}, Socket.handshake.headers, param));
        if(u.error) { return u; }

        const m = await Models.message.findLimited(param.message.query, param.message.option);
        if(m.error) { return m; }

        io.to(Socket.id).emit('messages', m);
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
