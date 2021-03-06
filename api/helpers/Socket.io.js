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
        _.forEach(helper.rooms[data.username].clist, (rid) => {
          socket.join(rid);
        });
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

      /**
       * @description return recommended and available users for instant chat.
       */
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

      /**
       * @description create group event is fired when user creates a group.
       */
      socket.on('create group', async (data) => {
        let apiurl = helper.url + '/group';
        let options = {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': data.token
          },
          data: {
            'name': data.name,
            'recipients': data.recipients
          }
        };
        let response;

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
        /**
         * @description gr : group chat response
         */
        let gr = JSON.parse(response.body), chatId = gr[0].chatId;

        apiurl = helper.url + '/groupmessage';
        options = {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': data.token
          },
          data: {
            'text': data.text,
            'chatId': chatId
          }
        };
        try {
          response = await request(apiurl, options);
        } catch(e) {
          console.log('Error:', e.message);
          return;
        }
        if(response.statusCode != 200) { console.log('Error:', response.body); return; }
        /**
         * @description cr : created chat response
         */
        let cr = JSON.parse(response.body);

        let members = _.pull(_.map(gr, 'member'), cr.createdBy);
        let roomId = 'r_v_' + cr.chatId;
        socket.join(roomId);
        helper.rooms[cr.createdBy].clist.push(roomId);
        let message = {
          admin: cr.createdBy,
          chatId: cr.chatId,
          lastText: cr.text,
          messages: [],
          name: cr.name,
          roomId: roomId,
          mcache: true,
          selected: false,
          name: data.name,
          type: cr.type
        };
        io.to(helper.rooms[cr.createdBy].sid).emit('group message', message);
        _.forEach(members, (id) => {
          if(helper.rooms[id] !== undefined) {
            _.forEach(helper.rooms[id].sid, (sid) => {
              io.to(sid).emit('group message', message);
            });
          }
        });
      });

    });
  },

};

module.exports = helper;