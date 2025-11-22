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

// GET Stock Availability Per Location
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

    // Fetch all locations and include locationId in response
    const locations = await Location.find();
    const result = [];

    locations.forEach(loc => {
      if (loc.type === 'internal') { // Only care about internal stock
        result.push({
          locationId: loc._id.toString(),
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

// POST Recalculate Stock for All Products (Fix Data Integrity)
router.post('/recalculate-stock', async (req, res) => {
  try {
    const products = await Product.find();
    let updatedCount = 0;

    for (const product of products) {
      // Fetch all "Done" moves for this product
      const moves = await StockMove.find({ 
        productId: product._id, 
        status: 'done' 
      });

      let calculatedStock = 0;

      moves.forEach(move => {
        // If it has a destination (Incoming/Internal Transfer In)
        if (move.destinationLocation) {
           // We only care if it entered an INTERNAL location? 
           // Actually, we should check if destination is internal.
           // But for simplicity in this system, let's assume:
           // If destination is set, it's added to that location.
           // If source is set, it's removed from that location.
           // Total Stock = Sum of all Internal Locations.
           // But we don't want to fetch locations for every move.
           
           // Simplified Logic:
           // Receipt (Vendor -> Internal): Increases Stock
           // Delivery (Internal -> Customer): Decreases Stock
           // Adjustment: 
           //   - If Dest is Internal: Increase
           //   - If Source is Internal: Decrease
           // Internal Transfer: No change to Total Stock (Source Internal -> Dest Internal)
           
           // However, to be 100% accurate, we should sum based on Location Type.
           // But we don't have populated locations here easily.
           
           // Let's use the Move Type logic which is faster:
           if (move.type === 'receipt') {
             calculatedStock += move.quantity;
           } else if (move.type === 'adjustment' && move.destinationLocation) {
             calculatedStock += move.quantity;
           }
        }

        if (move.sourceLocation) {
          if (move.type === 'delivery') {
            calculatedStock -= move.quantity;
          } else if (move.type === 'adjustment' && move.sourceLocation) {
            calculatedStock -= move.quantity;
          }
        }
      });

      // Update if different
      if (product.totalStock !== calculatedStock) {
        product.totalStock = calculatedStock;
        await product.save();
        updatedCount++;
      }
    }

    res.json({ message: `Recalculation complete. Updated ${updatedCount} products.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;