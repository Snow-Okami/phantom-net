const chat  = require('../services/chat');

const API = {
  create: async (req, res) => {
    let r = await chat.create(req.body), username = req.body.username;
    if(r.error) { return res.status(404).send(`FAILED TO CREATE CHAT FOR ${username}`); }
    return res.send(`CREATED NEW CHAT ${r.chatId} - OWNER: ${username}`);
  }
};

module.exports = API;