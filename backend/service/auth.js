const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET; // ✅ from env

const setUser = (user) => {
  try {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secret
    );
  } catch (err) {
    return null;
  }
};

const getUser = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

module.exports = { setUser, getUser };
