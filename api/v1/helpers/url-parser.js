const url = require('url');

const URL = {
  
  parse: async (param) => {
    console.log(url.parse(param));
    return true;
  }

};

module.exports = URL;