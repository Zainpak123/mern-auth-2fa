const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String ,required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
 role: { 
  type: String, 
  enum: ['User', 'admin', 'superadmin'], 
  default: 'User' 
},
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
