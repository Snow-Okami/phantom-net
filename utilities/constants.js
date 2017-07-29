module.exports = {
  database: 'mongodb://localhost/phantomnet',

  expressPort : 3000,
  socketioPort : 3001,

  timeOfOneWeekInSeconds : 604800,
  timeOfThirtyMinutes : 1800,

  verificationTokenExpireTimeInHours : '24h',
  resetPasswordTokenExpireTimeInHours : '24h',
  jwtSecretKey : 'vMHGggOJZll,bs6>%Bo)jJ:s,$OFT}iF:6lq1xk76<B`&(||qmyMuccS_FiRA',

  ageRestriction : 13,

  //1 Hour
  failedLoginTimeThreshold: 3600,
  failedLoginAttemptsThreshold: 5,

  googleCaptchaAPIKey : "6LcdACcUAAAAAKZv1h1ydI9NBZLw9DZo5-oAKT3w",
  googleInvisCaptchaAPIKey : "6LeiAicUAAAAAEtrcBzi-UO8i9MbNPkxd4MdKK7U",

  sendGridAPIUser : "hCUI26caR06ztI2Ugm4zBA",
  sendGridAPIKey : "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",

  elasticUser : 'ghosthowl@rottenvisions.com',
  elasticMailAPIKey : '3bbda3b3-ea76-4bff-b36c-006fcc440a38',

  emailHost : "http://rottenvisions.com",

  emailProvider : 'noreply@rottenvisions.com',
  emailNameProvider : 'Rotten Visions',

  usernameLengthMin : 3,
  usernameLengthMax : 15,

  emailLengthMin : 5,
  emailLengthMax : 30,

  passwordLengthMin : 8,
  passwordLengthMax : 35,

  COMMAND_SEPARATOR : '%',
  RECIPIENT_SEPARATOR : '#',
  ARGUMENT_SEPARATOR : '|',
  ARGUMENT_VALUE_SEPARATOR : ':',

  KEEP_ALIVE_HEARTBEAT_INTERVAL : 30000, //In miliseconds

  DEBUG_VERBOSITY : 2,
}

//Export this here as it is not set to a value or actual constant
module.exports.tokenExpireTime = this.timeOfOneWeekInSeconds;
