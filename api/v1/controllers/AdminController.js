const Models = require('../models/').objects;
const bycript = require('../models/').bycript;
const _ = require('../models/')._;
const jwt = require('../helpers/jwt');

const AdminController = {
  findOne: async (req, res) => {
    const a = await Models.admin.findOne(req.params);
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
    const a = await Models.admin.findAll({});
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  create: async (req, res) => {
    const a = await Models.admin.create(req.body);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  updateOne: async (req, res) => {
    const a = await Models.admin.updateOne(req.params, req.body, {});
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  deleteOne: async (req, res) => {
    const a = await Models.admin.deleteOne(req.params);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  },

  login: async (req, res) => {
    /**
     * @description Request Body must contain Email & Password.
     */
    if(!req.body.password || !req.body.email) {
      return res.status(404).set('Content-Type', 'application/json').send({ type: 'error', text: 'Please include email & password filed.' });
    }

    /**
     * @description Find Admin using Email id.
     */
    let password = req.body.password;
    delete req.body.password;
    const a = await Models.admin.findOne(req.body);
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }

    /**
     * @description Compare password provided by Admin.
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
      _.pick(a.data, ['email', 'isMale', 'createdAt', 'jwtValidatedAt'])
    );

    /**
     * @description Return Email and Token as LoggedIn response.
     */
    return res.status(200).set('Content-Type', 'application/json').send({
      message: { type: 'success' },
      data: { token: 'Bearer ' + token }
    });
  }
};

module.exports = AdminController;