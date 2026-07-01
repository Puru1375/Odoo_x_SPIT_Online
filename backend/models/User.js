const { BaseModel } = require('./baseModel');

class User extends BaseModel {
  static get tableName() {
    return 'users';
  }

  static get columnMap() {
    return {
      _id: 'id',
      isVerified: 'is_verified',
      otpExpires: 'otp_expires',
    };
  }
}

module.exports = User;