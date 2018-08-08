const utils   = require('../utils/');
const env     = require('../../environment/');
const models  = require('../models/');

const engine = {
  create: async (param) => {
    let at = ['bidirectional', 'private', 'open'], type = param.type, username = param.username;
    if(!at.includes(type)) {
      if(env.const.DEBUG_VERBOSITY > 0) { console.log(`[${utils.date()}] Create chat failed: Chat kind ${type} is invalid!`); }
      return false;
    }
    let user = await models.user.findOne({ 'username': username });
    if(user.error) { return false; }
    let chat = await models.chat.create(param);
    if(chat.error) { return false; }
    return true;
  }
};

module.exports = engine;