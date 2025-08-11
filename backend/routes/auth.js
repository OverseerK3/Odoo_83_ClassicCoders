// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../services/emailService');

const router = express.Router();

// Configurable values (can be moved to .env)
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10); // default 10
const RESEND_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10); // 60s
const MAX_OTPS_PER_HOUR = parseInt(process.env.OTP_MAX_PER_HOUR || '6', 10);

// Generate OTP (6-digit)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper: seconds between two dates
const secondsSince = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 1000);

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email, type, username } = req.body;
    if (!email || !type) return res.status(400).json({ message: 'Email and type are required' });
    if (!['signup', 'login'].includes(type)) return res.status(400).json({ message: 'Invalid OTP type' });

    // Signup: ensure not already registered
    if (type === 'signup') {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already registered' });
    }

    // Login: ensure user exists
    if (type === 'login') {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });
    }

    // Rate limiting: count recent OTPs in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await OTP.countDocuments({ email, type, createdAt: { $gte: oneHourAgo } });
    if (recentCount >= MAX_OTPS_PER_HOUR) {
      return res.status(429).json({ message: `Too many OTP requests. Try again later.` });
    }

    // Resend cooldown: if last OTP was created recently, tell user to wait
    const last = await OTP.findOne({ email, type }).sort({ createdAt: -1 });
    if (last) {
      const secs = secondsSince(last.createdAt);
      if (secs < RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({ message: `Please wait ${RESEND_COOLDOWN_SECONDS - secs} seconds before requesting a new code.` });
      }
    }

    // Generate OTP and hash it
    const otpPlain = generateOTP();
    const hashed = await bcrypt.hash(otpPlain, 12);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Invalidate previous unused OTPs for this email/type
    await OTP.updateMany({ email, type, isUsed: false }, { isUsed: true });

    // Save hashed OTP
    await OTP.create({ email, otp: hashed, type, expiresAt });

    // Send the plain OTP to user via email
    const sent = await sendOTPEmail(email, otpPlain, type, username || 'User');
    if (!sent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    return res.json({ message: `OTP sent to ${email}`, email });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, type } = req.body;
    if (!email || !otp || !type) return res.status(400).json({ message: 'Email, OTP, and type are required' });

    // Find most recent valid OTP record
    const otpRecord = await OTP.findOne({
      email,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Compare hashed OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      // Optionally mark attempt, add brute-force protections here
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // If signup flow, create the user
    if (type === 'signup') {
      const { username, password, role, location } = req.body;
      if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required' });
      }

      // Race protection: ensure user still does not exist
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        email,
        password: hashedPassword,
        role,
        location: location || 'Ahmedabad',
        isEmailVerified: true
      });
      await user.save();
    }

    // For login flow, you could issue a JWT here or just return success
    // We'll return simple success + email.
    return res.json({ message: 'OTP verified successfully', email });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Signup route (kept but optional - your UI uses send-otp + verify flow)
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role, location } = req.body;
    if (!username || !email || !password || !role) return res.status(400).json({ message: 'All fields are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      location: location || 'Ahmedabad',
      isEmailVerified: false
    });
    await user.save();
    return res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login route (kept)
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'Email, password, and role are required' });

    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Email not verified. Please verify your email first.', requiresVerification: true });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_jwt_secret', { expiresIn: '1h' });

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        location: user.location
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, location, phone, bio, avatar } = req.body;
    
    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (location) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
