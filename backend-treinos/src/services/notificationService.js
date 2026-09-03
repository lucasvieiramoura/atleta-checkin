const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

// Configuração do Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Envio do Código de Ativação por E-mail
const sendActivationEmail = async (toEmail, code) => {
  const mailOptions = {
    from: `"Atleta Checkin" <${process.env.MAIL_USERNAME}>`,
    to: toEmail,
    subject: 'Código de Ativação - Atleta Checkin',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Ativação de Conta</h2>
        <p>Seu código de segurança para liberar o acesso à plataforma é:</p>
        <h1 style="font-size: 32px; letter-spacing: 6px; color: #2563eb;">${code}</h1>
        <p>Este código expira em 15 minutos.</p>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

// Envio do Código de Ativação por SMS (Twilio)
const sendActivationSMS = async (toPhone, code) => {
  return twilioClient.messages.create({
    body: `Atleta Checkin: Seu código de ativação é ${code}. Validade: 15 min.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: toPhone,
  });
};

// Envio do Link de Redefinição de Senha por E-mail
const sendResetPasswordEmail = async (toEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Atleta Checkin" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Recuperação de Senha',
    html: `
      <h2>Redefinição de Senha</h2>
      <p>Você solicitou a alteração da sua senha. Clique no link abaixo para criar uma nova senha:</p>
      <p><a href="${resetUrl}" target="_blank" style="padding: 10px 15px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Redefinir Minha Senha</a></p>
      <p><strong>Atenção:</strong> Este link expira em 30 minutos.</p>
      <p>Se você não solicitou, ignore este e-mail.</p>
    `,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendActivationEmail,
  sendActivationSMS,
  sendResetPasswordEmail,
};