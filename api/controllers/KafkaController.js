const message    = require('../services/message');

const API = {
  find: async (req, res) => {
    const msg = req.params.message;
    await message.sendToKafka(msg);
    return res.send(`SENT MSG: ${msg}`);
  }
};

module.exports = API;