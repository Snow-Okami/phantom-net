const simpleRecaptcha = require('simple-recaptcha-new');
const constants = require('../utilities/constants');

module.exports = {

  validateCaptcha : function(ip, recaptchaResponse, callback) {
    var privateKey = constants.googleInvisCaptchaAPIKey;
    //Keeps track of passing captcha or not
    var passed = false;
    //Call for catcha test from Google
    simpleRecaptcha(privateKey, ip, recaptchaResponse, function(err) {
      if (err)  {
        console.log(err.message);
        return false;
      } else {
        passed = true;
      }
      callback(passed);
    });
  },

  validateSameValues : function(val1, val2) {
    if(val1 === val2)
      return true;
    else {
      return false;
    }
  },

  validateBirthday : function(bmonth, bday, byear, reason) {
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
  },

  validateAge : function(bmonth, bday, byear, lowestAge, currentAge)
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
  },

  // Validates that the input string is a valid date formatted as "mm/dd/yyyy"
  isValidDate : function (dateString)
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
  },

  //Gets the age of a user given a date
  getAge : function(m, d, y) {
      var today = new Date();
      m = m - 1;
      var birthDate = new Date(y, m, d);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      return age;
  },

  // Validate Function to check e-mail length
  validateEmailLength : function (email) {
    // Check if e-mail exists
    if (!email) {
      return false; // Return error
    } else {
      // Check the length of e-mail string
      if (email.length < constants.emailLengthMin || email.length > constants.emailLengthMax) {
        return false; // Return error if not within proper length
      } else {
        return true; // Return as valid e-mail
      }
    }
  },

  // Validate Function to check if valid e-mail format
  validateEmail : function (email) {
    // Check if e-mail exists
    if (!email) {
      return false; // Return error
    } else {
      // Regular expression to test for a valid e-mail
      const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      return regExp.test(email); // Return regular expression test results (true or false)
    }
  },

  // Validate Function to check username length
  validateUsernameLength : function (username) {
    // Check if username exists
    if (!username) {
      return false; // Return error
    } else {
      // Check length of username string
      if (username.length < constants.usernameLengthMin || username.length > constants.usernameLengthMax) {
        return false; // Return error if does not meet length requirement
      } else {
        return true; // Return as valid username
      }
    }
  },

  // Validate Function to check if valid username format
  validateUsername : function (username) {
    // Check if username exists
    if (!username) {
      return false; // Return error
    } else {
      // Regular expression to test if username format is valid
      const regExp = new RegExp(/^[a-zA-Z0-9]+$/);
      return regExp.test(username); // Return regular expression test result (true or false)
    }
  },

  // Validate Function to check password length
  validatePasswordLength : function (password) {
    // Check if password exists
    if (!password) {
      return false; // Return error
    } else {
      // Check password length
      if (password.length < constants.passwordLengthMin || password.length > constants.passwordLengthMax) {
        return false; // Return error if passord length requirement is not met
      } else {
        return true; // Return password as valid
      }
    }
  },

  // Validate Function to check if valid password format
  validatePassword : function (password) {
    // Check if password exists
    if (!password) {
      return false; // Return error
    } else {
      // Regular Expression to test if password is valid format
      const regExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/);
      return regExp.test(password); // Return regular expression test result (true or false)
    }
  },
}
