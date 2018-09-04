const request = require('async-request');

const helper = {
  collection: {},
  url: 'http://localhost:3333/api',

  init: async () => {
    io.on('connection', async (socket) => {

      socket.on('login', async (data) => {
        let apiurl = helper.url + '/user/' + data.username + '/chats';
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
        let response;
        try {
          response = await request(apiurl, options);
        } catch(e) {
          console.log('Error:', e.message);
          return;
        }
        if(response.statusCode != 200) { console.log('Error:', response.body); return; }

        console.log(response);
      });
    });
  }
};

module.exports = helper;