const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Link = require('../models/Link');

// Get all links for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const links = await Link.find({ userId: req.userId }).sort('order');
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new link
router.post('/', auth, async (req, res) => {
  try {
    const { title, url, icon } = req.body;
    
    // Get count for ordering
    const count = await Link.countDocuments({ userId: req.userId });
    
    const link = new Link({
      userId: req.userId,
      title,
      url,
      icon,
      order: count
    });
    
    await link.save();
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update link
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, url, icon, isActive, order } = req.body;
    
    const link = await Link.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, url, icon, isActive, order },
      { new: true }
    );
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete link
router.delete('/:id', auth, async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update links order (bulk update)
router.post('/reorder', auth, async (req, res) => {
  try {
    const { links } = req.body;
    
    const updatePromises = links.map((link, index) => 
      Link.findOneAndUpdate(
        { _id: link.id, userId: req.userId },
        { order: index }
      )
    );
    
    await Promise.all(updatePromises);
    res.json({ message: 'Links reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Track link click
router.post('/:id/click', async (req, res) => {
  try {
    await Link.findByIdAndUpdate(req.params.id, {
      $inc: { clicks: 1 }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 