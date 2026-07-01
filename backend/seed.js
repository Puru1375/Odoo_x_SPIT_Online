const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { initDatabase } = require('./db');
const Product = require('./models/Product');
const Location = require('./models/Location');
const StockMove = require('./models/StockMove');

const seedDB = async () => {
  try {
    await initDatabase();

    // 1. Clear existing data
    await Product.deleteMany({});
    await Location.deleteMany({});
    await StockMove.deleteMany({});

    console.log("🧹 DB Cleared");

    // 2. Create Locations
    await Location.create({ name: "Generic Vendor", type: "vendor" });
    await Location.create({ name: "Main Warehouse", type: "internal" });
    await Location.create({ name: "Local Customer", type: "customer" });
    await Location.create({ name: "Production Line", type: "internal" });

    console.log("📍 Locations Created");

    // 3. Create Products (from your PDF examples)
    await Product.create({
      name: "Steel Rod",
      sku: "MAT-STEEL-001",
      category: "Raw Material",
      costPrice: 50,
      totalStock: 0, // Starts at 0
      lowStockThreshold: 20
    });

    await Product.create({
      name: "Office Chair",
      sku: "FUR-CHAIR-101",
      category: "Finished Goods",
      costPrice: 150,
      totalStock: 5, // Intentionally low to show "Low Stock" alert
      lowStockThreshold: 10
    });

    console.log("📦 Products Created");

    console.log("✅ Seeding Complete!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();