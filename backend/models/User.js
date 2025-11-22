// models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // Hashed
  role: { type: String, enum: ['Manager', 'Staff'], default: 'Staff' }
});
module.exports = mongoose.model('User', userSchema);