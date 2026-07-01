const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockMove = require('../models/StockMove');
const { rateLimit } = require('../middleware/authMiddleware');

router.get('/stats', rateLimit, async (req, res) => {
  try {
    // 1. Total Products count
    const totalProducts = await Product.countDocuments();

    // 2. Low Stock Items (Where stock < threshold)
    const allProducts = await Product.find();
    const lowStockCount = allProducts.filter((product) => Number(product.totalStock) < Number(product.lowStockThreshold)).length;

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