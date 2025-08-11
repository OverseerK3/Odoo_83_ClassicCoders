const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');
const Invite = require('../models/Invite');

const router = express.Router();

// Simple auth middleware using the same secret as auth.js
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// GET /api/teams/me -> current user's team (or null)
router.get('/me', auth, async (req, res) => {
  try {
    const team = await Team.findOne({ members: req.userId }).populate('owner members', 'username email role');
    res.json(team || null);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teams/invites -> invites for current user
router.get('/invites', auth, async (req, res) => {
  try {
    const invites = await Invite.find({ to: req.userId, status: 'pending' })
      .populate('from', 'username email');
    res.json(invites);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teams/search?query=... -> search users to invite
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 2) return res.json([]);

    // Exclude self and users already invited or in same team
    const myTeam = await Team.findOne({ members: req.userId });
    const invited = await Invite.find({ from: req.userId }).select('to');
    const invitedIds = invited.map(i => i.to.toString());
    const excludeIds = new Set([req.userId.toString(), ...(myTeam ? myTeam.members.map(m => m.toString()) : []), ...invitedIds]);

    const regex = new RegExp(query, 'i');
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(excludeIds) } },
        { role: 'player' },
        { $or: [{ username: regex }, { email: regex }] },
      ],
    }).select('username email role');
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/teams/invite { toUserId }
router.post('/invite', auth, async (req, res) => {
  try {
    const { toUserId } = req.body;
    if (!toUserId) return res.status(400).json({ message: 'toUserId is required' });
    if (toUserId === req.userId) return res.status(400).json({ message: 'Cannot invite yourself' });

    const existing = await Invite.findOne({ from: req.userId, to: toUserId });
    if (existing) return res.status(400).json({ message: 'Invite already exists' });

    const invite = new Invite({ from: req.userId, to: toUserId });
    await invite.save();
    const populated = await invite.populate('from to', 'username email');
    res.status(201).json(populated);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: 'Invite already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/teams/invites/:id/respond { action: 'accept' | 'reject' }
router.post('/invites/:id/respond', auth, async (req, res) => {
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
      return res.json({ message: 'Invite accepted', team: populatedTeam });
    }

    if (action === 'reject') {
      invite.status = 'rejected';
      await invite.save();
      return res.json({ message: 'Invite rejected' });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


