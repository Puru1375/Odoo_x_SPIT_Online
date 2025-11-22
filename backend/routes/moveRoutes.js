const express = require('express');
const router = express.Router();
const StockMove = require('../models/StockMove');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET all moves (Filter by type via query param ?type=receipt)
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    
    // .populate() replaces IDs with actual data (e.g., Product Name instead of ID)
    const moves = await StockMove.find(filter)
      .populate('productId', 'name sku') 
      .populate('sourceLocation', 'name')
      .populate('destinationLocation', 'name')
      .sort({ createdAt: -1 }); // Newest first

    res.json(moves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Create a NEW Move (Status: Draft)
router.post('/', protect, async (req, res) => {
  // Generate a simple reference ID (e.g., WH/IN/timestamp)
  const reference = `WH/${req.body.type.toUpperCase()}/${Date.now().toString().slice(-4)}`;

  const move = new StockMove({
    reference: reference,
    productId: req.body.productId,
    sourceLocation: req.body.sourceLocation,
    destinationLocation: req.body.destinationLocation,
    quantity: req.body.quantity,
    type: req.body.type, // 'receipt', 'delivery', 'internal'
    status: 'draft', // Starts as draft
    responsible: req.user.id,
  });

  try {
    const newMove = await move.save();
    res.status(201).json(newMove);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT Validate a Move (Change Draft -> Done & Update Stock)
router.put('/:id/validate', protect, authorize('Manager'), async (req, res) => {
  try {
    const move = await StockMove.findById(req.params.id);
    if (!move) return res.status(404).json({ message: "Move not found" });
    if (move.status === 'done') return res.status(400).json({ message: "Already validated" });

    // 1. Update the Move Status
    move.status = 'done';
    await move.save();

    // 2. Update the Product Stock
    const product = await Product.findById(move.productId);

    if (move.type === 'receipt') {
      // Incoming: Add to stock
      product.totalStock += move.quantity;
    } else if (move.type === 'delivery') {
      // Outgoing: Subtract from stock
      product.totalStock -= move.quantity;
    } else if (move.type === 'adjustment') {
        // Inventory Adjustment
        if (move.destinationLocation) {
            // Increase Stock (Incoming to Internal)
            product.totalStock += move.quantity;
        } else if (move.sourceLocation) {
            // Decrease Stock (Outgoing from Internal)
            product.totalStock -= move.quantity;
        }
    }
    // Note: 'internal' moves don't change *total* stock, just location.

    await product.save();

    res.json({ message: "Move validated and stock updated", move });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT Update Status (Draft -> Ready -> Done)
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body;
  const move = await StockMove.findById(req.params.id);
  
  if (status === 'done' && move.status !== 'done') {
     const Product = require('../models/Product');
     const product = await Product.findById(move.productId);

     // LOGIC FOR DELIVERY: Decrease Stock
     if (move.type === 'delivery') {
       if (product.totalStock < move.quantity) {
         return res.status(400).json({ message: "Not enough stock to validate!" });
       }
       product.totalStock -= move.quantity;
     } 
     // LOGIC FOR RECEIPT: Increase Stock
     else if (move.type === 'receipt') {
       product.totalStock += move.quantity;
     }
     
     await product.save();
  }

  move.status = status;
  await move.save();
  res.json(move);
});

module.exports = router;
