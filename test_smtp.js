import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  debug: true
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: "Test SMTP",
  text: "Test email from local"
}).then(info => {
  console.log("SUCCESS:", info.messageId);
  process.exit(0);
}).catch(err => {
  console.error("ERROR:", err);
  process.exit(1);
});
