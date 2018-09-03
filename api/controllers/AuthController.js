const models    = require('../models/');
const helpers   = require('../helpers/');

const API = {
  resendValidationMail: async (req, res) => {
    const user = await models.user.findOne(req.body);
    if(!user) {
      return res.status(404).set('Content-Type', 'text/plain')
      .send('Email doesn\'t exists in the database!');
    }
    const auth = await models.authUser.create(user);
    let r = await helpers.mailer.sendValidationMail(auth);
    let status = 200;
    if(r.error) { status = 404; }
    return res.status(status).set('Content-Type', 'application/json')
    .send(r);
  },

  /*
  * 
  */
  validateEmail: async (req, res) => {
    const user = await models.user.findOne(req.body);
  },

  login: async (req, res) => {
    let password = req.body.password;
    if(req.body.emaillogin) { req.body = { 'email': req.body.user }; }
    else { req.body = { 'username': req.body.user }; }

    const user = await models.user.findOne(req.body);
    if(user.error) {
      return res.status(404).send(user.error);
    }
    if(!user.emailValidated) {
      // return res.status(404).send('Please validate your email!');
    }

    const valid = await models.authUser.comparePassword(password, user.password);
    if(valid.error) {
      return res.status(404).send(valid.error);
    }
    if(!valid) {
      return res.status(404).send({ type: 'error', text: 'invalid password!' });
    }

    let time = new Date().getTime(), ext = { jwtValidatedAt: time },
    s = 200, m = 'Loggedin successfully!', token,
    update = await models.user.update(req.body, ext, {});
    if(update.error) { s = 404, m = update.error; }
    else {
      let u = await models.user.findOne(req.body);
      if(u.error) { return res.status(400).send('Internal server error! Please contact the developers.'); }
      Object.assign(u, { 'password': '' });
      token = await helpers.jwt.sign(u);
      res.header('Authorization', 'Bearer ' + token);
    }
    return res.status(s).set('Content-Type', 'application/json').send({ 'message': m, 'token': 'Bearer ' + token });
  }
};

module.exports = API;