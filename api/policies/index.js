const policies = {

  track: function(req, res, next) {
    console.log(req.method, req.url);
    next();
  },

  isLoggedIn: function(req, res, next) {
    if(!req.headers.authorization) {
      return res.status(403).send('authorization not found!');
    }
    next();
  }

};

module.exports = policies;