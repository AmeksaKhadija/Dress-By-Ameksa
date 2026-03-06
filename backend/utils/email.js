const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  // Skip sending emails in test environment
  if (process.env.NODE_ENV === 'test') {
    return { success: true, messageId: 'test-message-id' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Dress by Ameksa" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email envoye: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Erreur envoi email: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
