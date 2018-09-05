const models    = require('../models/');
const helpers   = require('../helpers/');

const API = {
  findExists: async (req, res) => {
    let opt = {};
    if(req.body.email) {Object.assign(opt, { 'email': req.body.email })};
    if(req.body.username) {Object.assign(opt, { 'username': req.body.username })};
    let r = await models.user.findOne(opt), type = 'text/plain';
    if(!r) { return res.status(200).set('Content-Type', type).send('Okay!'); }
    if(r.error) { type = 'application/json'; }
    else if(req.body.email && req.body.username) { r = 'Username and email both are taken!' }
    else if(req.body.email) { r = 'Email already exists!' }
    else if(req.body.username) { r = 'Username already exists!' }
    else { r = 'Parameter already exists!' }
    return res.status(404).set('Content-Type', type).send(r);
  },

  findOne: async (req, res) => {
    const user = await models.user.findOne(req.params);
    if(user.error) {
      return res.status(404).set('Content-Type', 'application/json')
      .send({ type: 'error', text: user });
    }
    let d = _.pick(user, ['fname', 'lname', 'username', 'filename', 'email', 'status']);
    return res.status(200).send({
      message: { type: 'success' },
      data: d
    });
  },

  create: async (req, res) => {
    const user = await models.user.create(req.body);
    if(user.error) {
      return res.status(404).set('Content-Type', 'application/json')
      .send(user);
    }
    const auth = await models.authUser.create(user);
    helpers.mailer.sendValidationMail(auth);
    let token = await helpers.jwt.sign(user);
    return res.status(200).header('Authorization', 'Bearer ' + token).send('Okay!');
  },

  delete: async (req, res) => {
    const user = await models.user.delete(req.params);

    return res.status(200).set('Content-Type', 'application/json')
    .send(user);
  },

  update: async (req, res) => {
    let s = 200, m = 'User is updated successfully!', token;
    if(req.file) { Object.assign(req.body, { 'filename': req.file.filename }); }
    const user = await models.user.update(req.params, req.body, {});
    if(user.error) { s = 404, m = user.error; }
    else {
      let u = await models.user.findOne(req.params);
      if(u.error) { return res.status(400).send('Internal server error! Please contact the developers.'); }
      Object.assign(u, { 'password': '' });
      token = await helpers.jwt.sign(u);
      res.header('Authorization', 'Bearer ' + token);
    }
    return res.status(s).set('Content-Type', 'text/plain').send(m);
  },

  getChats: async (req, res) => {
    let m = await models.chatList.find({'member': req.params.username});
    let r = _.map(m, 'chatId'), modified = _.map(r, (o) => { return 'r_v_' + o; });
    let cl = await models.chatList.find({ 'chatId': { $in: r } });
    let au = _.filter(cl, (o) => { return o.member != req.params.username; });
    let ul = _.map(au, 'member');
    let ud = await models.user.find({ 'username': { $in: ul } });
    let chatList = _.map(au, (o) => {
      let tu = _.find(ud, function(u) { return u.username === o.member; });
      return { chatId: o.chatId, roomId: 'r_v_' + o.chatId, member: o.member, type: o.type, fname: tu.fname, lname: tu.lname };
    });
    return res.status(200).send({
      message: { type: 'success' }, data: {
        list: r, modifiedList: modified, chatList: chatList
      }
    });
  }
};

module.exports = API;