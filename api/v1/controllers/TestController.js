const HEROKU = require('../helpers/heroku');

let interval;

const TestController = {
  findAll: async (req, res) => {

    /**
     * @description CALLS The setActive API After Every 25 Mins or 1500000 Milliseconds.
     */
    if(!interval) {
      interval = setInterval(_ => {
        HEROKU.setActive();
      }, 1500000);
    }

    return res.status(200).send({
      message: { type: 'success' },
      data: 'You are connected to Psynapsus Node.js server.'
    });
  }

};

module.exports = TestController;