const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  volumeNumber: { type: Number, default: null, min: 1, validate: Number.isSafeInteger },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  stockOperations: { type: [String], select: false },
  description: { type: String, trim: true, maxlength: 3000 },
  image: { type: String, trim: true },
  quantity: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  dailyRate: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  status: { type: String, enum: ['available', 'hidden'], default: 'available' },
}, { timestamps: true });

bookSchema.index({ title: 1, author: 1, volumeNumber: 1 }, {
  unique: true,
  collation: { locale: 'vi', strength: 2 },
});

module.exports = model('Book', bookSchema);

