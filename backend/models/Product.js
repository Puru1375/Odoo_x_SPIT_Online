const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, default: 'Uncategorized' },
  uom: { type: String, default: 'Units' }, // Unit of Measure (e.g., kg, pcs, m)
  costPrice: { type: Number, default: 0 },
  totalStock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 } // Reordering Rule
});

module.exports = mongoose.model('Product', productSchema);