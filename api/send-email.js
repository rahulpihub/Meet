// api/send-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, code } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.YOUR_EMAIL,
        pass: process.env.YOUR_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.YOUR_EMAIL,
      to: email,
      subject: 'Your Call Code',
      text: `Your unique call code is: ${code}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to send email' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
