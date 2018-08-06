const WebSocket = require('ws');
const social = require('./social');
const env = require('../../environment/');
const utils = require('../utils/');

var clients = [];
var clients_num = 0;
var messages = 0;

module.exports = {

  openWs: async (ws, username) => {
    clients.push({ 'ws': ws, 'username': username });
    clients_num++;
    await social.setStatus(username, 'online');
  },

  closeWs: async (ws) => {
    let pos = clients.map((ob) => { return ob.ws; }).indexOf(ws);
    if (pos > -1) {
      let ob = clients.splice(pos, 1)[0];
      clients_num--;
      await social.setStatus(ob.username, 'online');
    }
  },

  onAddFriendRequest: async (user) => {
    const username = user.username;
    const friend = user.args.friend;
    const type = 'frienduser';
    let msg;
    const r = await social.addFriend(username, friend);
    if(r) { msg = `SUCCESSFULLY ADDED ${friend} TO ${username}'s FRIENDS LIST`; }
    else { msg = `FAILED TO ADD ${friend} TO ${username}'s TO FRIENDS LIST`; }
    console.log(msg);
    return module.exports.createResponse(type, user.client, { 'success': r, 'msg': msg });
  },

  createResponse: (type, client, res) => {
    if(client.ws) {
      var cmd = utils.createDelimitedString(res, env.const.ARGUMENT_SEPARATOR, env.const.ARGUMENT_VALUE_SEPARATOR);
      var final = `${type}${env.const.COMMAND_SEPARATOR}${cmd}`;
      client.ws.send(final);
      messages++;
    }
  },

};