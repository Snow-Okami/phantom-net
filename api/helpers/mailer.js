require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: process.env.emailtype,
  auth: {
    user: process.env.emailuser,
    pass: process.env.emailpass
  }
});

const mailer = {
  sendMail: async function(username) {
    const options = {
      from: process.env.emailuser,
      to: username,
      subject: 'Node.js Test Mail',
      text: 'Please ignore this Node.js test mail!'
    };

    let r = await transporter.sendMail(options);
    return r;
  }
};

module.exports = mailer;