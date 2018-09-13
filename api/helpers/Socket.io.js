const request = require('async-request');

const helper = {
  rooms: {},
  socket: {},
  url: 'http://' + process.env.serverhostname + ':' + process.env.serverport + '/api',

  init: async () => {
    io.on('connection', async (socket) => {

      socket.on('login', async (data) => {
        let apiurl = helper.url + '/user/' + data.username + '/chats', response;
        let options = {
          method: 'GET',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': data.token
          }
        };

        /**
         * @description response has statusCode, headers and body
         */
        try {
          response = await request(apiurl, options);
        } catch(e) {
          console.log('Error:', e.message);
          return;
        }
        if(response.statusCode != 200) { console.log('Error:', response.body); return; }

        if(!helper.rooms[data.username]) {
          helper.rooms[data.username] = {
            sid: [socket.id],
            clist: JSON.parse(response.body).data.modifiedList
          };
        } else {
          helper.rooms[data.username].sid.push(socket.id);
          helper.rooms[data.username].clist = JSON.parse(response.body).data.modifiedList;
        }
        socket.join(helper.rooms[data.username].clist);
        _.forEach(helper.rooms[data.username].sid, (id) => {
          io.to(id).emit('logged in');
        });
      });

      socket.on('disconnect', async (data) => {
        let user = _.findKey(helper.rooms, (o) => {
          return _.includes(o.sid, socket.id); 
        });
        try {
          _.forEach(helper.rooms[user].sid, (id) => {
            io.to(id).emit('logged out');
          });
          _.pull(helper.rooms[user].sid, socket.id);
          if(!helper.rooms[user].sid.length) { delete helper.rooms[user]; }
        } catch(e) {
          console.log('Error:', e.message);
        }
        console.log(user, 'is disconnected!');
      });

      socket.on('typing', async (data) => {
        if(data.type === 'private' && helper.rooms[data.username]) {
          _.forEach(helper.rooms[data.username].sid, (id) => {
            io.to(id).emit('typing', data.typingText);
          });
        }
      });

      socket.on('stopped typing', async (data) => {
        if(data.type === 'private' && helper.rooms[data.username]) {
          _.forEach(helper.rooms[data.username].sid, (id) => {
            io.to(id).emit('stopped typing', data.typingText);
          });
        }
      });

      socket.on('private message', async (data) => {
        if(data.type === 'private') {
          let apiurl = helper.url + '/message', response;
          let options = {
            method: 'POST',
            headers: {
              'Content-Type':  'application/json',
              'Authorization': data.token
            },
            data: {
              'text': data.text,
              'to': data.username
            }
          };

          /**
           * @description response has statusCode, headers and body
           */
          try {
            response = await request(apiurl, options);
          } catch(e) {
            console.log('Error:', e.message);
            return;
          }
          if(response.statusCode != 200) { console.log('Error:', response.body); return; }
          if(helper.rooms[data.createdBy]) {
            let obj = Object.assign({}, JSON.parse(response.body), {touser: _.pick(data, ['fname', 'lname'])});
            _.forEach(helper.rooms[data.createdBy].sid, (id) => {
              io.to(id).emit('message sent', obj);
            });
          }
          if(helper.rooms[data.username]) {
            _.forEach(helper.rooms[data.username].sid, (id) => {
              io.to(id).emit('private message', JSON.parse(response.body));
            });
          }
        }
      });

      socket.on('get available users', async (data) => {
        let apiurl = helper.url + '/user/' + data.username + '/available';
        let options = {
          method: 'GET',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': data.token
          }
        };

        /**
         * @description response has statusCode, headers and body
         */
        try {
          response = await request(apiurl, options);
        } catch(e) {
          console.log('Error:', e.message);
          return;
        }
        if(response.statusCode != 200) { console.log('Error:', response.body); return; }
        let r = JSON.parse(response.body), allonline = _.keys(helper.rooms);
        let online = _.pull(allonline, data.username);
        Object.assign(r.data, { online: online });
        _.forEach(helper.rooms[data.username].sid, (id) => {
          io.to(id).emit('available users', r);
        });
      });

    });
  },

};

module.exports = helper;