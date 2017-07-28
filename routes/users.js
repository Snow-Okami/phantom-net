//REQUIRES
const express = require('express');
const router = express.Router();
//MODULES
const passport = require('passport');
const jwt = require('jsonwebtoken');
//FILE UPLOAD
const mongoose = require('mongoose');
const busboy = require('connect-busboy');
const gridfs = require('gridfs-stream');
var gfs = undefined;
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mkdirp = require('mkdirp');
//CUSTOM
const constants = require('../utilities/constants');
const utils = require('../utilities/utilities');
const auth = require('../services/authentication');
const socketengine = require('../services/socketengine');
const msgengine = require('../services/messagingengine');
const chatengine = require('../services/chatengine');
const emailer = require('../services/emailer');
const Chat = require('../models/chat');
const User = require('../models/user');

//OTHERS
const avatarUploadPath = './uploads/images/avatars';

//DISK
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, avatarUploadPath)
  },
  filename: function (req, file, cb) {
    if(!file.originalname.match(/\.(png|jpg|jpeg|gif)$/)) {
      var err = new Error();
      err.code = 'filetype';
      return cb(err);
    }
    //Resolve extension for file received
    var extension = utils.getFileExtension(file.originalname);
    //Original way of saving data
    var originalFileDate = Date.now() + '-' + file.originalname;
    //Custom avatar way of saving data
    var avatarUserFile = req.header('username') + '.' + extension;
    cb(null, avatarUserFile);
  }
});
//Create avatar upload path if not exists
mkdirp.sync(avatarUploadPath);
//Set up multer saving options
const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 1000000 } }).single('avatarfile');

mongoose.connection.on('connected', () => {
  gfs = new gridfs(mongoose.connection.db, mongoose.mongo);
  console.log(`[${utils.getDateTimeNow()}] GridFS Available and Ready!`);
});

