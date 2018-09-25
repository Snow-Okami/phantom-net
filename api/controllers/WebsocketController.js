const socket    = require('../services/socket');

const API = {
  sendMsg: async (req, res) => {
    const username = req.body.username;
    const msg = req.body.message;

    let sent = await socket.sendToUser(username, msg);
    if(!sent) { return res.send(`FAILED TO SEND TO: ${username} - MSG: ${msg}`); }
    return res.send(`SENT TO CLIENT: ${username} - MSG: ${msg}`);
  },

  sendAll: async (req, res) => {
    const msg = req.body.message;
  
    await socket.sendAllClients(msg);
    return res.send(`SENT ALL CLIENTS - MSG: ${msg}`);
  }
};
module.exports = API;