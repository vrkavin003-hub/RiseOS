import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export async function sendMail({ to, subject, html }) {
  if (!env.emailUser || !env.emailPass) {
    console.log(`Email skipped (${subject}) for ${to}`);
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    auth: { pass: env.emailPass, user: env.emailUser },
    service: 'gmail',
  });

  return transporter.sendMail({
    from: `"RiseOS AI" <${env.emailUser}>`,
    html,
    subject,
    to,
  });
}
