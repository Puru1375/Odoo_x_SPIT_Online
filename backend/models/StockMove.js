const { BaseModel } = require('./baseModel');

class StockMove extends BaseModel {
  static get tableName() {
    return 'stock_moves';
  }

  static get fieldTransforms() {
    return {
      quantity: Number,
    };
  }

  static get columnMap() {
    return {
      _id: 'id',
      productId: 'product_id',
      sourceLocation: 'source_location_id',
      destinationLocation: 'destination_location_id',
      scheduledDate: 'scheduled_date',
      responsible: 'responsible_id',
      createdAt: 'created_at',
    };
  }

  static get relationMap() {
    return {
      productId: { model: require('./Product') },
      sourceLocation: { model: require('./Location') },
      destinationLocation: { model: require('./Location') },
      responsible: { model: require('./User') },
    };
  }
}

module.exports = StockMove;