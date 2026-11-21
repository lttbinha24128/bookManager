const { Schema, model } = require('mongoose');

module.exports = model('SellRequest', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  author: { type: String, required: true, trim: true, maxlength: 120 },
  volumeNumber: { 
    type: Number, 
    default: null, 
    min: 1, 
    validate: {
      validator: v => v === null || Number.isSafeInteger(v),
      message: 'Số tập phải là số nguyên dương!'
    }
  },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String, required: true },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  expectedPrice: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  decision: { type: String, default: null, select: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true }));