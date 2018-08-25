const db = require('./MongoDB');
const request = require('async-request');

const helper = {
  collection: {},
  init: async () => {
    db.connect();
    helper.collection = {};

    io.on('connection', function(socket){

      socket.on('new connection', function(data) {
        helper.collection[data] = socket.id;
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
         */
        // socket.broadcast.emit('chat', { handle: req.options.data.to, message: req.options.data.text });
        io.to(helper.collection[req.options.data.to]).emit('chat', { handle: req.options.data.to, message: req.options.data.text });
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