//Register
router.post('/register', (req, res, next) => {
  //Cache the incoming user handle
  var incomingUser = req.body.username;
  //console.log(req.body);
  //Validate Emails
  var emailsMatch = auth.validateSameValues(req.body.email, req.body.emailConfirm);
  if(!emailsMatch) {
    var errorMsg = `Failed to register ${incomingUser}! - Emails do not match!`;
    console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
    return res.json({success: false, msg: errorMsg});
  }

  //Validate Passwords
  var passwordsMatch = auth.validateSameValues(req.body.password, req.body.passwordConfirm);
  if(!passwordsMatch) {
    var errorMsg = `Failed to register ${incomingUser}! - Passwords do not match!`;
    console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
    return res.json({success: false, msg: errorMsg});
  }

  //Validate Birthday
  //Javscript hack, pass by object to pass by reference, not value
  var reason = { msg: undefined };
  var birthdayValid = auth.validateBirthday(req.body.bmonth, req.body.bday, req.body.byear, reason);
  if(!birthdayValid) {
    var errorMsg = `Failed to register ${incomingUser}! - Birthday is invalid: ${reason.msg}!`;
    console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
    return res.json({success: false, msg: errorMsg});
  }

  //Validate Age
  //Javscript hack, pass by object to pass by reference, not value
  var currentAge = { msg: undefined };
  var ageValid = auth.validateAge(req.body.bmonth, req.body.bday, req.body.byear, constants.ageRestriction, currentAge);
  if(!ageValid) {
    var errorMsg = `Failed to register ${incomingUser}! - Age ${currentAge.msg} is too young!`;
    console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
    return res.json({success: false, msg: errorMsg});
  }

  //Validate Email
  var emailValid = auth.validateEmail(req.body.email);
  if(!emailValid) {
    var errorMsg = `Failed to register ${incomingUser}! - Must be a valid E-mail!`;
    console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
    return res.json({success: false, msg: errorMsg});
  }

  //Validate Email Length
  var emailValidLength = auth.validateEmailLength(req.body.email);
  if(!emailValidLength) {
    var errorMsg = `Failed to register ${incomingUser}! - E-mail must be at least ${constants.emailLengthMin} characters but no more than ${constants.emailLengthMax}`;
    console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
    return res.json({success: false, msg: errorMsg});
  }

  //Validate Username
  var usernameValid = auth.validateUsername(req.body.username);
  if(!usernameValid) {
    var errorMsg = `Failed to register ${incomingUser}! - Username must not have any special characters`;
    console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
    return res.json({success: false, msg: errorMsg});
  }

  //Validate Username Length
  var usernameValidLength = auth.validateUsernameLength(req.body.username);
  if(!usernameValidLength) {
    var errorMsg = `Failed to register ${incomingUser}! - Username must be at least ${constants.usernameLengthMin} characters but no more than ${constants.usernameLengthMax}`;
    console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
    return res.json({success: false, msg: errorMsg});
  }

  //Validate Password
  var passwordValid = auth.validatePassword(req.body.password);
  if(!passwordValid) {
    var errorMsg = `Failed to register ${incomingUser}! - Must have at least one uppercase, lowercase, special character, and number`;
    console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
    return res.json({success: false, msg: errorMsg});
  }

  //Validate Password Length
  var passwordValidLength = auth.validatePasswordLength(req.body.password);
  if(!passwordValidLength) {
    var errorMsg = `Failed to register ${incomingUser}! - Password must be at least ${constants.passwordLengthMin} characters but no more than ${constants.passwordLengthMax}`;
    console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
    return res.json({success: false, msg: errorMsg});
  }

  //Strip ip of prefix
  var cleanedIp = utils.cleanIp(req.connection.remoteAddress);
  console.log(cleanedIp + ' ' + req.connection.remoteAddress)
  //Validate captcha - we must wait for a response back from google before proceeding, so because of this we continue account creation ONLY afterwords passing it as a callback
  auth.validateCaptcha(cleanedIp, req.body.captchaResponse, (passedCaptcha) => {
    if(!passedCaptcha) {
      var errorMsg = `Failed to register ${incomingUser}! - Failed the Captcha Test!`;
      console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
      return res.json({success: false, msg: errorMsg});
    }
    //Create a new user using our schema
    let newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      bmonth: req.body.bmonth,
      bday: req.body.bday,
      byear: req.body.byear,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      secretone: req.body.secretone,
      secretoneanswer: req.body.secretoneanswer,
      country: req.body.country,
      createdon: utils.getDateTimeNow(),
      lastactive: utils.getDateTimeNow(),
      lastip: cleanedIp,
      temporarytoken: jwt.sign({ username: req.body.username, email: req.body.email }, constants.jwtSecretKey, { expiresIn: constants.verificationTokenExpireTimeInHours }),
      chats: [],
      participatedchats: []
    });

    //Add user
    User.addUser(newUser, (err, user) => {
      if(err) {
        var errorMsg = `Failed to register ${incomingUser}! - Error: ${err}`;
        console.log(`[${utils.getDateTimeNow()}] ${errorMsg}`);
        return res.json({success: false, msg: errorMsg});

        if (err.code === 11000) {
          var errorMsg = `Username or e-mail already exists`;
          console.log(`[${utils.getDateTimeNow()}] ${errorMsg} : ${err}`);
          return res.json({ success: false, msg: errorMsg }); // Return error
          } else {
            var errorMsg = 'Could not save user. Error: ';
            console.log(`[${utils.getDateTimeNow()}] ${errorMsg} : ${err}`);
            res.json({ success: false, msg: errorMsg, err }); // Return error if not related to validation
          }
        } else {
            var successMsg = `Registered ${incomingUser}!`;
            //Send Verification Email
            var emailUser = utils.getEmailTemplateUser(user);
            emailer.sendVerificationEmail(emailUser);
            console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
            return res.json({success: true, msg: successMsg});
          }
    });
  });
});

