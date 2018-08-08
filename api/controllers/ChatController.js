const chat  = require('../services/chat');

const API = {
  create: async (req, res) => {
    let r = await chat.create(req.body);
    if(!r) { return res.send(`FAILED TO CREATE CHAT FOR ${username}`); }
    return res.send(`CREATED NEW CHAT ${r.uuid} - OWNER: ${username}`);
  }
};

module.exports = API;