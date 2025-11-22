const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockMove = require('../models/StockMove');

router.get('/stats', async (req, res) => {
  try {
    // 1. Total Products count
    const totalProducts = await Product.countDocuments();

    // 2. Low Stock Items (Where stock < threshold)
    // Using $expr to compare two fields in the same document
    const lowStockCount = await Product.countDocuments({
      $expr: { $lt: ["$totalStock", "$lowStockThreshold"] }
    });

    // 3. Pending Operations
    const pendingReceipts = await StockMove.countDocuments({ type: 'receipt', status: 'draft' });
    const pendingDeliveries = await StockMove.countDocuments({ type: 'delivery', status: 'draft' });

    res.json({
      totalProducts,
      lowStockCount,
      pendingReceipts,
      pendingDeliveries
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;