//Authenticate
router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    if(!user) {
      var failureMsg = `Failed to authenticate. User ${username} not found!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    }
    //Prevent locked accounts from trying to authenticate
    if(user.locked) {
      var failureMsg = `Failed to authenticate. User ${username} account is locked!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch) {
        //Splice out the password from the user object
        //We do this to prevent the users password from being exposed even as a bcrypt hash
        //This can allow an attacker the possibility to brute force the password from the token offline
        //Make a new user to sign with (so password is not included)
        var strippedUser = { id: user._id, firstname: user.firstname, username: user.username, email: user.email };
        //Sign new token
        const token = jwt.sign(strippedUser, constants.jwtSecretKey, {
          expiresIn: constants.tokenExpireTime
        });
        //Set last active
        user.lastactive = utils.getDateTimeNow();
        //Increment logins
        user.logins++;
        //Save changes to database
        user.save((err) => {
          if(err) { console.log(err); throw err; }
          else {
            //Setup success msg
            var successMsg = `Successfully authenticated user ${username}!`;
            console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
            return res.json({
              success: true,
              token: `JWT ${token}`,
              user: {
                id: user._id,
                firstname: user.firstname,
                username: user.username,
                email: user.email,
                active: user.active,
                locked: user.locked
              },
              msg: successMsg
            });
          }
        });
      }
      else {
        //FIRST FAILED LOGIN
        //First time for failed login or the first new session since our old initial failed login was caught
        if(user.failedloginsessionstart === 'never' || utils.getTimeSinceInSeconds(user.failedloginsessionstart) >= constants.failedLoginTimeThreshold) {
          user.failedloginsessionstart = utils.getDateTimeNow();
          user.failedloginattempts = 0;
        }
        //Cache this failed login after other failed login (from last) logic is done
        user.lastfailedlogin = utils.getDateTimeNow();
        //Cache this lock to user
        user.failedlogins++;
        user.failedloginattempts++;
        //LOCK ACCOUNT - Threshold reached on too many failed logins
        if(user.failedloginattempts >= constants.failedLoginAttemptsThreshold) {
          //Hold the attempts before locking to send background
          var heldAttempts = user.failedloginattempts;
          //Update user
          user.locked = true;
          user.failedloginattempts = 0;
          user.lastlocked = utils.getDateTimeNow();
          user.lastfailedlogin = utils.getDateTimeNow();
          //Save account
          user.save((err) => {
            if(err)  { console.log(err); throw err; }
            else {
              //Send Locked Account Email
              var emailUser = utils.getEmailTemplateUser(user);
              emailer.sendAccountLockedEmail(emailUser);
              //var failureMsgOld = `Too many failed login attempts in under ${constants.failedLoginTimeThreshold} seconds. Atttempts: ${heldAttempts} User ${username} - ACCOUNT LOCKED!`;
              var failureMsg = `Too many failed login attempts. User ${username} - ACCOUNT LOCKED!`;
              console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
              return res.json({success: false, msg: failureMsg });
            }
          });
        }
        else {
          //Save User
          user.save((err) => {
            if(err)  { console.log(err); throw err; }
            else {
              //Old msg, this exposes too much information
              //var failureMsgOld = `Wrong password: ${password} for user ${username} - Attempts: ${user.failedloginattempts} Max: ${constants.failedLoginAttemptsThreshold}!`;
              var failureMsg = `Wrong password for user ${username}! - Failed Logins: ${user.failedloginattempts}!`;
              console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
              return res.json({success: false, msg: failureMsg });
            }
          });
        }
      }
    });
  });
});

