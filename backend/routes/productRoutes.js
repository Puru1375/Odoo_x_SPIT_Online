const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new product
router.post('/', async (req, res) => {
  const product = new Product({
    name: req.body.name,
    sku: req.body.sku,
    category: req.body.category,
    costPrice: req.body.costPrice,
    totalStock: req.body.initialStock || 0, // Optional initial stock
    lowStockThreshold: req.body.lowStockThreshold || 10
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;