const utils   = require('../utils/');
const env     = require('../../environment/');
const models  = require('../models/');

const engine = {
  create: async (param) => {
    let at = ['private', 'group', 'open'], type = param.type, username = param.username;
    if(!at.includes(type)) { type = param.type = 'private'; }
    let user = await models.user.findOne({ 'username': username });
    if(user.error) { return user; }
    let chat = await models.chat.create(param);
    if(chat.error) { return chat; }
    let list = await models.chatList.add(Object.assign(param, { 'chatId': chat._id }));
    if(list.error) { return list; }
    let r = await models.user.update({ 'username': username }, { 'chatId': chat._id, 'partChatId': chat._id }, {});
    if(r.error) { return r; }
    return { 'chatId': chat._id, };
  },

  addUser: async (param) => {
    let next = await models.user.findOne({ 'username': param.username });
    if(next.error) { return next; }
    let chat = await models.chat.findOne({ '_id': param.chatId });
    if(chat.error) { return chat; }
    let list = await models.chatList.find({ 'chatId': param.chatId });
    if(list.error) { return list; }
    if(chat.type === 'private' && list.length > 1) { return { 'error': 'Can\'t add anymore user to this chat.' }; }
    let user = list.find((item) => { return item.username === param.username; });
    if(user) { return { 'error': 'User is already present in this chat.' }; }
    let r = await models.chatList.add(Object.assign(param, { 'type': chat.type }));
    return r;
  },

  deleteUser: async (param) => {
    let item = await models.chatList.deleteOne({ 'chatId': param.chatId, 'username': param.username });
    if(item.error) { return item; }
    if(!item.n) { return { 'error': 'Data didn\'t match properly!' }; }
    return { 'message': `REMOVED ${param.username} FROM CHAT: ${param.chatId}` };

  }
};

module.exports = engine;