const password = require('bcryptjs');

const bcrypt = {
  hash: async (str) => {
    return await password.hash(str, 13);
  },

  compare: async (raw, hash) => {
    return await password.compare(raw, hash);
  }
};

module.exports = bcrypt;