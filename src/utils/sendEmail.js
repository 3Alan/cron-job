import nodemailer from 'nodemailer';

export const QQSmtp = {
  host: 'smtp.qq.com',
  port: 465
};

export default async function sendEmail({
  from = process.env.EMAIL_FROM,
  to = process.env.EMAIL_TO,
  subject,
  text,
  html
}) {
  const transporter = nodemailer.createTransport({
    host: QQSmtp.host,
    port: QQSmtp.port,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from, // sender address
    to, // list of receivers
    subject, // Subject line
    text, // plain text body
    html
  });
}
