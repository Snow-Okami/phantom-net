require('dotenv').config();
const path          = require('path');
const fs            = require('fs');
const nodemailer    = require('nodemailer');
const transporter   = nodemailer.createTransport({
  service: process.env.emailtype,
  auth: {
    user: process.env.emailuser,
    pass: process.env.emailpass,
  }
});
const dir = path.join(__dirname, '../templates/');
const mailer = {
  sendValidateEmail: async function(email) {
    const options = {
      from: process.env.emailuser,
      to: email,
      subject: 'Node.js Test Mail',
      html: fs.createReadStream(dir + 'validateEmail.ejs')
    };

    let r;
    try {
      r = await transporter.sendMail(options);
    } catch(e) {
      return { 'success': false, 'error': e.message };
    }
    return r;
  }
};

module.exports = mailer;