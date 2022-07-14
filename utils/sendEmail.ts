import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import { QQSmtp } from '../constants/smtp';

export default async function sendEmail({
  from,
  to,
  subject,
  text,
  html
}: MailOptions) {
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
