import nodemailer from 'nodemailer';

let transporter = null;
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

async function send(to, subject, html) {
  if (!transporter) {
    console.log(`[emailService] Skipped "${subject}" to ${to} — set GMAIL_USER/GMAIL_APP_PASSWORD in .env to enable sending.`);
    return;
  }
  await transporter.sendMail({ from: `"Illust Studio" <${process.env.GMAIL_USER}>`, to, subject, html });
}

export function sendWelcomeEmail(user) {
  return send(user.email, 'Welcome to Illust Studio', `<p>Hi ${user.name}, your account is ready.</p>`);
}
export function sendReceiptEmail(user, amount, plan) {
  return send(user.email, 'Your Illust Studio receipt', `<p>Thanks for subscribing to ${plan}. Charged $${amount}.</p>`);
}