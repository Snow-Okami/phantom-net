//REQUIRES
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
//CUSTOM
const constants = require('../utilities/constants');
const User = require('../models/user');

module.exports = function(passport)
{
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = constants.jwtSecretKey;
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.getUserById(jwt_payload.sub, (err, user) => {
      if(err) {
        return done(err, false);
      }
      if(user) {
        //Strip password before returning
        user.password = null;
        return done(null, user);
      }
      else {
        return done(null, false);
      }
    });
  }));
}
