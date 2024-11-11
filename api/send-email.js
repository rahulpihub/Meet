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
        subject: 'Final HR Interview - Access Link and Call Code',
        text: `Dear Candidate,
    
    We are pleased to invite you to the next stage of our hiring process—a virtual HR interview. Please review the instructions below to ensure a smooth and successful meeting.
    
    Interview Details:
    Link to Join: https://interview-taupe-nine.vercel.app/
    Unique Call Code: ${code}
    
    Instructions:
    At your scheduled interview time, click the link provided above to open the interview platform.
    Enter Your Unique Call Code: You will be prompted to enter your unique code (${code}). This code connects you directly with our HR representative.
    Complete Your Setup: Ensure your camera and microphone are enabled to allow for video and audio during the interview.
    Please be ready and logged in at the scheduled time. If you encounter any issues connecting, feel free to reach out to us immediately for assistance.
    
    Thank you for your interest and preparation. We look forward to our conversation!
    
    Best regards,
    HR TEAM`,
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
