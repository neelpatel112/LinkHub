const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Link = require('../models/Link');

// Get public profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ 
      username: req.params.username 
    }).select('-password -email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const links = await Link.find({ 
      userId: user._id,
      isActive: true 
    }).sort('order');
    
    res.json({
      user,
      links
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 