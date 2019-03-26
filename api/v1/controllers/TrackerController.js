const Models = require('../models').objects;
const bycript = require('../models').bycript;
const _ = require('../models')._;
const jwt = require('../helpers/jwt');

const TrackerController = {
  updatePermission: async (req, res) => {
    /**
     * @description removes email, password and role properties from update object.
     */
    req.body = _.pick(req.body, ['capability', 'emailValidated', 'allowedToAccess']);

    const a = await Models.user.updateOne(req.params, req.body, {});
    if(a.error) { return res.status(404).set('Content-Type', 'application/json').send(a.error); }
    return res.status(200).send(a);
  }
};

module.exports = TrackerController;