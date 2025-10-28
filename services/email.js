
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMail({ to, subject, text, html }) {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email.');
    }
  }
}

module.exports = new EmailService();

// example usage 
// const EmailService = require('./services/email');

// // Example usage in a controller or another service
// async function sendWelcomeEmail(userEmail) {
//   try {
//     await EmailService.sendMail({
//       to: userEmail,
//       subject: 'Welcome to our application!',
//       text: 'Thank you for signing up.',
//       html: '<h1>Welcome!</h1><p>Thank you for signing up.</p>',
//     });
//   } catch (error) {
//     // Handle email sending failure
//   }
// }