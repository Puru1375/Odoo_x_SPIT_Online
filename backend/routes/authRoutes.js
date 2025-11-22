const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. LOGIN (Step 1: Verify Creds & Send OTP)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to DB (valid for 10 mins)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send Email
    // HACKATHON TIP: Console log the OTP so you don't get stuck if email fails
    console.log(`🔥 HACKATHON OTP FOR ${email}: ${otp}`); 

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your StockMaster Login OTP',
      text: `Your OTP is: ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log("Email failed, but OTP logged in console.");
    }

    res.json({ message: "OTP sent to email" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. VERIFY OTP (Step 2: Issue Token)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    // Check OTP and Expiry
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, role: 'Manager' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
