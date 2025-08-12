const express = require('express');
const jwt = require('jsonwebtoken');
const FacilityManagerRequest = require('../models/FacilityManagerRequest');
const User = require('../models/User');

const router = express.Router();

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Admin middleware
async function adminAuth(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin required.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/facility-requests/send - Admin sends facility manager request
router.post('/send', auth, adminAuth, async (req, res) => {
  try {
    const { userId, message, permissions } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a facility manager
    if (targetUser.role === 'facility_manager') {
      return res.status(400).json({ message: 'User is already a facility manager' });
    }

    // Check if there's already a pending request
    const existingRequest = await FacilityManagerRequest.findOne({
      user: userId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already pending for this user' });
    }

    // Create new request
    const request = new FacilityManagerRequest({
      admin: req.userId,
      user: userId,
      message: message || 'You have been invited to become a facility manager',
      permissions: permissions || {
        canManageAllBookings: true,
        canManageAllVenues: true,
        canViewReports: true
      }
    });

    await request.save();

    const populatedRequest = await FacilityManagerRequest.findById(request._id)
      .populate('admin', 'username email')
      .populate('user', 'username email role');

    res.status(201).json({
      message: 'Facility manager request sent successfully',
      request: populatedRequest
    });
  } catch (error) {
    console.error('Send facility manager request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/facility-requests/sent - Admin gets all sent requests
router.get('/sent', auth, adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = { admin: req.userId };
    if (status) query.status = status;

    const requests = await FacilityManagerRequest.find(query)
      .populate('user', 'username email role location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FacilityManagerRequest.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/facility-requests/received - User gets their received requests
router.get('/received', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = { user: req.userId };
    if (status) query.status = status;

    const requests = await FacilityManagerRequest.find(query)
      .populate('admin', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FacilityManagerRequest.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/facility-requests/:id/respond - User responds to facility manager request
router.put('/:id/respond', auth, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use accept or reject.' });
    }

    const request = await FacilityManagerRequest.findById(req.params.id)
      .populate('admin', 'username email')
      .populate('user', 'username email role');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if the request is for the current user
    if (request.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been responded to' });
    }

    // Update request status
    request.status = action === 'accept' ? 'accepted' : 'rejected';
    request.respondedAt = new Date();
    await request.save();

    // If accepted, update user role
    if (action === 'accept') {
      const user = await User.findById(req.userId);
      user.role = 'facility_manager';
      await user.save();

      // Update user in localStorage would need to be handled on frontend
      res.json({
        message: 'Facility manager request accepted successfully',
        request,
        userUpdated: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.json({
        message: 'Facility manager request rejected',
        request
      });
    }
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/facility-requests/:id - Admin cancels/deletes a request
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const request = await FacilityManagerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if the request was sent by the current admin
    if (request.admin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await FacilityManagerRequest.findByIdAndDelete(req.params.id);

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/facility-requests/stats - Admin gets request statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const stats = await FacilityManagerRequest.aggregate([
      { $match: { admin: req.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await FacilityManagerRequest.countDocuments({ admin: req.userId });
    const facilityManagers = await User.countDocuments({ role: 'facility_manager' });

    res.json({
      stats,
      total,
      facilityManagers
    });
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/facility-requests/users - Admin gets list of users who can be invited
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    let query = { 
      role: { $ne: 'admin' }, // Don't include admins
      _id: { $ne: req.userId } // Don't include current admin
    };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('username email role location createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get pending request status for each user
    const userIds = users.map(u => u._id);
    const pendingRequests = await FacilityManagerRequest.find({
      user: { $in: userIds },
      status: 'pending'
    });

    const pendingUserIds = pendingRequests.map(r => r.user.toString());

    const usersWithStatus = users.map(user => ({
      ...user.toObject(),
      hasRequest: pendingUserIds.includes(user._id.toString())
    }));

    const total = await User.countDocuments(query);

    res.json({
      users: usersWithStatus,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
