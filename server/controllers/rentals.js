const Rental = require('../models/Rental');
const Book = require('../models/Book');
const { fail } = require('./catalog');

const dayMs = 86400000;

function vietnamToday() {
  return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
}

async function requestRental(req, res) {
  const { book: bookId, dueDate } = req.body;
  const book = await Book.findOne({ _id: bookId, status: 'available', quantity: { $gt: 0 } });
  if (!book) throw fail(409, 'Sách hiện không còn để mượn.');
  const date = typeof dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? new Date(dueDate) : new Date(NaN);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dueDate) throw fail(400, 'Ngày trả không hợp lệ.');
  const rentalDays = (date - new Date(vietnamToday())) / dayMs;
  if (rentalDays < 1) throw fail(400, 'Ngày trả phải sau hôm nay.');
  const totalFee = rentalDays * book.dailyRate;
  if (!Number.isSafeInteger(totalFee)) throw fail(400, 'Tổng phí vượt giới hạn.');
  // Tính phí từ ngày đăng ký và lưu mức giá hiện tại. Hạn trả hết ngày theo giờ Việt Nam.
  const endOfDay = new Date(dueDate + 'T23:59:59.999+07:00');
  res.status(201).json(await Rental.create({
    user: req.user._id, book: book._id, dueDate: endOfDay, dailyRate: book.dailyRate, rentalDays, totalFee,
  }));
}

async function changeRental(req, res) {
  const action = req.body.action;
  if (!['lend', 'return', 'cancel'].includes(action)) throw fail(400, 'Thao tác không hợp lệ.');
  const previous = action === 'return' ? 'active' : 'pending';
  const rental = await Rental.findOneAndUpdate(
    { _id: req.params.id, status: previous, $or: [{ operation: null }, { operation: action }] },
    { operation: action }, { returnDocument: 'after' },
  );
  if (!rental) throw fail(409, 'Phiếu không còn ở trạng thái phù hợp.');
  const next = {};
  if (action === 'cancel') next.status = 'cancelled';
  if (action !== 'cancel') {
    const operation = action + ':' + rental.id;
    const lending = action === 'lend';
    // Ghi dấu cùng lúc với thay đổi tồn kho để thử lại không làm cộng/trừ hai lần.
    const filter = { _id: rental.book, stockOperations: { $ne: operation } };
    if (lending) Object.assign(filter, { quantity: { $gt: 0 }, status: 'available' });
    const result = await Book.updateOne(filter, {
      $inc: { quantity: lending ? -1 : 1 }, $addToSet: { stockOperations: operation },
    });
    if (!result.modifiedCount && !await Book.exists({ _id: rental.book, stockOperations: operation })) {
      await Rental.updateOne({ _id: rental.id, status: previous, operation: action }, { operation: null });
      throw fail(409, 'Không thể cập nhật tồn kho. Hãy kiểm tra đầu sách.');
    }
    next.status = lending ? 'active' : 'completed';
    next[lending ? 'borrowedAt' : 'returnedAt'] = new Date();
  }
  const updated = await Rental.findOneAndUpdate(
    { _id: rental.id, status: previous, operation: action }, { ...next, operation: null }, { returnDocument: 'after' },
  );
  res.json(updated || await Rental.findById(rental.id));
}

module.exports = { requestRental, changeRental };

