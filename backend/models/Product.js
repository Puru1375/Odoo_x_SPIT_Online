// models/Product.js
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: String,
  sku: { type: String, unique: true },
  category: String,
  costPrice: Number,
  totalStock: { type: Number, default: 0 }, // Denormalized total for speed
  lowStockThreshold: { type: Number, default: 10 }
});
module.exports = mongoose.model('Product', productSchema);