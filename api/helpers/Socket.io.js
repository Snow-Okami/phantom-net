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
            clist: JSON.parse(response.body).modifiedList
          };
        } else {
          helper.rooms[data.username].sid.push(socket.id);
          helper.rooms[data.username].clist = JSON.parse(response.body).modifiedList;
        }
        socket.join(helper.rooms[data.username].clist);
        console.log(data.username, 'is connected');
      });

      socket.on('disconnect', async (data) => {
        let user = _.findKey(helper.rooms, (o) => {
          return _.includes(o.sid, socket.id); 
        });
        _.pull(helper.rooms[user].sid, socket.id);
        if(!helper.rooms[user].sid.length) { delete helper.rooms[user]; }
        console.log(helper.rooms, 'is disconnected');
      });

    });
  },

};

module.exports = helper;