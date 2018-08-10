const utils  = require('../utils/');
const models = require('../models/');

const API = {
  find: async (req, res) => {
    return true;
  },

  create: async (req, res) => {
    let chat, chatId;
    if(!req.body.text || !req.body.to || !req.body.type || !req.body.createdBy) { return res.status(404).send('Missing required fields!'); }
    let list = await models.chatList.find({ 'member': req.body.createdBy, 'type': req.body.type });
    if(list.error) { return res.status(404).send(list); }
    if(!list.length) {
      chat = await models.chat.create(req.body);
      if(chat.error) { return res.status(404).send(chat); }
      chatId = chat._id;
      list = await models.chatList.addMany([
        { 'chatId': chat._id, 'type': chat.type, 'member': req.body.createdBy, 'agreed': true },
        { 'chatId': chat._id, 'type': chat.type, 'member': req.body.to, 'agreed': false },
      ]);
      if(list.error) { return res.status(404).send(list); }
      if(!list.length) { return res.status(404).send('Message server error!'); }
    }
    let msg = await API.sendMessage(Object.assign(req.body, { 'chatId': chatId }));
    return res.send(msg);
  },

  update: async (req, res) => {
    return true;
  },

  delete: async (req, res) => {
    return true;
  },

  sendMessage: async (param) => {
    let msg = models.message.create(param);
    return msg;
  }
};

module.exports = API;