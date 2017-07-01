module.exports = {
  database: 'mongodb://localhost/phantomnet',

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

}
//Export this here as it is not set to a value or actual constant
module.exports.tokenExpireTime = this.timeOfOneWeekInSeconds;
