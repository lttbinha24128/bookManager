const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const User = require('./models/User');
const Category = require('./models/Category');
const Book = require('./models/Book');
const Post = require('./models/Post');
const Rental = require('./models/Rental');
const { hashPassword } = require('./controllers/auth');

async function seed() {
  console.log('⏳ Đang kết nối Database...');
  await connectDatabase();
  await Promise.all([User.init(), Category.init(), Book.init(), Post.init(), Rental.init()]);

  // 1. TẠO TÀI KHOẢN MẪU
  console.log('👤 Đang tạo tài khoản...');
  const accounts = [
    { username: 'thuthu', email: 'thuthu@example.test', fullName: 'Thủ thư', role: 'admin', password: 'DemoAdmin123' },
    { username: 'bandoc', email: 'bandoc@example.test', fullName: 'Bạn đọc', role: 'user', password: 'DemoUser123' },
    { username: 'user2', email: 'user2@example.test', fullName: 'Nguyễn Văn A', role: 'user', password: 'DemoUser123' },
  ];
  
  for (const { password, ...account } of accounts) {
    await User.updateOne({ username: account.username }, {
      $setOnInsert: { ...account, passwordHash: await hashPassword(password) },
    }, { upsert: true });
  }

  const reader = await User.findOne({ username: 'bandoc' });
  const reader2 = await User.findOne({ username: 'user2' });

  // 2. DỮ LIỆU SÁCH (Đã sửa tên file khớp 100% với thư mục uploads)
  console.log('📚 Đang tạo dữ liệu Sách...');
  const booksData = [
    ['Dế Mèn phiêu lưu ký', 'Tô Hoài', 'Văn học', 0, 4, '...', 'DeMenPhieuLuuKy.webp'],
    ['Tôi thấy hoa vàng trên cỏ xanh', 'Nguyễn Nhật Ánh', 'Văn học', 5000, 3, '...', 'Tôi thấy hoa vàng trên cỏ xanh.webp'],
    ['Đất rừng phương Nam', 'Đoàn Giỏi', 'Văn học', 0, 2, '...', 'Đất rừng phương Nam.webp'],  
    ['Sapiens: Lược sử loài người', 'Yuval Noah Harari', 'Lịch sử', 15000, 3, '...', 'SapiensLược sử loài người.webp'],
    ['Đắc Nhân Tâm', 'Dale Carnegie', 'Kỹ năng', 8000, 6, '...', 'Đắc Nhân Tâm.webp'],
    ['Tuổi trẻ đáng giá bao nhiêu', 'Rosie Nguyễn', 'Kỹ năng', 5000, 5, '...', 'Tuổi trẻ đáng giá bao nhiêu.webp'],
    ['Vĩ đại do lựa chọn', 'Jim Collins', 'Kinh tế', 15000, 1, '...', 'Vĩ đại do lựa chọn.webp'],
    ['Cha giàu cha nghèo', 'Robert Kiyosaki', 'Kinh tế', 10000, 4, '...', 'Cha giàu cha nghèo.webp'],
    ['Đừng bao giờ đi ăn một mình', 'Keith Ferrazzi', 'Kỹ năng', 12000, 2, '...', 'Đừng bao giờ đi ăn một mình.webp'],
    ['Lược sử thời gian', 'Stephen Hawking', 'Khoa học', 9000, 3, '...', 'Lược sử thời gian.webp'],
    ['Bàn về tự do', 'John Stuart Mill', 'Chính trị', 0, 1, '...', 'Bàn về tự do.webp'],
    ['Homo Deus: Lược sử tương lai', 'Yuval Noah Harari', 'Lịch sử', 12000, 2, '...', 'Homo Deus Lược sử tương lai.webp'],
    ['Kinh tế học hài hước', 'Steven D. Levitt', 'Kinh tế', 12000, 1, '...', 'Kinh tế học hài hước.webp'],
    ['Vũ trụ', 'Carl Sagan', 'Khoa học', 7000, 2, '...', 'Vu Tru.webp'],
    ['Nhà giả kim', 'Paulo Coelho', 'Văn học', 10000, 2, '...', 'Nhà giả kim.webp'],
    ['Số đỏ', 'Vũ Trọng Phụng', 'Văn học', 3000, 5, '...', 'Sodo.webp'],
  ];

  for (const [title, author, name, dailyRate, quantity, description, image] of booksData) {
    const category = await Category.findOneAndUpdate({ name }, { $setOnInsert: { name } }, { upsert: true, returnDocument: 'after' });
    const key = { title, author, volumeNumber: null };
    
    await Book.updateOne(key, { 
      $set: { ...key, category: category.id, dailyRate, quantity, description, image } 
    }, { upsert: true, collation: { locale: 'vi', strength: 2 } });
  }

  // 3. BÀI ĐĂNG DIỄN ĐÀN
  console.log('💬 Đang tạo dữ liệu Diễn đàn...');
  const postsData = [
    { title: 'Trao đổi Dế Mèn phiêu lưu ký', user: reader.id, type: 'exchange', status: 'approved', content: '...', image: null },
    { title: 'Review sách Sapiens: Lược sử loài người', user: reader2.id, type: 'exchange', status: 'approved', content: '...', image: null },
    { title: 'Pass lại sách Kinh tế học hài hước', user: reader.id, type: 'sell', status: 'approved', content: '...', image: null },
    { title: 'Cần thuê sách ôn thi Đại học', user: reader2.id, type: 'rent', status: 'pending', content: '...', image: null }
  ];
  for (const postData of postsData) {
    const exists = await Post.findOne({ title: postData.title, user: postData.user });
    if (!exists) await Post.create(postData);
    else await Post.updateOne({ _id: exists._id }, { $set: { image: postData.image } });
  }

  // 4. PHIẾU MƯỢN/THUÊ
  console.log('📝 Đang tạo dữ liệu Phiếu mượn/thuê...');
  await Rental.deleteMany({});
  const book1 = await Book.findOne({ title: 'Dế Mèn phiêu lưu ký' });
  const book2 = await Book.findOne({ title: 'Sapiens: Lược sử loài người' });
  const book3 = await Book.findOne({ title: 'Nhà giả kim' });
  const book4 = await Book.findOne({ title: 'Cha giàu cha nghèo' });

  const rentalsData = [
    { user: reader.id, book: book1.id, status: 'active', dueDate: new Date(Date.now() + 7*864e5), dailyRate: book1.dailyRate||0, rentalDays: 7, totalFee: (book1.dailyRate||0)*7 },
    { user: reader2.id, book: book2.id, status: 'active', dueDate: new Date(Date.now() + 3*864e5), dailyRate: book2.dailyRate||0, rentalDays: 3, totalFee: (book2.dailyRate||0)*3 },
    { user: reader.id, book: book3.id, status: 'completed', dueDate: new Date(Date.now() - 2*864e5), returnedAt: new Date(), dailyRate: book3.dailyRate||0, rentalDays: 5, totalFee: (book3.dailyRate||0)*5 },
    { user: reader2.id, book: book4.id, status: 'active', dueDate: new Date(Date.now() - 5*864e5), dailyRate: book4.dailyRate||0, rentalDays: 10, totalFee: (book4.dailyRate||0)*10 }
  ];
  for (const rental of rentalsData) await Rental.create(rental);

  console.log('✅ Đã nạp dữ liệu demo thành công!');
}

seed().catch(error => { console.error('❌ Lỗi:', error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());