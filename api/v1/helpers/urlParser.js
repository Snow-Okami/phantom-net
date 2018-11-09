const url = require('url');
const _ = require('lodash');

const urlParser = {

  parse: async (param) => {
    const apiUrl = new URL('https://psynapsus.netlify.com/api/v1' + param);
    let query = url.parse(param).query;

    /**
     * @description No Query Param Found!
     */
    if(query === null) { return {}; }

    /**
     * @description Split Query Params Into Object.
     */
    query = query.toString().split('&');
    query = _.map(query, (item) => {
      let ob = item.split('=');
      return { [ob[0]]: ob[1] };
    });

    /**
     * @description Collect Wrapper Object
     */
    let wrapper = {};
    _.forEach(query, (item) => {
      Object.assign(wrapper, item);
    });

    return wrapper;
  }

};

module.exports = urlParser;