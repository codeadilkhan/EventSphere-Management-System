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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #4f46e5; margin-bottom: 16px; font-weight: 800;">EventSphere Security</h2>
        <p style="color: #334155; line-height: 1.6;">You recently requested to reset your password for your EventSphere portal account.</p>
        <p style="color: #334155; line-height: 1.6;">Click the secure button below to proceed. This link is valid for <strong>60 minutes</strong>:</p>
        <div style="margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
            Reset Your Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you did not request this, please disregard this email. Your credentials remain safe.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">EventSphere Enterprise Platform &bull; Aptech eProject</p>
      </div>
    `,
  };

  try {
    const transporter = createEmailTransport();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Dispatched] Password reset: ${info.messageId}`);
    return true;
  } catch (error) {
    console.warn(`[Email Notice] SMTP dispatch failed (${error.message}). Dev link: ${resetUrl}`);
    return false;
  }
};

const sendApplicationStatusEmail = async (userEmail, applicantName, expoTitle, status, comments = '') => {
  const isApproved = status === 'approved';
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@eventsphere.com',
    to: userEmail,
    subject: `EventSphere — Exhibitor Application ${isApproved ? 'Approved' : 'Status Update'} (${expoTitle})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px; ${
          isApproved ? 'background: #ecfdf5; color: #047857;' : 'background: #fef2f2; color: #b91c1c;'
        }">
          Application ${isApproved ? 'Approved' : 'Rejected'}
        </div>
        <h2 style="color: #0f172a; margin-top: 0; font-weight: 800;">Hello ${applicantName},</h2>
        <p style="color: #334155; line-height: 1.6;">
          Your commercial exhibitor application for <strong>${expoTitle}</strong> has been officially reviewed by the organizers and marked as <strong>${status.toUpperCase()}</strong>.
        </p>
        ${
          comments
            ? `<div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #475569;">
                <strong>Organizer Notes:</strong> "${comments}"
              </div>`
            : ''
        }
        ${
          isApproved
            ? `<p style="color: #334155; line-height: 1.6;">
                You can now log in to the Exhibitor Portal, inspect the interactive floor plan, and select your preferred booth stall.
              </p>
              <div style="margin: 24px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/exhibitor/booths" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
                  Select Your Exhibition Stall
                </a>
              </div>`
            : `<p style="color: #64748b; font-size: 13px;">If you have any questions or wish to appeal this decision, you can submit an inquiry through your feedback portal.</p>`
        }
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">EventSphere Enterprise Platform &bull; Trade Management</p>
      </div>
    `,
  };

  try {
    const transporter = createEmailTransport();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Dispatched] Application status: ${info.messageId}`);
    return true;
  } catch (error) {
    console.warn(`[Email Notice] SMTP dispatch failed (${error.message}).`);
    return false;
  }
};

const sendSessionReminderEmail = async (userEmail, attendeeName, sessionTitle, hall, startTime, expoTitle) => {
  const formattedTime = new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = new Date(startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@eventsphere.com',
    to: userEmail,
    subject: `EventSphere Reminder: "${sessionTitle}" begins shortly!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="background: #eef2ff; color: #4338ca; display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px;">
          Upcoming Session Reminder
        </div>
        <h2 style="color: #0f172a; margin-top: 0; font-weight: 800;">Hello ${attendeeName},</h2>
        <p style="color: #334155; line-height: 1.6;">
          This is a quick reminder that your reserved keynote session <strong>"${sessionTitle}"</strong> is starting soon at <strong>${expoTitle}</strong>.
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;"><strong>Auditorium / Location:</strong> ${hall}</p>
          <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Start Time:</strong> ${formattedDate} at ${formattedTime}</p>
        </div>
        <div style="margin: 24px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/events/my-schedule" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
            Open Your Event Pass & Agenda
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">EventSphere Enterprise Platform &bull; Aptech eProject</p>
      </div>
    `,
  };

  try {
    const transporter = createEmailTransport();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Dispatched] Session reminder: ${info.messageId}`);
    return true;
  } catch (error) {
    console.warn(`[Email Notice] SMTP reminder dispatch failed (${error.message}).`);
    return false;
  }
};

const sendFeedbackReplyEmail = async (userEmail, userName, subject, replyText) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@eventsphere.com',
    to: userEmail,
    subject: `EventSphere Support Response: Re: ${subject}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #0f172a; margin-top: 0; font-weight: 800;">Hello ${userName},</h2>
        <p style="color: #334155; line-height: 1.6;">
          An EventSphere administrator has replied to your inquiry: <strong>"${subject}"</strong>.
        </p>
        <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; font-size: 14px; color: #1e293b; line-height: 1.6;">
          ${replyText}
        </div>
        <p style="color: #64748b; font-size: 13px;">You can view the full discussion history in your support console.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">EventSphere Enterprise Support &bull; Aptech eProject</p>
      </div>
    `,
  };

  try {
    const transporter = createEmailTransport();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Dispatched] Feedback reply: ${info.messageId}`);
    return true;
  } catch (error) {
    console.warn(`[Email Notice] SMTP feedback reply failed (${error.message}).`);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendApplicationStatusEmail,
  sendSessionReminderEmail,
  sendFeedbackReplyEmail,
};
