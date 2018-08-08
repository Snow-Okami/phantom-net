const services    = require('../services/');

const API = {
  find: async (req, res) => {
    const msg = req.params.message;
    await services.message.sendToKafka(msg);
    return res.send(`SENT MSG: ${msg}`);
  }
};

module.exports = API;