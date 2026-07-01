const { BaseModel } = require('./baseModel');

class Product extends BaseModel {
  static get tableName() {
    return 'products';
  }

  static get fieldTransforms() {
    return {
      costPrice: Number,
      totalStock: Number,
      lowStockThreshold: Number,
    };
  }

  static get columnMap() {
    return {
      _id: 'id',
      costPrice: 'cost_price',
      totalStock: 'total_stock',
      lowStockThreshold: 'low_stock_threshold',
    };
  }
}

module.exports = Product;