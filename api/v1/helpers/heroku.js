const request = require('async-request');

const heroku = {

  setActive: async () => {
    console.log('Production: ', process.env.DEVELOPMENT);

    let apiURL = 'https://psynapsus.herokuapp.com/api/v1/test';
    let option = {
      method: 'GET',
      headers: {
        'Content-Type':  'application/json'
      }
    };
    let response;

    /**
     * @description response has statusCode, headers and body OBJECTS.
     */
    try { response = await request(apiURL, option); } catch(e) { return false; }
    if(response.statusCode != 200) { return false; }

    return true;
  }

};

module.exports = heroku;