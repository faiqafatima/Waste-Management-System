const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Signup
router.post('/signup', async (req, res) => {
    const { fullName, email, password, phoneNumber, city } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user = new User({
            fullName,
            email,
            password: await bcrypt.hash(password, 10),
            phoneNumber,
            city,
            verificationCode
        });

        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email - PakWaste',
            html: `<p>Hi ${fullName},</p>
                   <p>Please use the following code to verify your email:</p>
                   <h3>${verificationCode}</h3>
                   <p><a href="${process.env.FRONTEND_URL}/emailverify.html">Click here to verify</a></p>`
        });

        res.status(201).json({ message: 'Sign Up successful! Please verify your email.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Email Verification
router.post('/verify-email', async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ email, verificationCode: code });
        if (!user) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Email verified successfully!', token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Resend Verification Code
router.post('/resend-code', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Resend Verification Code - PakWaste',
            html: `<p>Hi ${user.fullName},</p>
                   <p>Here is your new verification code:</p>
                   <h3>${verificationCode}</h3>
                   <p><a href="${process.env.FRONTEND_URL}/emailverify.html">Click here to verify</a></p>`
        });

        res.json({ message: 'Verification code resent to your email.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Signin
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email first' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Sign In successful!', token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = Math.random().toString(36).slice(2);
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset - PakWaste',
            html: `<p>Hi ${user.fullName},</p>
                   <p>You requested a password reset. Click the link below to reset your password:</p>
                   <p><a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a></p>
                   <p>This link will expire in 1 hour.</p>`
        });

        res.json({ message: 'A password reset link has been sent to your email.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;