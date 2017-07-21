//MAIN
var fs = require('fs');
var path = require('path');
//MODULES
const elastic = require("elastic-email");
const elasticemail = require('elasticemail');
const nodemailer = require('nodemailer');
//CUSTOM
const constants = require('../utilities/constants');
const utils = require('../utilities/utilities');
const EmailTemplate = require('email-templates').EmailTemplate;
//TEMPLATES
const verificationEmailDir = path.join(__dirname, '..', 'templates', 'verification');
const activationEmailDir = path.join(__dirname, '..', 'templates', 'activation');
const resetPasswordEmailDir = path.join(__dirname, '..', 'templates', 'resetpassword');
const newPasswordEmailDir = path.join(__dirname, '..', 'templates', 'newpassword');
const forgotUsernameEmailDir = path.join(__dirname, '..', 'templates', 'forgotusername');
const lockedEmailDir = path.join(__dirname, '..', 'templates', 'locked');

const client = elasticemail.createClient({
    username: constants.elasticUser,
    apiKey: constants.elasticMailAPIKey
  });

module.exports = {

  sendVerificationEmail : function(user)
  {
      this.client;
      //Render our HTML template using EJS
      var verification = new EmailTemplate(verificationEmailDir);
      verification.render(user, function (err, result) {
        if (err) {
          console.log(err);
          return false;
        }
        var msg = {
          from: constants.emailProvider,
          from_name: constants.emailNameProvider,
          to: user.email,
          subject: 'Account Verification',
          body_html: result.html,
          body_text: result.text
        };

      client.mailer.send(msg, function(err, result) {
        if (err) {
          return console.error(err);
          return false;
        }
        console.log(`[${utils.getDateTimeNow()}] Verification Email sent to ${user.username} @ ${user.email} on ${user.createdon} Result: ${result}`);
        return true;
      });
    });
  },

  sendActivationEmail : function(user)
  {
      this.client;

      var activation = new EmailTemplate(activationEmailDir);
      activation.render(user, function (err, result) {
        if (err) {
          console.log(err);
          return false;
        }
        var msg = {
          from: constants.emailProvider,
          from_name: constants.emailNameProvider,
          to: user.email,
          subject: 'Account Activated!',
          body_html: result.html,
          body_text: result.text
        };

      client.mailer.send(msg, function(err, result) {
        if (err) {
          return console.error(err);
          return false;
        }

        console.log(`[${utils.getDateTimeNow()}] Activated Email sent to ${user.username} @ ${user.email} Result: ${result}`);
        return true;
      });
    });
  },

  sendResetPasswordEmail : function(user)
  {
      this.client;

      var resetPass = new EmailTemplate(resetPasswordEmailDir);
      resetPass.render(user, function (err, result) {
        if (err) {
          console.log(err);
          return false;
        }
        var msg = {
          from: constants.emailProvider,
          from_name: constants.emailNameProvider,
          to: user.email,
          subject: 'Password Reset Link',
          body_html: result.html,
          body_text: result.text
        };

      client.mailer.send(msg, function(err, result) {
        if (err) {
          return console.error(err);
          return false;
        }

        console.log(`[${utils.getDateTimeNow()}] Reset Password Email sent to ${user.username} @ ${user.email} Result: ${result}`);
        return true;
      });
    });
  },

  sendForgotUsernameEmail : function(user)
  {
      this.client;

      var forgotUsername = new EmailTemplate(forgotUsernameEmailDir);
      forgotUsername.render(user, function (err, result) {
        if (err) {
          console.log(err);
          return false;
        }
        var msg = {
          from: constants.emailProvider,
          from_name: constants.emailNameProvider,
          to: user.email,
          subject: 'Forgotten Username',
          body_html: result.html,
          body_text: result.text
        };

      client.mailer.send(msg, function(err, result) {
        if (err) {
          return console.error(err);
          return false;
        }

        console.log(`[${utils.getDateTimeNow()}] Forgotten Username Email sent to ${user.username} @ ${user.email} Result: ${result}`);
        return true;
      });
    });
  },

  sendNewPasswordEmail : function(user)
  {
      this.client;

      var newPassword = new EmailTemplate(newPasswordEmailDir);
      newPassword.render(user, function (err, result) {
        if (err) {
          console.log(err);
          return false;
        }
        var msg = {
          from: constants.emailProvider,
          from_name: constants.emailNameProvider,
          to: user.email,
          subject: 'New Password Confirmation',
          body_html: result.html,
          body_text: result.text
        };

      client.mailer.send(msg, function(err, result) {
        if (err) {
          return console.error(err);
          return false;
        }

        console.log(`[${utils.getDateTimeNow()}] New Password Confirmation sent to ${user.username} @ ${user.email} Result: ${result}`);
        return true;
      });
    });
  },

  sendAccountLockedEmail : function(user)
  {
      this.client;

      var locked = new EmailTemplate(lockedEmailDir);
      locked.render(user, function (err, result) {
        if (err) {
          console.log(err);
          return false;
        }
        var msg = {
          from: constants.emailProvider,
          from_name: constants.emailNameProvider,
          to: user.email,
          subject: 'Account Locked',
          body_html: result.html,
          body_text: result.text
        };

      client.mailer.send(msg, function(err, result) {
        if (err) {
          return console.error(err);
          return false;
        }

        console.log(`[${utils.getDateTimeNow()}] Account Locked Email sent to ${user.username} @ ${user.email} Result: ${result}`);
        return true;
      });
    });
  },

  getEmailTemplate : function(template)
  {
    return fs.readFileSync(template, 'utf8');
  },
}
