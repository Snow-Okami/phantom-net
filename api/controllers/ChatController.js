const chat  = require('../services/chat');

const API = {
  create: async (req, res) => {
    const r = await chat.create(req.body), username = req.body.username;
    if(r.error) { return res.status(404).send(r); }
    return res.send(`CREATED NEW CHAT ${r.chatId} - OWNER: ${username}`);
  },

  addUser: async (req, res) => {
    const r = await chat.addUser(req.body);
    if(r.error) { return res.status(404).send(r); }
    return res.send(`Successfully added ${req.body.username} to chat ${req.body.chatId}!`);
  },

  deleteUser: async (req, res) => {
    const r = await chat.deleteUser(req.body);
    if(r.error) { return res.status(404).send(r); }
    return res.send(r);
  },
};

module.exports = API;