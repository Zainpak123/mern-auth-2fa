const bcrypt = require("bcrypt");
const User = require("../models/user");
const { setUser } = require("../service/auth");
const { sendVerificationEmail } = require("../service/sendMail");

const crypto = require("crypto");

async function handleUserSignup(req, res) {
  const { username, email, password, role } = req.body;

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: "Password must be strong.",
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ message: "User Already Exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: role || "user",
    otp,
    otpExpires
  });

 

  await sendVerificationEmail(email, otp);

  return res.status(201).json({ message: "Signup successful. Check your email for OTP." });
}

async function verifyEmail(req, res) {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

   const token = setUser(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return res.status(200).json({ message: "Email verified successfully." });

}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

  // Admin/Superadmin → Direct Login
  if (user.role === 'admin' || user.role === 'superadmin') {
    const token = setUser(user);
    return res.status(200).json({ message: "Login successful", user, token });
  }

  const token = setUser(user);
  res.cookie("token", token, {
    httpOnly: true,
     secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Normal User → Check signup email verified first
  if (!user.isVerified) {
    return res.status(401).json({ message: "Please verify your email before logging in." });
  }

  // Generate OTP for 2FA after login
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  await sendVerificationEmail(user.email, otp);

  return res.status(200).json({ message: "OTP sent to your email for verification.", requires2FA: true });
}

async function verifyLoginOTP(req, res) {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = setUser(user);
  
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  return res.status(200).json({ message: "2FA Verification successful", user, token });
}


async function resendVarificationOTP(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found." });
  if (user.isVerified) return res.status(400).json({ message: "User already verified." });

  const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = newOTP;
  user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user.email, newOTP);

  res.json({ message: "OTP resent to email." });
}

async function sendForgotPasswordOTP(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found." });

  if (user.role === 'admin' || user.role === 'superadmin') {
        return res.status(403).json({ message: "Admins cannot reset password through this flow." });
    }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  await user.save();

  await sendVerificationEmail(email, otp);

  return res.status(200).json({ message: "OTP sent to your email." });
}

// Reset Password after OTP verification
async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return res.status(200).json({ message: "Password reset successfully." });
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
  verifyEmail,
  resendVarificationOTP,
  verifyLoginOTP,
  sendForgotPasswordOTP,
  resetPassword
};
