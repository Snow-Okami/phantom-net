const bcrypt = require('bcryptjs');

const password = {
  hash: async (str) => {
    return await bcrypt.hash(str, 13);
  },

  compare: async (raw, hash) => {
    return await bcrypt.compare(raw, hash);
  }
};

module.exports = password;