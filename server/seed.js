const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const User = require('./models/User');
const Category = require('./models/Category');
const Book = require('./models/Book');
const Post = require('./models/Post');
const { hashPassword } = require('./controllers/auth');

async function seed() {
  await connectDatabase();
  await Promise.all([User.init(), Category.init(), Book.init(), Post.init()]);
  const accounts = [
    { username: 'thuthu', email: 'thuthu@example.test', fullName: 'Thủ thư', role: 'admin', password: 'DemoAdmin123' },
    { username: 'bandoc', email: 'bandoc@example.test', fullName: 'Bạn đọc', role: 'user', password: 'DemoUser123' },
  ];
  for (const { password, ...account } of accounts) {
    await User.updateOne({ username: account.username }, {
      $setOnInsert: { ...account, passwordHash: await hashPassword(password) },
    }, { upsert: true });
  }

  const data = [
    ['Dế Mèn phiêu lưu ký', 'Tô Hoài', 'Văn học', 0, 4, 'Cuộc phiêu lưu của Dế Mèn qua nhiều vùng đất và những tình bạn mới.'],
    ['Tôi thấy hoa vàng trên cỏ xanh', 'Nguyễn Nhật Ánh', 'Văn học', 5000, 3, 'Câu chuyện tuổi thơ ở một làng quê Việt Nam.'],
    ['Đất rừng phương Nam', 'Đoàn Giỏi', 'Văn học', 0, 2, 'Hành trình của An qua vùng sông nước Nam Bộ.'],
    ['Vũ trụ', 'Carl Sagan', 'Khoa học', 7000, 2, 'Một chuyến khám phá các vì sao, hành tinh và lịch sử khoa học.'],
  ];
  for (const [title, author, name, dailyRate, quantity, description] of data) {
    const category = await Category.findOneAndUpdate({ name }, { $setOnInsert: { name } }, { upsert: true, returnDocument: 'after' });
    const key = { title, author, volumeNumber: null };
    // Chạy lại seed giữ nguyên tài khoản, giá và số lượng tồn đã chỉnh.
    await Book.updateOne(key, { $setOnInsert: { ...key, category: category.id, dailyRate, quantity, description } },
      { upsert: true, collation: { locale: 'vi', strength: 2 } });
  }

  const reader = await User.findOne({ username: 'bandoc' });
  const title = 'Trao đổi Dế Mèn phiêu lưu ký';
  if (!await Post.exists({ title, user: reader.id })) {
    await Post.create({ title, user: reader.id, type: 'exchange', status: 'approved', content: 'Mình có một cuốn còn mới và muốn trao đổi với bạn nào có truyện thiếu nhi.' });
  }
  console.log('Đã nạp dữ liệu demo.');
}

seed().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());

