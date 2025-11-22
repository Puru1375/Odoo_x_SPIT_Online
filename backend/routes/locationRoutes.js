const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// GET all locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new location (e.g., "Warehouse A", "Vendor")
router.post('/', async (req, res) => {
  const location = new Location({
    name: req.body.name,
    type: req.body.type // 'internal', 'vendor', 'customer'
  });

  try {
    const newLocation = await location.save();
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;