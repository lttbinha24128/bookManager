const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  volumeNumber: { 
    type: Number, 
    default: null, 
    min: 1, 
    // Sửa lại validate để cho phép null (khi không nhập số tập)
    validate: {
      validator: v => v === null || Number.isSafeInteger(v),
      message: 'Số tập phải là số nguyên dương!'
    }
  },
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