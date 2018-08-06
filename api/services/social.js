const models    = require('../models/');
const utils     = require('../utils/');
const env       = require('../../environment/');

const social = {

  /**
   * @argument :: (n: name, s: status)
   */
  setStatus: async (n, s) => {
    const cs = ['online', 'offline', 'away', 'busy'];
    if(!cs.includes(s)) {
      if(env.const.DEBUG_VERBOSITY > 1) {
        let msg = `Set status ${s} failed for user ${n}, status is invalid!`;
        console.log(`[${utils.date()}] ${msg}`);
      }
      return false;
    }
    const user = await models.user.update({ 'username': n }, { 'status': s }, {});
    if(!user) {
      if(env.const.DEBUG_VERBOSITY > 0) {
        let msg = `Set status ${s} failed for user ${n}, user not found!`;
        console.log(`[${utils.date()}] ${msg}`);
      }
      return false;
    }
    let msg = `Successfully set status ${s} for ${n}!`;
    console.log(`[${utils.date()}] ${msg}`);
    return true;
  },

  /**
   * @argument :: (n: name, f: friend's name)
   */
  addFriend: async (n, f) => {
    const user = await models.user.findOne({ 'username': n });
    const friend = await models.user.findOne({ 'username': f });
    if(!user || !friend) {
      let msg = `Add friend failed: User is ${user} & Friend is ${friend}`;
      console.log(`[${utils.date()}] ${msg}`);
      return false;
    }
    const r = await models.friend.create({ 'username': user.username, 'friendname': friend.username });
    if(!r) {
      let msg = `Failed to add ${friend.username} to ${user.usernamee}'s friends'.`;
      console.log(`[${utils.date()}] ${msg}`);
      return false;
    }
    return true;
  }
};

module.exports = social;