//Resend New Activation Link
router.put('/resend', (req, res, next) => {
  const username = req.body.username;
  //Attempt to find the user in the database
  User.findOne({ username: username }, (err, user) => {
    if(err) throw err;
    //User found!
    if(user) {
      //Prevent links from being sent to users who are already active
      if(user.active) {
        var failureMsg = `Failed to re-send new activation link - Username: ${username} is already active!`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        return res.json({success: false, msg: failureMsg});
      }
      user.lastactive = utils.getDateTimeNow();
      user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, constants.jwtSecretKey, { expiresIn: constants.verificationTokenExpireTimeInHours });
      user.save((err) => {
        if(err) { console.log(err); }
        else {
          var successMsg = `Re-sent new activation link to ${username}!`;
          //Send Verification Email
          var emailUser = utils.getEmailTemplateUser(user);
          emailer.sendVerificationEmail(emailUser);
          console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
          return res.json({success: true, msg: successMsg});
        }
      });
    //User NOT found
    } else {
      var failureMsg = `Failed to re-send new activation link - Username: ${username} does not exist!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    }
  });
});

//Activate
router.put('/activate/:token', (req, res, next) => {
  User.findOne({ temporarytoken: req.params.token }, (err, user) => {
    if(err) throw err;
    //Set the token
    var token = req.params.token;
    //Verify the token
    jwt.verify(token, constants.jwtSecretKey, (err, decoded) => {
      if(err) {
        //Failure
        var failureMsg = `Account ${user.username} activation link has expired!`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        return res.json({ success: false, msg: failureMsg});
        //Activation link clicked twice
      } else if(!user) {
        //We truncate the token here as the end user does not need it and its too long to fit properly
        var failureMsg = `Account activation link: [${req.params.token.substring(0,15)}...] has expired! User already activated or doesn't exist!`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        return res.json({ success: false, msg: failureMsg});
      } else {
        //Disable token, activate account
        user.temporarytoken = false;
        user.active = true;
        user.activatedon = utils.getDateTimeNow();
        //Save account
        user.save((err) => {
          if(err)  { console.log(err); throw err; }
          else {
            //Send Activation Email
            var emailUser = utils.getEmailTemplateUser(user);
            emailer.sendActivationEmail(emailUser);
            //Create a user object for data display
            var sentUser = { username: user.username, firstname: user.firstname, email: user.email };
            var successMsg = `Account ${user.username} sucessfully activated at ${user.activatedon}!`;
            console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
            return res.json({ success: true, msg: successMsg, user: sentUser});
          }
        });
      }
    });
  });
});

//Unlock a locked account
router.post('/unlock', (req, res, next) => {
  const username = req.body.username;

  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    if(!user) {
      var failureMsg = `Failed to unlock. User ${username} not found!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    } else {
      //Unlock
      user.locked = false;
      //Update
      user.save((err) => {
        if(err)  {
          console.log(err);
          res.json({ success: false, msg: err });
          throw err; }
        else {
          //Send Forgotten Username Email
          var emailUser = utils.getEmailTemplateUser(user);
          emailer.sendUnlockEmail(emailUser);
          var successMsg = `Account ${user.email} sucessfully unlocked!`;
          console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
          return res.json({ success: true, msg: successMsg});
        }
      });
    }
  });
});

//Forgot Username
router.post('/forgotusername', (req, res, next) => {
  const email = req.body.email;

  User.getUserByEmail(email, (err, user) => {
    if(err) throw err;
    if(!user) {
      var failureMsg = `Failed to send forgotten Username request. Email ${email} not found!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
      //Re-activate this if we somehow want to restrict forgotten username requests from non-active accounts
    // } else if(!user.active) {
    //   var failureMsg = `[${utils.getDateTimeNow()}] Failed to send forgotten Username request. Email ${email} is not activated yet!`;
    //   console.log(failureMsg);
    //   return res.json({success: false, msg: failureMsg});
    } else {
      user.lastforgotusername = utils.getDateTimeNow();
      user.save((err) => {
        if(err)  {
          console.log(`[${utils.getDateTimeNow()}] ${err}`);
          res.json({ success: false, msg: err });
          throw err; }
        else {
          //Send Forgotten Username Email
          var emailUser = utils.getEmailTemplateUser(user);
          emailer.sendForgotUsernameEmail(emailUser);
          var successMsg = `Account ${user.email} sucessfully sent their forgotten username!`;
          console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
          return res.json({ success: true, msg: successMsg});
        }
      });
    }
  });
});

