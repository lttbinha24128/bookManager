const { Schema, model } = require('mongoose');

module.exports = model('Session', new Schema({
  digest: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
}));
