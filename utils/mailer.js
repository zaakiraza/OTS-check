const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Or use another SMTP service
    auth: {
      user: process.env.MAIL_USER, // Your email address
      pass: process.env.MAIL_PASS, // App password
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;