module.exports = {

  //Gets time as UTC (Universal Time) - we use this function so that everything is on one time zone no matter what server it is on etc.
  getDateTimeNow : function() {
    var now = new Date();
    var nowUtc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
    //Janurary is 0
    var date = `${(nowUtc.getMonth()+1)}/${nowUtc.getDate()}/${nowUtc.getFullYear()}`
    var time = `${nowUtc.getHours()}:${nowUtc.getMinutes()}:${nowUtc.getSeconds()}`;
    var dateTime = `${time} ${date}`;
    return dateTime;
  },

  //Gets local time
  getDateTimeNowLocal : function() {
    var today = new Date();
    //Janurary is 0
    var date = `${(today.getMonth()+1)}/${today.getDate()}/${today.getFullYear()}`
    var time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    var dateTime = `${time} ${date}`;
    return dateTime;
  },

  //This function must be fed a time comparison that is UTC or else it will give invalid results
  getTimeSinceInSeconds : function(date) {
    console.log(date)
    //Split the date into two parts [Time, Date]
    var dateTime = date.split(' ');
    //Split the time part into 3 parts [Hours, Minutes, Seconds]
    var timeParts = dateTime[0].split(':');
    //Split the date part into 3 parts [Month, Day, Year]
    var dateParts = dateTime[1].split('/');
    //Janurary is 0! - Covnert to UTC
    var lastDate = new Date(Date.UTC(dateParts[2], dateParts[0] - 1, dateParts[1], timeParts[0], timeParts[1], timeParts[2]));
    //Time this moment
    var timeNow =  new Date();
    //Difference between the two in seconds
    var difference = (timeNow - lastDate) / 1000;
    //Give back the time in seconds
    return difference;
  },

  getEmailTemplateUser : function(user){
    var emailUser = {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      country: user.country,
      bday: user.bday,
      bmonth: user.bmonth,
      byear: user.byear,
      temporarytoken: user.temporarytoken,
      resettoken: user.resettoken,
      lastip: user.lastip,
      lastactive: user.lastactive,
      lastlocked: user.lastlocked,
      lastforgotusername: user.lastforgotusername,
      lastresettoken: user.lastresettoken,
      lasttemporarytoken: user.lasttemporarytoken,
      lastfailedlogin: user.lastfailedlogin,
      createdon: user.createdon,
      activatedon: user.activatedon
    }
    return emailUser;
  },

  cleanIp: function(ip) {
    return ip.replace(/^.*:/, '');
  },
}
