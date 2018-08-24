const helper = {
  init: async () => {
    db.connect();

    io.on('connection', function(socket){
      console.log(socket.id, 'is connected');
    
      socket.on('disconnect', function(data) {
        console.log(socket.id, 'is disconnected');
      });

      /**
       * @description will be used for 3rd way 
       */
      // socket.on('chat', async function(data) {
        /**
         * @description sending response to all available sockets
         */
        // io.sockets.emit('chat', data);

        /**
         * @description sending response to all sockets except me
         */
      // socket.broadcast.emit('chat', data);
      // });

      /**
       * @description will be used for 2nd way
       */
      /* socket.on('chat', async function(data) {
        await db.models.chat.create(data);
        socket.broadcast.emit('chat', data);
      }); */

      /**
       * @description will be used for 1st way
       */
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

        socket.broadcast.emit('chat', { handle: req.options.to, message: req.options.text });
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