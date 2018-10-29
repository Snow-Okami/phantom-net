
const policies = {
  track: async (req, res, next) => {
    console.log(req.method, req.url);
    next();
  }
};

module.exports = policies;