// models/StockMove.js
const mongoose = require('mongoose');
const stockMoveSchema = new mongoose.Schema({
  reference: String, // e.g., WH/IN/0001
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  sourceLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  destinationLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  quantity: Number,
  type: { type: String, enum: ['receipt', 'delivery', 'internal', 'adjustment'] },
  status: { type: String, enum: ['draft', 'validated', 'done', 'cancelled'], default: 'draft' },
  scheduledDate: Date,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('StockMove', stockMoveSchema);