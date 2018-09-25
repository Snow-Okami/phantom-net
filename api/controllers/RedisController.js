const message    = require('../services/message');

const API = {
  setKeyValue: async (req, res) => {
    let key, value;
    try {
      key = req.body.key;
      value = req.body.value;
      await message.setRedis(key, value);
    } catch(e) {
      return res.status(404).set('Content-Type', 'application/json')
      .send({ 'error': e.message });
    }
    return res.send(`SET REDIS - KEY: ${key} | VALUE: ${value}`);
  },

  getKey: async (req, res) => {
    const key = req.params.key;
    let r = await message.getRedis(key);
    return res.send(`GET REDIS - KEY: ${key} | VALUE: ${r}`);
  },

  sendData: async (req, res) => {
    const channel = req.body.channel;
    const data = req.body.data;
    await message.sendToRedis(channel, data);
    return res.send(`SENT - CHANNEL: ${channel} | DATA: ${data}`);
  }
};

module.exports = API;