// services/emailService.js
const nodemailer = require('nodemailer');

let transporter;

const setupTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Use host/port if provided, otherwise fallback to Gmail SSL
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 465;
    const secure = port === 465; // SSL for 465

    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, ''),
      },
    });

    // verify but don't crash on startup; log status
    transporter.verify()
      .then(() => console.log('✅ SMTP transporter ready to send emails'))
      .catch(err => console.error('❌ SMTP transporter verification failed:', err?.message || err));
  } else {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Using dev fallback email transporter (no real emails).');
    transporter = {
      // dev fallback - mimics nodemailer sendMail
      sendMail: async (options) => {
        console.log('📨 [DEV MODE] Email send simulated. Set EMAIL_USER and EMAIL_PASS to send real emails.');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        // Do not log OTP in production; here it's dev-mode
        console.log('HTML preview:', options.html?.slice(0, 200) + '...');
        return { messageId: 'dev-fallback-message-id', accepted: [options.to] };
      }
    };
  }
};

setupTransporter();

const emailTemplates = {
  signupOTP: (otp, username) => ({
    subject: 'QuickCourt - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;">
        <div style="background: linear-gradient(135deg,#2563EB,#1E40AF);color:white;padding:20px;border-radius:8px;text-align:center;">
          <h1 style="margin:0">QuickCourt</h1>
          <p style="margin:0.25rem 0 0">Email Verification</p>
        </div>
        <div style="background:white;padding:20px;border:1px solid #e5e7eb;border-radius:8px;margin-top:12px;">
          <h2 style="color:#111;">Hello ${username}</h2>
          <p style="color:#6b7280;">Use the code below to verify your QuickCourt account. It expires in 10 minutes.</p>
          <div style="background:#f3f4f6;padding:18px;text-align:center;border-radius:6px;margin:18px 0;">
            <h1 style="color:#2563EB;font-size:28px;letter-spacing:6px;margin:0;">${otp}</h1>
          </div>
          <p style="font-size:12px;color:#9ca3af;">If you didn't request this, ignore this email.</p>
        </div>
      </div>`
  }),
  loginOTP: (otp, username) => ({
    subject: 'QuickCourt - Login Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;">
        <div style="background: linear-gradient(135deg,#2563EB,#1E40AF);color:white;padding:20px;border-radius:8px;text-align:center;">
          <h1 style="margin:0">QuickCourt</h1>
          <p style="margin:0.25rem 0 0">Login Verification</p>
        </div>
        <div style="background:white;padding:20px;border:1px solid #e5e7eb;border-radius:8px;margin-top:12px;">
          <h2 style="color:#111;">Hello ${username}</h2>
          <p style="color:#6b7280;">We received a login request. Use the code below to proceed. Expires in 10 minutes.</p>
          <div style="background:#f3f4f6;padding:18px;text-align:center;border-radius:6px;margin:18px 0;">
            <h1 style="color:#2563EB;font-size:28px;letter-spacing:6px;margin:0;">${otp}</h1>
          </div>
          <p style="font-size:12px;color:#9ca3af;">If you didn't request this, secure your account immediately.</p>
        </div>
      </div>`
  })
};

const sendOTPEmail = async (email, otp, type = 'signup', username = 'User') => {
  try {
    const key = type === 'login' ? 'loginOTP' : 'signupOTP';
    const template = emailTemplates[key](otp, username);

    const mailOptions = {
      from: process.env.EMAIL_USER || `no-reply@quickcourt.local`,
      to: email,
      subject: template.subject,
      html: template.html
    };

    const result = await transporter.sendMail(mailOptions);

    // nodemailer returns different shapes based on transport; just log what's relevant
    if (result && result.messageId) console.log('📧 Email queued/sent, messageId:', result.messageId);
    if (result && result.accepted) console.log('✅ Accepted:', result.accepted);
    if (result && result.rejected && result.rejected.length) console.warn('⚠️ Rejected:', result.rejected);

    return true;
  } catch (err) {
    console.error('❌ Email sending failed:', err?.message || err);
    return false;
  }
};

module.exports = { sendOTPEmail };
