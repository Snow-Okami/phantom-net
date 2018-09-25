const models = require('../models/');

const API = {
  find: async (req, res) => {
    let skip = req.body.skip; req.body = _.omit(req.body, ['skip']);
    let user = await models.chatList.findOne(Object.assign(req.body, req.params));
    if(user.error) { return res.status(404).send(user.error); }
    if(!user.agreed) { return res.status(404)
      .send({
        type: 'error',
        text: 'Please accept the invitation to send & read messages!'
      });
    }
    let messages = await models.message.find(Object.assign(req.params, { archived: false }), skip);
    if(messages.error) { return res.status(404).send(messages); }
    return res.send({
      message: { type: 'success' },
      data: messages
    });
  },

  findOne: async (req, res) => {
    let user = await models.chatList.findOne(Object.assign(req.body, req.params));
    if(user.error) { return res.status(404).send(user); }
    if(!user.agreed) { return res.status(404).send('Please accept the invitation to send & read messages!'); }

    let messages = await models.message.findOne(Object.assign(req.params, { archived: false }));
    if(messages.error) { return res.status(404).send(messages); }
    return res.send({
      message: { type: 'success' },
      data: messages
    });
  },

  create: async (req, res) => {
    let chatId;
    if(!req.body.text || !req.body.to) { return res.status(404).send('Missing required fields!'); }
    Object.assign(req.body, { 'type': 'private' });

    let recipient = await models.user.findOne({ 'username': req.body.to });
    if(recipient.error) { return res.status(404).send('recipient doesn\'t exists!'); }
    if(req.body.createdBy === recipient.username) { return res.status(404).send('recipient can\'t take your message!'); }

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

    let msg = await API.sendMessage(Object.assign(req.body, { 'chatId': chatId, 'archived': false, 'edited': false }));
    return res.send(msg);
  },

  createToGroup: async (req, res) => {
    let chatId;
    if(!req.body.text || !req.body.chatId) { return res.status(404).send('Missing required fields!'); }
    Object.assign(req.body, { 'type': 'group', 'to': 'members' });

    chatId = req.body.chatId;
    let obj = { 'member': req.body.createdBy, 'type': req.body.type, 'chatId': chatId };
    let senderlist = await models.chatList.find(obj);
    if(senderlist.error) { return res.status(404).send(senderlist); }
    if(!senderlist.length) { return res.status(404).send('Invalid chatId detected!'); }

    if(!senderlist[0].agreed) { return res.status(404).send('Please accept the invitation to send & read messages!'); }

    let msg = await API.sendMessage(req.body);
    if(msg.error) { res.status(404).send(msg); }
    return res.status(200).send(msg);
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
      { 'chatId': chat._id, 'type': chat.type, 'member': param.to, 'agreed': true },
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