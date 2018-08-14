const models = require('../models/');

const API = {
  find: async (req, res) => {
    return true;
  },
  create: async (req, res) => {
    if(!req.body.name || !req.body.recipients || !req.body.createdBy) { return res.status(404).send('Missing required fields!'); }
    Object.assign(req.body, { 'type': 'group' });

    req.body.recipients.push(req.body.createdBy);
    let t = req.body.recipients;
    req.body.recipients = _.uniq(t);

    let list = await models.user.find({ 'username': { $in: req.body.recipients } });
    if(list.error) { return res.status(404).send(error); }
    if(list.length < 2) { return res.status(404).send('minimum 2 valid users required to create a group!'); }

    t = _.find(list, { 'username': req.body.createdBy });
    if(!t) { return res.status(404).send('sender doesn\'t exists!'); }

    let chat = await models.chat.create(Object.assign(req.body, { 'admin': req.body.createdBy }));
    if(chat.error) { return res.status(404).send(chat); }

    req.body.recipients = _.map(list, (item) => {
      return { 'chatId': chat._id, 'type': chat.type, 'member': item.username, 'agreed': item.username === req.body.createdBy }
    });
    let r = await API.addMember(req.body.recipients);
    if(r.error) { return res.status(404).send(r); }
    return res.send(r);
  },
  update: async (req, res) => {
    return true;
  },
  delete: async (req, res) => {
    return true;
  },

  addMember: async (param) => {
    return await models.chatList.addMany(param);
  },
};

module.exports = API;