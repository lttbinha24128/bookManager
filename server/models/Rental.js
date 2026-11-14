const { Schema, model } = require('mongoose');

const rentalSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  dueDate: { type: Date, required: true },
  borrowedAt: { type: Date, default: null },
  returnedAt: { type: Date, default: null },
  dailyRate: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  rentalDays: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  totalFee: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  operation: { type: String, default: null, select: false },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true, toJSON: { virtuals: true } });

rentalSchema.virtual('isOverdue').get(function () {
  return this.status === 'active' && this.dueDate < new Date();
});

module.exports = model('Rental', rentalSchema);

