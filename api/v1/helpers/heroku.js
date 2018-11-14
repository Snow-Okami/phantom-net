const request = require('async-request');

const heroku = {

  setActive: async () => {
    let apiURL = process.env.DEVELOPMENT ? `http://localhost:${process.env.PORT}/api/v1/test` : 'https://psynapsus.herokuapp.com/api/v1/test';
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

    console.log(response.headers.date, apiURL);

    return true;
  }

};

module.exports = heroku;