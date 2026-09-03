import nodemailer from 'nodemailer';

// Configure email transport service (using SMTP details from .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send subscription receipt email
export const sendReceiptEmail = async (userEmail, userName, plan, amount) => {
  try {
    const mailOptions = {
      from: `"IllustStudio" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Payment Confirmation - IllustStudio Premium',
      html: `
        <h2>Thank you for subscribing, ${userName}!</h2>
        <p>Your payment for the <strong>${plan.toUpperCase()}</strong> plan was successful.</p>
        <p><strong>Amount Paid:</strong> $${amount}</p>
        <p>You now have full access to Premium Canvas, Unlimited Generation, and AI Rigging tools!</p>
        <br/>
        <p>Best regards,<br/>The IllustStudio Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Receipt email sent to ${userEmail}`);
  } catch (error) {
    console.error('Failed to send receipt email:', error.message);
  }
};

// Function to send welcome email (যেটি আপনার কন্ট্রোলারে খোঁজা হচ্ছিল)
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: `"IllustStudio" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Welcome to IllustStudio!',
      html: `
        <h2>Welcome to IllustStudio, ${userName}!</h2>
        <p>We are excited to have you on board.</p>
        <br/>
        <p>Best regards,<br/>The IllustStudio Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
  }
};