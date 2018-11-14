const HEROKU = require('../helpers/heroku');

let interval;

const TestController = {
  findAll: async (req, res) => {

    /**
     * @description CALLS The setActive API After Every 20 Mins or 1200000 Milliseconds.
     */
    if(!interval) {
      interval = setInterval(_ => {
        HEROKU.setActive();
      }, 4000);
    }

    return res.status(200).send({
      message: { type: 'success' },
      data: 'You are connected to Psynapsus Node.js server.'
    });
  }

};

module.exports = TestController;