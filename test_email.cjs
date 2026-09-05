require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function run() {
    try {
        console.log("User:", process.env.EMAIL_USER);
        let info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // send to self
            subject: 'Test Email',
            text: 'This is a test'
        });
        console.log("Success:", info.response);
    } catch (e) {
        console.error("Error sending email:", e);
    }
}
run();
