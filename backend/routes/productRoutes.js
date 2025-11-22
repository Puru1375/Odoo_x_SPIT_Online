const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockMove = require('../models/StockMove');
const Location = require('../models/Location');

// GET All
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// POST Create (Handles Initial Stock)
router.post('/', async (req, res) => {
  const { name, sku, category, uom, costPrice, lowStockThreshold, initialStock } = req.body;

  try {
    // 1. Create Product
    const product = new Product({
      name, sku, category, uom, costPrice, 
      lowStockThreshold, 
      totalStock: initialStock || 0
    });
    const savedProduct = await product.save();

    // 2. If Initial Stock provided, create an Adjustment Log
    if (initialStock && initialStock > 0) {
      // Find a default internal location
      const mainLoc = await Location.findOne({ type: 'internal' });
      
      if (mainLoc) {
        await StockMove.create({
          reference: 'INV/STARTUP',
          productId: savedProduct._id,
          destinationLocation: mainLoc._id, // Put stock here
          quantity: parseInt(initialStock),
          type: 'adjustment',
          status: 'done'
        });
      }
    }

    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT Update Product
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
});

// GET Stock Availability Per Location (Complex Logic)
router.get('/:id/stock-by-location', async (req, res) => {
  try {
    const productId = req.params.id;

    // Fetch all "Done" moves for this product
    const moves = await StockMove.find({ 
      productId, 
      status: 'done' 
    });

    // Calculate stock per location
    const locationStock = {};

    moves.forEach(move => {
      // Incoming to a location
      if (move.destinationLocation) {
        const destId = move.destinationLocation.toString();
        locationStock[destId] = (locationStock[destId] || 0) + move.quantity;
      }
      // Outgoing from a location
      if (move.sourceLocation) {
        const sourceId = move.sourceLocation.toString();
        locationStock[sourceId] = (locationStock[sourceId] || 0) - move.quantity;
      }
    });

    // We need to replace Location IDs with Names. 
    // In a real app, we use aggregation, but for Hackathon, we fetch locations map:
    const locations = await Location.find();
    const result = [];

    locations.forEach(loc => {
      if (loc.type === 'internal') { // Only care about internal stock
        result.push({
          name: loc.name,
          quantity: locationStock[loc._id.toString()] || 0
        });
      }
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;