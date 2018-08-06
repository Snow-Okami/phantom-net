require('dotenv').config();
const nodemailer    = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: process.env.emailtype,
  auth: {
    user: process.env.emailuser,
    pass: process.env.emailpass,
  }
});

const mailer = {
  sendLoginOTPMail: async function(username) {
    const options = {
      from: process.env.emailuser,
      to: username,
      subject: 'Node.js Test Mail',
      html: '<p>Testing nodemailer using HTML template.</p>'
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