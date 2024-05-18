const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "49e5798116222f",
      pass: "a60db536ea57ee",
    },
  });

  const messageOptions = {
    from: "Elshan elshan@gmail.com",
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(messageOptions);
};

module.exports = sendMail;
