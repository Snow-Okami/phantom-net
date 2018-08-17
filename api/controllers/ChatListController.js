const models = require('../models/');

const API = {
  find: async (req, res) => {
    return true;
  },
  create: async (req, res) => {
    if(!req.body.name || !req.body.recipients) { return res.status(404).send('Missing required fields!'); }
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
    if(!req.body.recipients) { return res.status(404).send('Missing recipients field!'); }
    req.body.recipients = JSON.parse(req.body.recipients);

    let opt = Object.assign({}, { 'admin': req.body.admin, '_id': req.params.chatId });
    let chat = await models.chat.findOne(opt);
    if(chat.error) { return res.status(404).send(chat); }

    let list = await models.chatList.find(req.params);
    list = _.map(list, 'member');
    _.remove(req.body.recipients, (n) => {
      return _.includes(list, n);
    });
    if(!req.body.recipients.length) { return res.status(404).send('recipients are already present in the group!'); }
    
    let user = await models.user.find({ 'username': { $in: req.body.recipients } });
    if(user.error) { return res.status(404).send(error); }
    if(!user.length) { return res.status(404).send('minimum 1 valid user is required to add in the group!'); }

    req.body.recipients = _.map(user, (item) => {
      return { 'chatId': chat._id, 'type': chat.type, 'member': item.username, 'agreed': false }
    });

    let r = await API.addMember(req.body.recipients);
    if(r.error) { return res.status(404).send(r); }
    return res.send(r);
    // return res.send('Okay!');
  },
  delete: async (req, res) => {
    return res.send('Okay!');
  },

  addMember: async (param) => {
    return await models.chatList.addMany(param);
  },
};

module.exports = API;