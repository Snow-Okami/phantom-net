const utils   = require('../utils/');
const env     = require('../../environment/');
const models  = require('../models/');

const engine = {
  create: async (param) => {
    let at = ['bidirectional', 'private', 'open'], type = param.type, username = param.username;
    if(!at.includes(type)) { return { 'error': 'Invalid chat type detected!' }; }
    let user = await models.user.findOne({ 'username': username });
    if(user.error) { return user; }
    let chat = await models.chat.create(param);
    if(chat.error) { return chat; }
    let r = await models.user.update({ 'username': username }, { 'chatId': chat._id, 'partChatId': chat._id }, {});
    if(r.error) { return r; }
    return { 'chatId': chat._id, };
  }
};

module.exports = engine;