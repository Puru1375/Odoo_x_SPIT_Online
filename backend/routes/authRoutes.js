const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Email Config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// 1. REGISTER (Send OTP)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update existing unverified user OR create new one
    let user = existingUser;
    if (user) {
        user.name = name;
        user.password = hashedPassword;
        user.role = role || 'Staff';
        user.otp = otp;
        user.otpExpires = otpExpires;
    } else {
        user = new User({
            name, email, password: hashedPassword, role: role || 'Staff',
            otp, otpExpires, isVerified: false
        });
    }
    await user.save();

    // Send Email
    console.log(`📧 OTP for ${email}: ${otp}`); // Fallback for Hackathon
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your StockMaster Account',
        text: `Your Verification OTP is: ${otp}`
      });
    } catch (e) { 
      console.log("Email failed, check console for OTP"); 
      console.error('Email error:', e);
    }

    res.status(201).json({ message: "OTP sent to email" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. VERIFY OTP (Complete Registration)
router.post('/verify-registration', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Verify User
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Account Verified! Please Login." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. LOGIN (Standard - No OTP)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate Token with ROLE
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '12h' }
    );

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;