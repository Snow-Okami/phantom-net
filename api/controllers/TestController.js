const API = {
  find: (req, res) => {
    res.status(200)
    .set('Content-Type', 'application/json')
    .send({
      success: true,
      message: 'You are connected to Rotten Visions NodeJS server.'
    });
  }
};

module.exports = API;