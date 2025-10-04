const express = require('express');
const { handleUserSignup, handleUserLogin, verifyEmail, resendVarificationOTP, verifyLoginOTP , sendForgotPasswordOTP, resetPassword} = require('../controllers/user');
const { restrictToLoggedInUserOnly, restrictToRoles } = require('../middlewares/auth');

const router = express.Router();

router.post("/signup", handleUserSignup);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendVarificationOTP);
router.post("/login", handleUserLogin);
router.post("/verify-login-otp", verifyLoginOTP);

router.post('/forgot-password', sendForgotPasswordOTP);
router.post('/reset-password', resetPassword);

router.get("/home", restrictToLoggedInUserOnly, (req, res) => {
  res.status(200).json({ message: `Welcome ${req.user.email}` });
});

router.get("/admin", restrictToLoggedInUserOnly, restrictToRoles('admin'), (req, res) => {
  res.status(200).json({ message: `Hello Admin ${req.user.email}` });
});

router.get('/superadmin', restrictToLoggedInUserOnly, restrictToRoles('superadmin'), (req, res) => {
  res.status(200).json({ message: `Hello Super Admin ${req.user.email}` });
});

module.exports = router;