//Forgot Password
router.post('/resetpassword', (req, res, next) => {
  const username = req.body.username;

  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    //No user found
    if(!user) {
      var failureMsg = `Failed to send reset password request. User ${username} not found!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    //User is not active
    } else if(!user.active) {
      var failureMsg = `Failed to send reset password request. User ${user.username} is not activated yet!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    //All checks passed!
    } else {
      //Cache the last time a reset token was sent
      user.lastresettoken = utils.getDateTimeNow();
      //Increment password reset requests
      user.passwordresetrequests++;
      //Create Password Reset Token
      user.resettoken = jwt.sign({ username: user.username, email: user.email }, constants.jwtSecretKey, { expiresIn: constants.resetPasswordTokenExpireTimeInHours });
      //Save User
      user.save((err) => {
        if(err)  {
          console.log(`[${utils.getDateTimeNow()}] ${err}`);
          res.json({ success: false, msg: err });
          throw err; }
        else {
          //Send Reset Password Email
          var emailUser = utils.getEmailTemplateUser(user);
          emailer.sendResetPasswordEmail(emailUser);
          var successMsg = `Account ${user.username} sucessfully sent a password reset link!`;
          console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
          return res.json({ success: true, msg: successMsg});
        }
      });
    }
  });
});

//Reset Password
router.put('/resetpassword/:token', (req, res, next) => {
  const token = req.params.token;
  //Get user by the reset token presented
  User.getUserByResetToken(token, (err, user) => {
    if(err) throw err;
    //No user found
    if(!user) {
      var failureMsg = `Failed to reset password. User with the token: [${req.params.token.substring(0,15)}] not found!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    //User is not activated yet
    } else if(!user.active) {
      var failureMsg = `Failed to reset password. User ${user.username} is not activated yet!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    //All checks passed!
    } else {
      //Verify the token
      jwt.verify(token, constants.jwtSecretKey, (err, decoded) => {
        //Error occured
        if(err) {
          var failureMsg = `Failed to continue password reset. User ${user.username} has an invalid token! ` + 'err';
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          return res.json({success: false, msg: failureMsg});
        //Verification passed!
        } else {
          //Send some user data back for knowing more about the user whose request was accepted
          var sendUser = { firstname: user.firstname, username: user.username, email: user.email }
          var successMsg = `Account ${user.username} sucessfully verified for password reset!`;
          console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
          return res.json({ success: true, msg: successMsg, user: sendUser });
        }
      });
    }
  });
});

