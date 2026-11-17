const Book = require('../models/Book');
const Category = require('../models/Category');
const SellRequest = require('../models/SellRequest');
const { withImage } = require('../middleware/upload');

const fail = (status, message) => Object.assign(new Error(message), { status });
const bookMatch = { locale: 'vi', strength: 2 };
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function listBooks(req, res) {
  const filter = { status: 'available' };
  const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  if (search) filter.$or = ['title', 'author'].map(field => ({ [field]: new RegExp(escapeRegex(search), 'i') }));
  if (req.query.category) filter.category = req.query.category;
  if (req.query.kind === 'free') filter.dailyRate = 0;
  if (req.query.kind === 'paid') filter.dailyRate = { $gt: 0 };
  res.json(await Book.find(filter).populate('category').sort({ createdAt: -1 }));
}

async function getBook(req, res) {
  const book = await Book.findOne({ _id: req.params.id, status: 'available' }).populate('category');
  if (!book) throw fail(404, 'Không tìm thấy sách.');
  res.json(book);
}

async function listCategories(req, res) {
  res.json(await Category.find().sort({ name: 1 }));
}

async function addCategory(req, res) {
  res.status(201).json(await Category.create({ name: req.body.name }));
}

async function updateCategory(req, res) {
  const { name } = req.body;
  if (!name || !name.trim()) throw fail(400, 'Tên thể loại không được để trống.');
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id, 
      { name: name.trim() }, 
      { returnDocument: 'after' }
    );
    if (!category) throw fail(404, 'Không tìm thấy thể loại.');
    res.json(category);
  } catch (error) {
    if (error.code === 11000) throw fail(409, 'Tên thể loại này đã tồn tại.');
    throw error;
  }
}

async function deleteCategory(req, res) {
  const bookCount = await Book.countDocuments({ category: req.params.id });
  if (bookCount > 0) {
    throw fail(400, `Không thể xóa! Đang có ${bookCount} cuốn sách thuộc thể loại này.`);
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw fail(404, 'Không tìm thấy thể loại.');
  res.json({ message: 'Đã xóa thể loại thành công.' });
}

async function categoryExists(id) {
  if (!id || !await Category.exists({ _id: id })) throw fail(400, 'Hãy chọn thể loại hợp lệ.');
}

async function saveBook(req, res) {
  const { title, author, category, volumeNumber, dailyRate, description } = req.body;
  if (!title || !title.trim()) throw fail(400, 'Tên sách không được để trống.');
  if (!author || !author.trim()) throw fail(400, 'Tên tác giả không được để trống.');
  
  const rate = Number(dailyRate);
  if (isNaN(rate) || rate < 0) throw fail(400, 'Giá thuê không hợp lệ. Có thể nhập 0 nếu miễn phí.');
  
  if (req.body.quantity !== undefined && req.body.quantity !== '') {
    const qty = Number(req.body.quantity);
    if (isNaN(qty) || qty < 0 || !Number.isInteger(qty)) throw fail(400, 'Số lượng tồn kho phải là số nguyên không âm.');
  }
  await categoryExists(category);
  const book = req.params.id ? await Book.findById(req.params.id).select('+stockOperations') : new Book();
  if (!book) throw fail(404, 'Không tìm thấy sách.');
  const fields = { title, author, category, volumeNumber: volumeNumber || null, dailyRate, description };
  // Chỉ sửa số lượng khi thủ thư nhập tồn mới. Phiếu mượn tự cập nhật tồn.
  if (req.body.quantity !== undefined && req.body.quantity !== '') fields.quantity = req.body.quantity;
  await withImage(req.file, async image => {
    book.set(fields);
    if (image) book.image = image;
    await book.save();
  });
  res.status(req.params.id ? 200 : 201).json(book);
}

async function setVisibility(req, res) {
  if (!['available', 'hidden'].includes(req.body.status)) throw fail(400, 'Trạng thái sách không hợp lệ.');
  const book = await Book.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: 'after' });
  if (!book) throw fail(404, 'Không tìm thấy sách.');
  res.json(book);
}

async function submitSale(req, res) {
  const { title, author, category, volumeNumber, description, expectedPrice } = req.body;
  if (!title || !title.trim()) throw fail(400, 'Tên sách không được để trống.');
  if (!author || !author.trim()) throw fail(400, 'Tên tác giả không được để trống.');
  if (!description || !description.trim()) throw fail(400, 'Vui lòng nhập tình trạng sách.');

  const price = Number(expectedPrice);
  if (isNaN(price) || price < 0) throw fail(400, 'Giá mong muốn không hợp lệ. Hãy nhập số (có thể nhập 0 nếu muốn tặng).');
  await categoryExists(category);
  const sale = await withImage(req.file, image => SellRequest.create({
    user: req.user._id, title, author, category, volumeNumber: volumeNumber || null, description, expectedPrice, image,
  }));
  res.status(201).json(sale);
}

async function decideSale(req, res) {
  const { action } = req.body;
  if (!['approve', 'reject'].includes(action)) throw fail(400, 'Thao tác không hợp lệ.');
  const sale = await SellRequest.findOneAndUpdate(
    { _id: req.params.id, status: 'pending', $or: [{ decision: null }, { decision: action }] },
    { decision: action }, { returnDocument: 'after' },
  );
  if (!sale) throw fail(409, 'Yêu cầu đã được xử lý.');
  if (action === 'approve') {
    const { title, author, volumeNumber, category, image, description } = sale;
    const key = { title, author, volumeNumber };
    const options = { collation: bookMatch };
    const operation = 'sale:' + sale.id;
    // Index duy nhất bảo đảm cùng tên, tác giả và số tập chỉ có một đầu sách.
    try {
      await Book.updateOne(key, {
        $setOnInsert: { ...key, category, image, description, quantity: 0 },
      }, { ...options, upsert: true });
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
    await Book.updateOne({ ...key, stockOperations: { $ne: operation } }, {
      $inc: { quantity: 1 }, $addToSet: { stockOperations: operation },
    }, options);
  }
  const saved = await SellRequest.findByIdAndUpdate(sale.id, {
    status: action === 'approve' ? 'approved' : 'rejected', decision: null,
  }, { returnDocument: 'after' });
  res.json(saved);
}

module.exports = { listBooks, getBook, listCategories, addCategory, saveBook, setVisibility, submitSale, decideSale, updateCategory, deleteCategory, fail };

