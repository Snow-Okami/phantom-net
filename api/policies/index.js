const policies = {

  track: function(req, res, next) {
    console.log(req.method, req.url);
    next();
  },

  isLoggedIn: function(req, res, next) {
    
  }

};

module.exports = policies;