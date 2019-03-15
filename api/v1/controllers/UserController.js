const Models = require('../models').objects;
const bycript = require('../models').bycript;
const _ = require('../models')._;
const jwt = require('../helpers/jwt');

const UserController = {
  findOne: async (req, res) => {
    const a = await Models.user.findOne(req.params);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    a.data = _.pick(a.data, ['allowedToAccess', 'avatar', 'capability', 'createdAt', 'email', 'emailValidated', 'firstName', 'lastName', 'id', 'isMale', 'fullName', 'username', 'updatedAt', 'jwtValidatedAt', 'online', '_id']);
    return res.status(200).send(a);
  },

  /**
   * @description Need to complete this API.
   */
  findLimited: async (req, res) => {
    return res.status(200).send({
      message: { type: 'success' },
      data: 'API is under construction. Please try after some time.'
    });
  },

  findAll: async (req, res) => {
    const a = await Models.user.findAll({});
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  create: async (req, res) => {
    /**
     * @description Users are allowed to register with role 0, 1 & 2.
     */
    req.body.capability = isNaN(req.body.capability) ? 0 : parseInt(req.body.capability);
    if(req.body.capability > 2 || req.body.capability < 0) { return res.status(404).send({ type: 'error', text: 'please include capability in body eg. 0, 1 & 2' }); }

    let tu = await Models.user.findOne({ 'username': req.body.username });
    if(!tu.error) { return res.status(404).send({ type: 'error', text: 'username already exists!' }); };

    /**
     * @description removes emailValidated, allowedToAccess properties from update object.
     */
    // req.body = _.omit(req.body, ['emailValidated']);
    Object.assign(req.body, { emailValidated: false, allowedToAccess: req.body.capability != 2 });

    const id = await Models.id.findOne({});
    if(id.error) { return res.status(404).set('Content-Type', 'application/json').send(id.error); }

    /**
     * @description Increment id field with 1.
     */
    // remove comment
    // await Models.id.updateOne({'user': id.data.user}, {'user': Number(id.data.user) + 1}, {});

    /**
     * @description SET id property for User.
     */
    req.body.id = id.data.user;
    // remove comment
    // const a = await Models.user.create(req.body);
    // if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }

    // const c = await Models.vcode.create({ user: a.data._id });
    // if(c.error) { return res.status(404).set('Content-Type', 'application/json').send(c.error); }

    // const m = await Models.gmail.send({ user: a.data.email, token: c.data._id });
    const m = await Models.gmail.send({ user: req.body.email, token: '1234567890' });
    if(m.error) { return res.status(404).set('Content-Type', 'application/json').send(m.error); }
    
    // remove comment
    // a.data = _.pick(a.data, ['allowedToAccess', 'avatar', 'capability', 'createdAt', 'email', 'emailValidated', 'firstName', 'lastName', 'id', 'isMale', 'fullName', 'username', 'updatedAt', 'jwtValidatedAt', 'online', '_id']);
    return res.status(200).send(m);
  },

  updateOne: async (req, res) => {
    /**
     * @description removes email, password and role properties from update object.
     */
    req.body = _.omit(req.body, ['email', 'capability', 'emailValidated', 'allowedToAccess']);

    if(req.file) { req.body.avatar = req.file.filename; }
    const a = await Models.user.updateOne(req.params, req.body, {});
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  deleteOne: async (req, res) => {
    const a = await Models.user.deleteOne(req.params);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  login: async (req, res) => {
    /**
     * @description Request Body must contain Email & Password.
     */
    if(!req.body.password || !req.body.email) {
      return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'please include email & password filed.' });
    }

    /**
     * @description Find User using Email id.
     */
    let password = req.body.password;
    delete req.body.password;
    const a = await Models.user.findOne(req.body);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    if(!a.data.emailValidated) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'please validate the email!' }); }
    if(!a.data.allowedToAccess) { return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'user is not allowed to access!' }); }

    /**
     * @description Compare password provided by User.
     */
    const vp = await bycript.compare(password, a.data.password);
    if(vp.error) {
      return res.status(404).set('Content-Type', 'application/json').send(vp.error);
    }
    if(!vp) {
      return res.status(404).send({ type: 'error', text: 'invalid password!' });
    }

    /**
     * @description Generate JWT token.
     */
    const token = await jwt.sign(
      _.pick(a.data, ['email', 'allowedToAccess', 'jwtValidatedAt', 'capability'])
    );

    /**
     * @description Return Email and Token as LoggedIn response.
     */
    return res.status(200).set('Content-Type', 'application/json').send({
      message: { type: 'success' },
      data: { token: 'Bearer ' + token }
    });
  },

  logout: async (req, res) => {
    /**
     * @description Request Body must contain Email & Password.
     */
    if(!req.body.token) {
      return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'Please include token filed.' });
    }

    /**
     * @description Decode and Authenticate JWT token.
     */
    const token = await jwt.decode(req.body.token);
    if(token.error) {
      return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: token.error });    
    }

    let time = new Date().getTime();
    const a = await Models.user.updateOne(
      _.pick(token, ['email', 'allowedToAccess', 'jwtValidatedAt', 'capability']), { jwtValidatedAt: time }, {}
    );
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }

    /**
     * @description Return Logged Out Successful Response.
     */
    return res.status(200).set('Content-Type', 'application/json').send(a);
  },

  findName: async (req, res) => {
    const a = await Models.user.findOne(req.params);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    a.data = _.pick(a.data, ['username', 'email', 'isMale']);
    return res.status(200).send(a);
  },

  hasUser: async (req, res) => {
    const a = await Models.user.findOne(req.params);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    a.data = _.pick(a.data, ['username', 'email', 'isMale']);
    return res.status(200).send(a);
  },

  verify: async (req, res) => {
    let c = await Models.vcode.findOne(req.params);
    if(c.error) { return res.status(404).set('Content-Type', 'application/json').send(c.error); }

    const u = await Models.user.updateOne({ email: c.data.user.email }, { emailValidated: true }, {});
    if(u.error) { return res.status(404).set('Content-Type', 'application/json').send(u.error); }

    c = await Models.vcode.deleteMany({ user: c.data.user._id });
    if(c.error) { return res.status(404).set('Content-Type', 'application/json').send(c.error); }

    return res.status(200).set('Content-Type', 'application/json').send(u);
  }
};

module.exports = UserController;