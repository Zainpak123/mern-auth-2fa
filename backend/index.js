const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDb = require('./connect');
require('dotenv').config(); // ✅ load env

const userRoute = require('./routes/userRoute');

// Connect DB
connectDb(process.env.MONGO_URI).then(() => console.log('Connected to MongoDB'));

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL, // ✅ dynamic frontend URL
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/users', userRoute);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
