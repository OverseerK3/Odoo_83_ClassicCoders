const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');
const Invite = require('../models/Invite');

const router = express.Router();

// Simple auth middleware using the same secret as auth.js
function auth(req, res, next) {
  console.log('🔐 Auth middleware called');
  console.log('📨 Headers:', req.headers);
  
  const header = req.headers.authorization || '';
  console.log('🔑 Authorization header:', header);
  
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  console.log('🎫 Token extracted:', token ? token.substring(0, 20) + '...' : 'null');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    console.log('✅ Token verified, user ID:', decoded.userId);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (e) {
    console.log('❌ Token verification failed:', e.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// GET /api/teams/me -> current user's team (or null)
router.get('/me', auth, async (req, res) => {
  console.log('👥 GET /me called for user:', req.userId);
  try {
    const team = await Team.findOne({ members: req.userId }).populate('owner members', 'username email role');
    console.log('📋 Team found:', team);
    res.json(team || null);
  } catch (e) {
    console.error('❌ Error in /me:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teams/invites -> invites for current user
router.get('/invites', auth, async (req, res) => {
  console.log('📨 GET /invites called for user:', req.userId);
  try {
    const invites = await Invite.find({ to: req.userId, status: 'pending' })
      .populate('from', 'username email');
    console.log('📬 Invites found:', invites);
    res.json(invites);
  } catch (e) {
    console.error('❌ Error in /invites:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teams/search?query=...&location=... -> search users to invite
router.get('/search', auth, async (req, res) => {
  console.log('🔍 GET /search called');
  console.log('🔍 Query params:', req.query);
  console.log('👤 User ID:', req.userId);
  
  try {
    const { query, location } = req.query;
    if (!query || query.trim().length < 2) {
      console.log('📝 Query too short, returning empty array');
      return res.json([]);
    }

    // Exclude self and users already invited or in same team
    const myTeam = await Team.findOne({ members: req.userId });
    const invited = await Invite.find({ from: req.userId }).select('to');
    const invitedIds = invited.map(i => i.to.toString());
    const excludeIds = new Set([req.userId.toString(), ...(myTeam ? myTeam.members.map(m => m.toString()) : []), ...invitedIds]);
    
    console.log('🚫 Excluding IDs:', Array.from(excludeIds));

    const regex = new RegExp(query, 'i');
    const searchQuery = {
      $and: [
        { _id: { $nin: Array.from(excludeIds) } },
        { role: 'player' },
        { $or: [{ username: regex }, { email: regex }] },
      ],
    };

    // Add location filter if provided
    if (location && location.trim()) {
      searchQuery.$and.push({ location: { $regex: new RegExp(location, 'i') } });
    }
    
    console.log('🔍 Search query:', JSON.stringify(searchQuery, null, 2));

    const users = await User.find(searchQuery).select('username email role location');
    console.log('👥 Users found:', users.length);
    res.json(users);
  } catch (e) {
    console.error('❌ Error in /search:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/teams/invite { toUserId }
router.post('/invite', auth, async (req, res) => {
  console.log('📤 POST /invite called');
  console.log('📦 Request body:', req.body);
  console.log('👤 From user ID:', req.userId);
  
  try {
    const { toUserId } = req.body;
    if (!toUserId) return res.status(400).json({ message: 'toUserId is required' });
    if (toUserId === req.userId) return res.status(400).json({ message: 'Cannot invite yourself' });

    const existing = await Invite.findOne({ from: req.userId, to: toUserId });
    if (existing) return res.status(400).json({ message: 'Invite already exists' });

    const invite = new Invite({ from: req.userId, to: toUserId });
    await invite.save();
    const populated = await invite.populate('from to', 'username email');
    console.log('✅ Invite created:', populated);
    res.status(201).json(populated);
  } catch (e) {
    console.error('❌ Error in /invite:', e);
    if (e.code === 11000) return res.status(400).json({ message: 'Invite already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/teams/invites/:id/respond { action: 'accept' | 'reject' }
router.post('/invites/:id/respond', auth, async (req, res) => {
  console.log('📨 POST /invites/:id/respond called');
  console.log('🆔 Invite ID:', req.params.id);
  console.log('📦 Request body:', req.body);
  console.log('👤 User ID:', req.userId);
  
  try {
    const { action } = req.body;
    const invite = await Invite.findById(req.params.id);
    if (!invite || invite.to.toString() !== req.userId) return res.status(404).json({ message: 'Invite not found' });
    if (invite.status !== 'pending') return res.status(400).json({ message: 'Invite already processed' });

    if (action === 'accept') {
      invite.status = 'accepted';
      await invite.save();

      // Ensure a team exists for inviter (owner is inviter); if not, create
      let team = await Team.findOne({ owner: invite.from });
      if (!team) {
        team = new Team({ owner: invite.from, members: [invite.from] });
      }
      // Add both from and to to team members if not present
      const memberIds = new Set(team.members.map(m => m.toString()));
      if (!memberIds.has(invite.to.toString())) team.members.push(invite.to);
      if (!memberIds.has(invite.from.toString())) team.members.push(invite.from);
      await team.save();
      const populatedTeam = await Team.findById(team._id).populate('owner members', 'username email role');
      console.log('✅ Invite accepted, team updated:', populatedTeam);
      return res.json({ message: 'Invite accepted', team: populatedTeam });
    }

    if (action === 'reject') {
      invite.status = 'rejected';
      await invite.save();
      console.log('❌ Invite rejected');
      return res.json({ message: 'Invite rejected' });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (e) {
    console.error('❌ Error in /invites/:id/respond:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


