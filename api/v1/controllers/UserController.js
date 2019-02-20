const Models = require('../models').objects;
const bycript = require('../models').bycript;
const _ = require('../models')._;
const jwt = require('../helpers/jwt');

const UserController = {
  findOne: async (req, res) => {
    const a = await Models.user.findOne(req.params);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
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
     * @description Users are allowed to register with role 0 & 1.
     */
    req.body.capability = isNaN(req.body.capability) ? 0 : parseInt(req.body.capability);
    if(req.body.capability > 1) { return res.status(404).send({ type: 'error', text: 'please include capability in body eg. 0 & 1' }); }

    /**
     * @description removes emailValidated, allowedToAccess properties from update object.
     */
    req.body = _.omit(req.body, ['emailValidated', 'allowedToAccess']);

    const id = await Models.id.findOne({});
    if(id.error) { return res.status(404).set('Content-Type', 'application/json').send(id.error); }

    /**
     * @description Increment id field with 1.
     */
    await Models.id.updateOne({'user': id.data.user}, {'user': Number(id.data.user) + 1}, {});

    /**
     * @description SET id property for User.
     */
    req.body.id = id.data.user;
    const a = await Models.user.create(req.body);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }

    return res.status(200).send(a);
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
      _.pick(a.data, ['email', 'jwtValidatedAt', 'capability'])
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
      _.pick(token, ['email', 'jwtValidatedAt', 'capability']), { jwtValidatedAt: time }, {}
    );
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }

    /**
     * @description Return Logged Out Successful Response.
     */
    return res.status(200).set('Content-Type', 'application/json').send(a);
  }
};

module.exports = UserController;