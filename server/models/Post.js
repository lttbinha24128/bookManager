const { Schema, model } = require('mongoose');

module.exports = model('Post', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  content: { type: String, required: true, trim: true, maxlength: 5000 },
  image: String,
  type: { type: String, enum: ['sell', 'exchange'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'closed', 'removed'], default: 'pending' },
}, { timestamps: true }));
