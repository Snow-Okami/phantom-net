const utils  = require('../utils/');
const models = require('../models/');

const API = {
  find: async (req, res) => {
    return true;
  },

  create: async (req, res) => {
    let chat, chatId;
    if(!req.body.text || !req.body.to || !req.body.type || !req.body.createdBy) { return res.status(404).send('Missing required fields!'); }
    if(req.body.type === 'group' && !req.body.chatId) { return res.status(404).send('Missing chatId for group message!'); }

    let obj = { 'member': req.body.createdBy, 'type': req.body.type };
    if(req.body.chatId) { chatId = req.body.chatId; Object.assign(obj, { 'chatId': chatId }); }
    let list = await models.chatList.find(obj);
    if(list.error) { return res.status(404).send(list); }

    if(!list.length && chatId) { return res.status(404).send('Invalid chatId detected!'); }

    if(!list.length) {
      let user = await models.user.findOne({ 'username': req.body.to });
      if(user.error) { return res.status(404).send('recipient doesn\'t exists!'); }
      if(user.username === req.body.createdBy) { return res.status(404).send('recipient can\'t take your message!'); }

      chat = await models.chat.create(req.body);
      if(chat.error) { return res.status(404).send(chat); }
      chatId = chat._id;
      let newlist = await models.chatList.addMany([
        { 'chatId': chat._id, 'type': chat.type, 'member': req.body.createdBy, 'agreed': true },
        { 'chatId': chat._id, 'type': chat.type, 'member': req.body.to, 'agreed': false },
      ]);
      if(newlist.error) { return res.status(404).send(newlist); }
      if(!newlist.length) { return res.status(404).send('Message server error!'); }
    }

    if(list.length && !chatId) {
      obj = { 'member': req.body.to, 'type': req.body.type };
      let newlist = await models.chatList.find(obj);
      let r = _.intersectionBy(list, newlist, 'chatId');
      if(!r.length) { return res.status(404).send('Message server error!'); }
      chatId = r[0].chatId;
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