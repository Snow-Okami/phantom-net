const db = require('./MongoDB');
const request = require('async-request');

const helper = {
  collection: {},

  init: async () => {
    db.connect();

    helper.collection = {};
    helper.collection.room = {};

    io.on('connection', function(socket){

      socket.on('new connection', function(data) {
        helper.collection[data.username] = socket.id;        
        helper.collection.room['g_' + data.group[0]] = data.group[0];
        socket.join(helper.collection.room['g_' + data.group[0]]);

        console.log(helper.collection);
      });

      socket.on('disconnect', function(data) {
        console.log(socket.id, 'is disconnected');
      });

      socket.on('chat', async function(req) {
        /**
         * @description response has statusCode, headers and body
         */
        let response;
        try {
          response = await request(req.url, req.options);
        } catch(e) {
          console.log('Error:', e.message);
          return;
        }
        if(response.statusCode != 200) { console.log('Error:', response.body); return; }

        /**
         * @description visit https://socket.io/docs/emit-cheatsheet/ for more details
         * This will be used for private chat
         */
        // socket.broadcast.emit('chat', { handle: req.options.data.to, message: req.options.data.text });
        io.to(helper.collection[req.options.data.to]).emit('chat', { handle: req.options.data.from, message: req.options.data.text });

        /**
         * @description visit https://socket.io/docs/rooms-and-namespaces/ for more details
         * This will be used for group chat
         */
        // io.to(helper.collection.room[room key]).emit('some event');
      });

      socket.on('started typing', function(data) {
        socket.broadcast.emit('started typing', data);
      });

      socket.on('completed typing', function(data) {
        socket.broadcast.emit('completed typing', data);
      });
    });
  }
};

module.exports = helper;