const models    = require('../models/');
const helpers   = require('../helpers/');
const jwt       = require('jsonwebtoken');

const API = {
  findExists: async (req, res) => {
    let r = await models.user.findOne(req.body), type = 'text/plain';
    if(!r) { return res.status(200).set('Content-Type', type).send('Okay!'); }
    if(r.error) { type = 'application/json'; }
    else if(req.body.email) { r = 'Email already exists!' }
    else if(req.body.username) { r = 'Username already exists!' }
    else { r = 'Parameter already exists!' }
    return res.status(404).set('Content-Type', type).send(r);
  },

  create: async (req, res) => {
    const user = await models.user.create(req.body);
    if(user.error) {
      return res.status(404).set('Content-Type', 'application/json')
      .send(user);
    }
    const auth = await models.authUser.create(user);
    helpers.mailer.sendValidationMail(auth);
    return res.status(200).set('Content-Type', 'application/json')
    .send(user);
  },

  delete: async (req, res) => {
    const user = await models.user.delete(req.params);

    return res.status(200).set('Content-Type', 'application/json')
    .send(user);
  },

  update: async (req, res) => {
    if(req.file) { Object.assign(req.body, { 'filename': req.file.filename }); }
    const user = await models.user.update(req.params, req.body, {});
    let s = 200, m = 'User is updated successfully!';
    if(user.error) { s = 404, m = user.error; }
    return res.status(s).set('Content-Type', 'text/plain').send(m);
  },
};

module.exports = API;