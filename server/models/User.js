const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  username: { type: String, required: true, trim: true, lowercase: true, unique: true },
  email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
  passwordHash: { type: String, required: true, select: false },
  fullName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'locked'], default: 'active' },
}, { timestamps: true });

module.exports = model('User', userSchema);

