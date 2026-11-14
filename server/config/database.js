const mongoose = require('mongoose');

module.exports = function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('Thiếu MONGODB_URI trong .env');
  return mongoose.connect(process.env.MONGODB_URI);
};