//Save Password
router.put('/savepassword', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    //No valid user found
    if(!user) {
      var failureMsg = `Failed to save new password. User ${username} not found!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    //Catch non active user
    } else if(!user.active) {
      var failureMsg = `Failed to save new password. User ${user.username} is not activated yet!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    //Catch the user changing passwords without active token
    } else if(user.resettoken === 'false' || user.resettoken === 'never' || user.resettoken === 'undefined') {
      var failureMsg = `Failed to save new password. User ${user.username} has no active reset token!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    //Catch different passwords
    } else if(!auth.validateSameValues(password, passwordConfirm)) {
      var failureMsg = `Failed to save new password for ${user.username}. Passwords do not match!!`;
      console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
      return res.json({success: false, msg: failureMsg});
    } else {
      //Update user vars for saving
      //Change password and reset reset token to no more - 'false'
      user.password = password;
      user.resettoken = false;
      //Increment password resets
      user.passwordresets++;
      //Save and hash the password
      User.saveUserPassword(user, (err, user) => {
        if(err)  {
          console.log(err);
          res.json({ success: false, msg: err });
          throw err; }
        else {
          if(!user) {
            var failureMsg = `Failed to save new password. User ${user.username} not found during save user password routine!`;
            console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
            return res.json({success: false, msg: failureMsg});
          } else {
            //Send New Password Email
            var emailUser = utils.getEmailTemplateUser(user);
            emailer.sendNewPasswordEmail(emailUser);
            var successMsg = `Account ${user.username} sucessfully sent a saved new password confirmation!`;
            console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
            return res.json({ success: true, msg: successMsg});
          }
        }
      });
    }
  });
});

//Reactive Email Check
router.get('/checkemail/:email', (req, res) => {
  // Check if email was provided in paramaters
  if (!req.params.email) {
    res.json({ success: false, msg: 'E-mail was not provided' }); // Return error
  } else {
    // Search for user's e-mail in database;
    User.findOne({ email: req.params.email }, (err, user) => {
      if (err) {
        res.json({ success: false, msg: err }); // Return connection error
      } else {
        // Check if user's e-mail is taken
        if (user) {
          res.json({ success: false, msg: 'E-mail is already taken' }); // Return as taken e-mail
        } else {
          res.json({ success: true, msg: 'E-mail is available' }); // Return as available e-mail
        }
      }
    });
  }
});

//Reactive Username Check
router.get('/checkusername/:username', (req, res) => {
  // Check if username was provided in paramaters
  if (!req.params.username) {
    res.json({ success: false, msg: 'Username was not provided' }); // Return error
  } else {
    // Look for username in database
    User.findOne({ username: req.params.username }, (err, user) => {
      // Check if connection error was found
      if (err) {
        res.json({ success: false, msg: err }); // Return connection error
      } else {
        // Check if user's username was found
        if (user) {
          res.json({ success: false, msg: 'Username is already taken' }); // Return as taken username
        } else {
          res.json({ success: true, msg: 'Username is available' }); // Return as vailable username
        }
      }
    });
  }
});

//Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
  res.json({user: req.user});
});

//Settings
router.get('/settings', passport.authenticate('jwt', {session: false}), (req, res, next) => {
  res.json({user: req.user});
});

router.post('/uploadAvatarGFS', function(req, res, next){
  //var busboy = new busboy({ headers: req.headers });
  var fileId = new mongoose.Types.ObjectId();
  var username;
  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log('got file', filename, mimetype, encoding);
    console.log(fileId)
    username = fieldname;
    gfs.findOne({_id: fieldname}, (err, file) => {
      gfs.db.collection(fieldname + '.chunks').remove({_id: fieldname}, function(err) { console.log(err); });
    });
    var writeStream = gfs.createWriteStream({
      _id: fieldname,
      filename: filename,
      mode: 'w',
      content_type: mimetype,
      metadata:
      {
        origId: fileId,
        uploadedBy: fieldname,
        encoding: encoding,
      }
    });
    file.pipe(writeStream);
  }).on('finish', function() {
    // show a link to the uploaded file
    res.writeHead(200, {'content-type': 'text/html'});
    res.end('/avatar/' + username.toString());
  });

  req.pipe(req.busboy);
});

router.get('/avatarGFS/:username', function(req, res) {
  gfs.findOne({ _id: req.params.username }, function (err, file) {
    if (err) return res.status(400).send(err);
    if (!file) return res.status(404).send('');

    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');

    var readstream = gfs.createReadStream({
      _id: file._id
    });

    readstream.on("error", function(err) {
      console.log("Got error while processing stream " + err.message);
      res.end();
    });

    readstream.pipe(res);
  });
});

router.get('/image/:id',function(req,res){

    var id = req.params.id;
    var ObjectId = require('mongodb').ObjectID;
    var outPutFromDbFile = __dirname + '/public/uploads/' + id + '.png';
    var writeStream = fs.createWriteStream(outPutFromDbFile);

   // var BSON = require('mongodb').BSONPure;
   // var o_id = BSON.ObjectID.createFromHexString(id);

    var o_id = ObjectID(id);

    var gridStore = new GridStore(db,o_id,"r");
    gridStore.open(function (err,gridStore){
        if(err)
        {
            console.log('error' + err);
        }

        var readStream = gridStore.stream(true);
        readStream.on("end",function(){
           console.log('close was called');
            res.sendFile(outPutFromDbFile);
        });
        readStream.pipe(writeStream);
    });

});

router.post('/uploadAvatar', passport.authenticate('jwt', {session: false}), function(req, res) {
  //First find and delete any possible past avatars stored

  //Upload will intercept at the first file it finds
  //Because of this we should make sure we send ALL fields before the file, not after
  uploadAvatar(req, res, function(err) {
    //Const here can't be before due to the multer method we are inside of now
    const username = req.header('username');
    if(err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        var failureMsg = `Failed to upload avatar for user ${username}. File size was too big!`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        res.json({ success: false, msg: failureMsg});
      } else if (err.code === 'filetype') {
        var failureMsg = `Failed to upload avatar for user ${username}. File type is invalid. Must be png / jpg / jpeg / gif`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        res.json({ success: false, msg: failureMsg});
      } else {
        var failureMsg = `Failed to upload avatar for user ${username} ${err}`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        res.json({ success: false, msg: failureMsg});
      }
    } else {
      if(!req.file) {
        var failureMsg = `Failed to upload avatar for user ${username} No file was selected!`;
        console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
        res.json({ success: false, msg: failureMsg});
      } else {
        //Construct lookup of the user's avatar image
        var fileExt = utils.getFileExtension(req.file.filename);
        var userAvatarFile = username + '.' + fileExt;
        //Note the above is the same as req.file.filename -> but we leave it this way in case of future changes
        User.getUserByUsername(username, (err, user) => {
          if(err) console.log(`[${utils.getDateTimeNow()}] ${err}`);
          else {
            //Wildcard to delete ALL other avatars this user has uploaded (username.*) - any extension)
            //var wildcard = new RegExp(req.header('username') + '.*');
            //Wildcard delete all EXCEPT the image just saved this this new file extension - this is a tricky
            //Race condition as we are deleting inside of a saving function
            var wildcard = new RegExp(req.header('username') + '\.(?!(' + fileExt + ')$)([^.]+$)');
            //Delete the wildcards
            utils.deleteAllWildcards(fs, avatarUploadPath, wildcard);
            //Save avatar
            user.avatar = userAvatarFile;
            //Save user
            user.save((err) => {
              if(err) { console.log(err); }
              else {
                var successMsg = `Avatar was uploaded for ${username}!`;
                console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
                res.json({ success: true, msg: successMsg});
              }
            });
          }
        });
      }
    }
  });
});

//Validate
router.get('/avatarlink/:username', (req, res) => {
  const username = req.params.username;
  User.getUserByUsername(username, (err, user) => {
    if(err) console.log(`[${utils.getDateTimeNow()}] ${err}`);
    else {
      if(!user) {
        return res.send('https://thebenclark.files.wordpress.com/2014/03/facebook-default-no-profile-pic.jpg');
      }
      if(user.avatar == undefined || user.avatar === 'none')
      {
        return res.send('https://thebenclark.files.wordpress.com/2014/03/facebook-default-no-profile-pic.jpg');
      }
      //Load avatar using the path saved
      return res.send(path.join(__dirname, '..', avatarUploadPath) + '/' + user.avatar);
    }
  });
});

router.get('/avatar/:username', (req, res) => {
  const username = req.params.username;
  User.getUserByUsername(username, (err, user) => {
    if(err) console.log(`[${utils.getDateTimeNow()}] ${err}`);
    else {
      if(!user) {
        var failureMsg = `Failed to get Avatar. User not found: ${username}!`;
        //Send Unknown Avatar
        return res.sendFile(path.join(__dirname, '..', avatarUploadPath) + '/' + 'unknown.png');
      }
      if(user.avatar == undefined || user.avatar === 'none')
      {
        var failureMsg = `Failed to get Avatar. User ${username} has none!`;
        //Send blank Avatar
        return res.sendFile(path.join(__dirname, '..', avatarUploadPath) + '/' + 'blank.png');
      }
      //Load avatar using the path saved
      return res.sendFile(path.join(__dirname, '..', avatarUploadPath) + '/' + user.avatar);
    }
  });
});

//Validate
router.get('/validate', (req, res, next) => {
  res.send('VALIDATE');
});

//Kafka Testing
router.get('/kafka/:message', (req, res, next) => {
  const msg = req.params.message;

  msgengine.sendMsgToKafka(msg);

  res.send(`SENT MSG: ${msg}`);
});

//Redis Testing
router.get('/redis/set/:key/:value', (req, res, next) => {
  const key = req.params.key;
  const value = req.params.value;

  msgengine.setRedisKeyValue(key, value);

  res.send(`SET REDIS - KEY: ${key} | VALUE: ${value}`);
});

//Redis Testing
router.get('/redis/get/:key', (req, res, next) => {
  const key = req.params.key;

  //Setup callback
  var cb = function(value) {
    res.send(`GET REDIS - KEY: ${key} | VALUE: ${value}`);
  };

  //Get the value async, and send the result back to the callback passed in
  msgengine.getRedisKeyValue(key, cb);
});

//Websocket Testing
router.get('/ws/send/:username/:msg', (req, res, next) => {
  const username = req.params.username;
  const msg = req.params.msg;

  var sent = socketengine.sendToUser(username, msg);
  if(sent)
    res.send(`SENT TO CLIENT: ${username} - MSG: ${msg}`);
  else {
    res.send(`FAILED TO SEND TO: ${username} - MSG: ${msg}`);
  }
});

//Websocket Testing
router.get('/ws/sendall/:msg', (req, res, next) => {
  const msg = req.params.msg;

  socketengine.sendAllClients(msg);
  res.send(`SENT ALL CLIENTS - MSG: ${msg}`);
});

//Chat Testing
router.get('/chat/create/:username/:createdtype', (req, res, next) => {
  const username = req.params.username;
  const createdtype = req.params.createdtype;

  chatengine.createChat(username, createdtype, (newCreatedChat) => {
    //console.log(newCreatedChat)
    if(newCreatedChat) {
        res.send(`CREATED NEW CHAT ${newCreatedChat.uuid} - OWNER: ${username}`);
    } else {
        res.send(`FAILED TO CREATE CHAT FOR ${username}`);
    }
  });
});

router.get('/chat/adduser/:username/:uuid', (req, res, next) => {
  const username = req.params.username;
  const uuid = req.params.uuid;

  chatengine.addUserToChat(uuid, username, (success) => {
    if(success) {
        res.send(`ADDED ${username} TO CHAT: ${uuid}`);
    } else {
        res.send(`FAILED TO ADD ${username} TO CHAT ${uuid}`);
    }
  });
});

router.get('/chat/removeuser/:username/:uuid', (req, res, next) => {
  const username = req.params.username;
  const uuid = req.params.uuid;

  chatengine.removeUserFromChat(uuid, username, (success) => {
    if(success) {
        res.send(`REMOVED ${username} FROM CHAT: ${uuid}`);
    } else {
        res.send(`FAILED TO REMOVE ${username} FROM CHAT ${uuid}`);
    }
  });
});

router.get('/chat/send/:username/:uuid/:msg', (req, res, next) => {
  const username = req.params.username;
  const uuid = req.params.uuid;
  const msg = req.params.msg;

  chatengine.sendChatMsg(username, uuid, msg, (success) => {
    if(success) {
        res.send(`SUCCESSFULLY SENT ${username}:${msg} TO CHAT: ${uuid}`);
    } else {
        res.send(`FAILED TO SEND ${username}:${msg} TO CHAT: ${uuid}`);
    }
  });
});

router.post('/test', (req, res, next) => {
  const username = req.body.username;
  //Attempt to find the user in the database
  User.findOne({ username: username }, (err, user) => {
    if(err) throw err;
    //User found!
    if(user) {
      utils.getTimeSinceInSeconds(user.lastactive);
      if(failedloginattempts >= constants.failedLoginAttemptsThreshold) {

      }
      if(user.lastfailedlogin >= utils.getTimeSinceInSeconds(lastfailedlogin)) {

      }
    }
    });

  res.send('TEST');
});

module.exports = router;
