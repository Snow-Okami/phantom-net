const chat = require('../helpers/chat').fn;
const Models = require('../helpers/chat').models;
const _ = require('../helpers/chat')._;

let io;

const MessageController = {

  data: {
    users: {},
    initCRId: '_croom_'
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
        io.to(Socket.id).emit('user', _.pick(u, ['username', 'email', 'firstName', 'lastName', 'fullName', 'emailValidated', 'avatar', 'online']));

        const ch = await Models.chat.findAll({ "users.email": u.email });
        if(ch.error) { return ch; }

        /**
         * @description Create CHAT rooms using chat ids.
         */
        let rooms = _.map(ch.data, (o) => { return MessageController.data.initCRId + o.id; });
        /**
         * @description Sends the CHAT informations to user.
         */
        io.to(Socket.id).emit('chats', ch);

        Socket.join(rooms, async () => {
          /**
           * @description Required when we do not have cookie support on server.
           */
          if(!MessageController.data.users[u.email]) { MessageController.data.users[u.email] = {}; MessageController.data.users[u.email].rooms = []; }
          MessageController.data.users[u.email].rooms = _.concat(_.difference(MessageController.data.users[u.email].rooms, Object.keys(Socket.rooms)), Object.keys(Socket.rooms));

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
       * @description Text occurs when somebody sends a message.
       */
      Socket.on('text', async (param) => {
        /**
         * @description Socket.handshake.headers.cookie contains the default cookie parameters.
         */
        const u = await chat.isSecure(Object.assign({}, Socket.handshake.headers, param));
        if(u.error) { return u; }

        const id = await Models.id.findOne({});
        if(id.error) { return id; }

        /**
         * @description Increment id field with 1.
         */
        await Models.id.updateOne({'message': id.data.message}, {'message': Number(id.data.message) + 1}, {});
        /**
         * @description SET id property for Message.
         */
        param.message.query.id = id.data.message;

        const p = await Models.message.create(param.message.query);
        if(p.error) { return p; }

        /**
         * @description Update the time of last message.
         */
        let time = new Date().getTime();
        const nu = await Models.chat.updateOne({ id: param.message.query.cid }, { lastMessage: _.pick(p.data, ['cid', 'text', 'createdBy', 'createdAt']), updatedAt: time }, {});
        if(nu.error) { return nu; }

        // emit in the chat room.
        io.to(MessageController.data.initCRId + param.message.query.cid).emit('texted', { lastMessage: _.pick(p.data, ['cid', 'text', 'createdBy', 'id', 'createdAt']) });
      });

      Socket.on('search', async (param) => {
        /**
         * @description Socket.handshake.headers.cookie contains the default cookie parameters.
         */
        const u = await chat.isSecure(Object.assign({}, Socket.handshake.headers, param));
        if(u.error) { return u; }

        const expr = new RegExp('(' + param.message.query.text + ')', 'gmi');
        let p = await Models.user.findAll({ email: { $regex: expr } });
        /**
         * @description filter the packet.
         */
        if(!p.error) {
          _.remove(p.data, (t_u) => { return t_u.email === u.email });
          p.data = _.map(p.data, (t_u) => { return _.pick(t_u, ['username', 'email', 'fullName', 'id', 'online', 'avatar']) });
          /**
           * @description when no user exists in data.
           */
          if(!p.data.length) { p = { error: { type: 'error', text: 'no user found!' } }; }
        }
        /**
         * @description send packet to user.
         */
        io.to(Socket.id).emit('packet', p);
      });

      Socket.on('chat', async (param) => {
        /**
         * @description Socket.handshake.headers.cookie contains the default cookie parameters.
         */
        const u = await chat.isSecure(Object.assign({}, Socket.handshake.headers, param));
        if(u.error) { return u; }

        const id = await Models.id.findOne({});
        if(id.error) { return id; }

        /**
         * @description Increment id field with 1.
         */
        await Models.id.updateOne({'chat': id.data.chat}, {'chat': Number(id.data.chat) + 1}, {});

        const au = _.pick(u, ['username', 'email', 'fullName']);
        /**
         * @description bind the admin with the chat.
         */
        param.message.query.users.push(au);
        Object.assign(param.message.query, { admin: au, messages: [], type: param.message.query.users.length > 2 ? 1 : 0, id: id.data.chat });

        const c = await Models.chat.create(param.message.query);
        if(c.error) { return c; }

        let room = MessageController.data.initCRId + c.data.id;
        /**
         * @description filter all online users socket ids.
         */
        let t_d = MessageController.data
        , aou = []
        , t_aou = _.map(c.data.users,(cu)=>{if(t_d.users[cu.email]){return _.filter(t_d.users[cu.email].rooms,(cr)=>{return !cr.includes(t_d.initCRId);});}else{return [];}});_.forEach(t_aou,(t_a)=>{aou=_.concat(aou,t_a);});
        /**
         * @description share the packet to everybody in the chat.
         */
        _.forEach(aou, (sid) => { if(sid) { io.to(sid).emit('cPacket', { chat: c, room: room }); } });
      });

      /**
       * @description join the socket room.
       */
      Socket.on('join', async (param) => {
        /**
         * @description Socket.handshake.headers.cookie contains the default cookie parameters.
         */
        const u = await chat.isSecure(Object.assign({}, Socket.handshake.headers, param));
        if(u.error) { return u; }

        Socket.join(param.message.room, async () => {
          /**
           * @description Required when we do not have cookie support on server.
           */
          if(!MessageController.data.users[u.email]) { MessageController.data.users[u.email] = {}; MessageController.data.users[u.email].rooms = []; }
          MessageController.data.users[u.email].rooms = _.concat(_.difference(MessageController.data.users[u.email].rooms, Object.keys(Socket.rooms)), Object.keys(Socket.rooms));
        });
      });

      /**
       * @description confirms & sends the typing response.
       */
      Socket.on('typing', async (param) => {
        /**
         * @description Socket.handshake.headers.cookie contains the default cookie parameters.
         */
        const u = await chat.isSecure(Object.assign({}, Socket.handshake.headers, param));
        if(u.error) { return u; }

        Socket.to(MessageController.data.initCRId + param.message.query.cid).emit('typing', { lastMessage: param.message.query });
      });

      /**
       * @description confirms typing is completed.
       */
      Socket.on('typed', async (param) => {
        Socket.to(MessageController.data.initCRId + param.message.query.cid).emit('typed', param.message.query);
      });

      /**
       * @description Disconnected EventListener is here.
       */
      Socket.on('disconnect', async (reason) => {
        /**
         * @description Get from controller data when cookie not available.
         */
        let email = await chat.getEmail(MessageController.data.users, Socket.id);

        // remove disconnected socket ids from server.
        if(email) { _.remove(MessageController.data.users[email].rooms, (t_id) => { return t_id === Socket.id }); }
        
        await Models.user.updateOne({ email: email }, { online: false });
        
        console.log(email, 'is disconnected for', reason);
      });

      /**
       * @description Stay alive.
       */
      Socket.on('keep alive', async (param) => { let d = new Date(); let op = { connection: 'alive', time: d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() }; });
    });
  }

};

module.exports = MessageController;
