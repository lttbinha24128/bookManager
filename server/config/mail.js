const nodemailer = require('nodemailer');

async function sendWelcome(user) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return 'unconfigured';
  const port = Number(SMTP_PORT || 587);
  try {
    const transport = nodemailer.createTransport({
      host: SMTP_HOST, port, secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 8000,
    });
    await transport.sendMail({
      from: { name: 'BookManager', address: SMTP_USER },
      to: user.email,
      subject: 'Đăng ký tài khoản BookManager thành công',
      text: 'Chào ' + user.fullName + ',\n\nBạn đã đăng ký thành công tài khoản ' + user.username + ' trên BookManager.',
    });
    return 'sent';
  } catch (error) {
    console.warn('Gửi thư đăng ký thất bại:', error.code || error.name);
    return 'failed';
  }
}

module.exports = sendWelcome;
