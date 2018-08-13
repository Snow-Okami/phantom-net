const utils  = require('../utils/');
const models = require('../models/');

const API = {
  find: async (req, res) => {
    return true;
  },

  create: async (req, res) => {
    let chatId;
    if(!req.body.text || !req.body.to || !req.body.type || !req.body.createdBy) { return res.status(404).send('Missing required fields!'); }
    if(req.body.type === 'group' && !req.body.chatId) { return res.status(404).send('Missing chatId for group message!'); }

    let sender = await models.user.findOne({ 'username': req.body.createdBy });
    if(sender.error) { return res.status(404).send('sender doesn\'t exists!'); }
    let recipient = await models.user.findOne({ 'username': req.body.to });
    if(recipient.error) { return res.status(404).send('recipient doesn\'t exists!'); }
    if(sender.username === recipient.username) { return res.status(404).send('recipient can\'t take your message!'); }

    let obj = { 'member': req.body.createdBy, 'type': req.body.type };
    if(req.body.chatId) { chatId = req.body.chatId; Object.assign(obj, { 'chatId': chatId }); }
    let senderlist = await models.chatList.find(obj);
    if(senderlist.error) { return res.status(404).send(senderlist); }

    obj = Object.assign(obj, { 'member': req.body.to });
    let recipientlist = await models.chatList.find(obj);
    if(recipientlist.error) { return res.status(404).send(recipientlist); }

    if((!senderlist.length || !recipientlist.length) && chatId) { return res.status(404).send('Invalid chatId detected!'); }

    if(!senderlist.length || !recipientlist.length) {
      let member = await API.addMembers(req.body);
      if(member.error) { return res.status(404).set('Content-Type', 'application/json').send(r); }
      chatId = member;
    } else if (senderlist.length && recipientlist.length && !chatId) {
      let r = _.intersectionBy(senderlist, recipientlist, 'chatId');
      if(!r.length) {
        let member = await API.addMembers(req.body);
        if(member.error) { return res.status(404).set('Content-Type', 'application/json').send(r); }
        chatId = member;
      } else {
        chatId = r[0].chatId;
      }
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

  addMembers: async (param) => {
    let chat = await models.chat.create(param);
    if(chat.error) { return chat; }
    let chatId = chat._id;
    let list = await models.chatList.addMany([
      { 'chatId': chat._id, 'type': chat.type, 'member': param.createdBy, 'agreed': true },
      { 'chatId': chat._id, 'type': chat.type, 'member': param.to, 'agreed': false },
    ]);
    if(list.error) { return list; }
    if(!list.length) { return { 'error': 'Message server error!' }; }
    return chatId;
  },

  sendMessage: async (param) => {
    let msg = models.message.create(param);
    return msg;
  }
};

module.exports = API;