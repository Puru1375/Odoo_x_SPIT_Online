const { BaseModel } = require('./baseModel');

class Location extends BaseModel {
  static get tableName() {
    return 'locations';
  }

  static get columnMap() {
    return {
      _id: 'id',
    };
  }
}

module.exports = Location;