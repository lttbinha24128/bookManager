const { Schema, model } = require('mongoose');

module.exports = model('Comment', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  content: { type: String, required: true, trim: true, maxlength: 1500 },
  removed: { type: Boolean, default: false },
}, { timestamps: true }));
