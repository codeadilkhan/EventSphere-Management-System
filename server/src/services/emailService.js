const nodemailer = require('nodemailer');

const createEmailTransport = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
};

const sendPasswordResetEmail = async (userEmail, resetUrl) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@eventsphere.com',
    to: userEmail,
    subject: 'EventSphere — Password Reset Instructions',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 16px;">EventSphere Account Security</h2>
        <p>You recently requested to reset your password for your EventSphere portal account.</p>
        <p>Click the secure button below to proceed. This link is valid for <strong>60 minutes</strong>:</p>
        <div style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Your Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px;">If you did not request this, please disregard this email. Your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">EventSphere Management System &bull; Aptech eProject</p>
      </div>
    `,
  };

  try {
    const transporter = createEmailTransport();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EventSphere Mail] Reset email dispatched: ${info.messageId}`);
    return true;
  } catch (error) {
    console.warn(`[EventSphere Mail Notice] Could not send via SMTP (${error.message}).`);
    console.log(`[Dev Fallback Link]: ${resetUrl}`);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
};
