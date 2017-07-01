const simpleRecaptcha = require('simple-recaptcha-new');
const constants = require('../utilities/constants');

var validateCaptcha = function(ip, recaptchaResponse) {
  var privateKey = constants.googleInvisCaptchaAPIKey; // your private key here

  simpleRecaptcha(privateKey, ip, recaptchaResponse, function(err) {
    if (err)  {
      console.log(err.message);
      return false;
    }
    return true;
  });
};

var validateSameValues = function(val1, val2) {
  if(val1 === val2)
    return true;
  else {
    return false;
  }
};

var validateBirthday = function(bmonth, bday, byear, reason) {
  var currentYear = new Date().getFullYear();
  //Simple validation first
  if(bmonth < 0 || bmonth > 12) {
    reason = `Invalid Month: ${bmonth}`;
    return false;
  }
  else if(bday < 0 || bday > 31) {
    reason = `Invalid Day: ${bday}`;
    return false;
  }
  else if(byear < 1899 || bday > currentYear) {
    reason = `Invalid Year: ${byear}`;
    return false;
  }
  else {
    //Full Validation if simple ones have passed
    var date = `${bmonth}/${bday}/${byear}`;
    //The date must be valid, this prevents dates such as in the month of feburary from having too many days
    //Example: 2/31/1892
    if(!this.isValidDate(date)) {
        reason.msg = date;
        return false;
    }
    return true;
  }
};

var validateAge = function(bmonth, bday, byear, lowestAge, currentAge)
{
  //Get age
  currentAge.msg = this.getAge(bmonth, bday, byear);
  //Is the age less than what is allowed?
  if(currentAge.msg < lowestAge) {
    return false;
  }
  else {
    return true;
  }
}

// Validates that the input string is a valid date formatted as "mm/dd/yyyy"
var isValidDate = function (dateString)
{
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

//Gets the age of a user given a date
var getAge = function(m, d, y) {
    var today = new Date();
    m = m - 1;
    var birthDate = new Date(y, m, d);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

module.exports.validateCaptcha = validateCaptcha;
module.exports.validateSameValues = validateSameValues;
module.exports.validateBirthday = validateBirthday;
module.exports.isValidDate = isValidDate;
module.exports.validateAge = validateAge;
module.exports.getAge = getAge;
