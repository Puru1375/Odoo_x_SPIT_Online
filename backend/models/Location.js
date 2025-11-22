// models/Location.js
const mongoose = require('mongoose');
const locationSchema = new mongoose.Schema({
  name: String, // e.g., "Main Warehouse", "Vendor", "Customer"
  type: { type: String, enum: ['internal', 'vendor', 'customer', 'inventory_loss'] }
});
module.exports = mongoose.model('Location', locationSchema);