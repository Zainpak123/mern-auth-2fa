const sgMail = require("@sendgrid/mail");
require("dotenv").config(); // load .env variables

// ✅ Use environment variable only
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (to, otp) => {
  try {
    const msg = {
      to, // recipient
      from: process.env.EMAIL_FROM, // verified sender in SendGrid
      replyTo: process.env.REPLY_TO || process.env.EMAIL_FROM,
      subject: "Email Verification OTP",
      html: `<h3>Your OTP is: ${otp}</h3><p>It will expire in 10 minutes.</p>`,
    };

    const response = await sgMail.send(msg);
    console.log("✅ Email sent:", response[0].statusCode);
    return response;
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    console.log(`⚠️ OTP for ${to}: ${otp}`); // fallback for testing
  }
};

module.exports = { sendVerificationEmail };
