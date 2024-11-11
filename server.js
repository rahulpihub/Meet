require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.YOUR_EMAIL,
    pass: process.env.YOUR_PASSWORD,
  },
});

app.post('/send-email', (req, res) => {
  const { email, code } = req.body;

  const mailOptions = {
    from: process.env.YOUR_EMAIL,
    to: email,
    subject: 'Your Call Code',
    text: `Your unique call code is: ${code}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to send email' });
    } else {
      res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
