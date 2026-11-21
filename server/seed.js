const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const User = require('./models/User');
const Category = require('./models/Category');
const Book = require('./models/Book');
const Post = require('./models/Post');
const Rental = require('./models/Rental'); // Import model Rental
const { hashPassword } = require('./controllers/auth');

async function seed() {
  console.log('⏳ Đang kết nối Database...');
  await connectDatabase();
  // Khởi tạo index cho tất cả model
  await Promise.all([User.init(), Category.init(), Book.init(), Post.init(), Rental.init()]);

  // ==========================================
  // 1. TẠO TÀI KHOẢN MẪU
  // ==========================================
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

  // Lấy thông tin user để dùng cho các phần sau
  const reader = await User.findOne({ username: 'bandoc' });
  const reader2 = await User.findOne({ username: 'user2' });

  // ==========================================
  // 2. DỮ LIỆU SÁCH
  // ==========================================
  console.log('📚 Đang tạo dữ liệu Sách...');
  const booksData = [
    ['Dế Mèn phiêu lưu ký', 'Tô Hoài', 'Văn học', 0, 4, 'Cuộc phiêu lưu của Dế Mèn qua nhiều vùng đất và những tình bạn mới.', '2c6ebc46-2311-47c0-ab93-bfcb0b05ce88.jpg'],
    ['Tôi thấy hoa vàng trên cỏ xanh', 'Nguyễn Nhật Ánh', 'Văn học', 5000, 3, 'Câu chuyện tuổi thơ ở một làng quê Việt Nam.', '2c71b903-8b9a-41f9-a4e1-bb5fc26b17bb.jpg'],
    ['Đất rừng phương Nam', 'Đoàn Giỏi', 'Văn học', 0, 2, 'Hành trình của An qua vùng sông nước Nam Bộ.', null],  
    ['Sapiens: Lược sử loài người', 'Yuval Noah Harari', 'Lịch sử', 15000, 3, 'Hành trình phát triển của loài người từ thời tiền sử.', null],
    ['Đắc Nhân Tâm', 'Dale Carnegie', 'Kỹ năng', 8000, 6, 'Nghệ thuật giao tiếp và thu phục lòng người.', '9a706bc2-1703-408b-858e-ed83dc0431bd.jpg'],
    ['Tuổi trẻ đáng giá bao nhiêu', 'Rosie Nguyễn', 'Kỹ năng', 5000, 5, 'Sách truyền cảm hứng cho giới trẻ.', '56d1eeca-f944-42df-830c-d865f20a7cee.jpg'],
    ['Vĩ đại do lựa chọn', 'Jim Collins', 'Kinh tế', 15000, 1, 'Những bài học về sự vĩ đại trong kinh doanh.', '058a8a3a-b1b2-439c-822a-df4618f55bbe.jpg'],
    ['Cha giàu cha nghèo', 'Robert Kiyosaki', 'Kinh tế', 10000, 4, 'Những bài học về tư duy tài chính cá nhân.', '143a41e5-26c4-44ea-b81d-282c9bd119c0.webp'],
    ['Đừng bao giờ đi ăn một mình', 'Keith Ferrazzi', 'Kỹ năng', 12000, 2, 'Nghệ thuật xây dựng mối quan hệ.', null],
    ['Lược sử thời gian', 'Stephen Hawking', 'Khoa học', 9000, 3, 'Từ vụ nổ Big Bang đến lỗ đen.', null],
    ['Bàn về tự do', 'John Stuart Mill', 'Chính trị', 0, 1, 'Tác phẩm kinh điển về triết lý tự do cá nhân.', '34065851-99ba-42e9-ad5f-7a2a776ea789.jpg'],
    ['Homo Deus: Lược sử tương lai', 'Yuval Noah Harari', 'Lịch sử', 12000, 2, 'Dự đoán về tương lai của loài người.', 'bd6562cd-f75a-4445-8c69-7c8d07fed0f9.webp'],
    ['Kinh tế học hài hước', 'Steven D. Levitt', 'Kinh tế', 12000, 1, 'Những góc nhìn thú vị về kinh tế qua các hiện tượng đời thường.', null],
    ['Vũ trụ', 'Carl Sagan', 'Khoa học', 7000, 2, 'Một chuyến khám phá các vì sao, hành tinh và lịch sử khoa học.', 'e369437e-8ac5-4ec8-8717-0747b95c201c.jpg'],
    ['Nhà giả kim', 'Paulo Coelho', 'Văn học', 10000, 2, 'Hành trình theo đuổi giấc mơ của cậu bé chăn cừu Santiago.', 'e30210b9-5faf-445f-b91e-a67fd311f7cc.jpg'],
    ['Số đỏ', 'Vũ Trọng Phụng', 'Văn học', 3000, 5, 'Bức tranh trào phúng về xã hội Việt Nam thời Pháp thuộc.', 'c9b9278c-2a46-4831-8a9a-390d3fb3abe0.jpg'],
    ['Gen: Lịch sử vạn vật', 'Siddhartha Mukherjee', 'Khoa học', 11000, 2, 'Khám phá về gen và di truyền học.', '954f5108-fcf0-4e99-8798-bd697e1e3376.jpg'],
    ['Nhà đầu tư thông minh', 'Benjamin Graham', 'Kinh tế', 14000, 1, 'Kinh thánh về đầu tư giá trị.', null],
  ];

  for (const [title, author, name, dailyRate, quantity, description, image] of booksData) {
    const category = await Category.findOneAndUpdate({ name }, { $setOnInsert: { name } }, { upsert: true, returnDocument: 'after' });
    const key = { title, author, volumeNumber: null };
    
    await Book.updateOne(key, { 
      $set: { ...key, category: category.id, dailyRate, quantity, description, image } 
    }, { upsert: true, collation: { locale: 'vi', strength: 2 } });
  }

  // ==========================================
  // 3. DỮ LIỆU BÀI ĐĂNG DIỄN ĐÀN
  // ==========================================
  console.log('💬 Đang tạo dữ liệu Diễn đàn...');
  const postsData = [
    { title: 'Trao đổi Dế Mèn phiêu lưu ký', user: reader.id, type: 'exchange', status: 'approved', content: 'Mình có một cuốn còn mới và muốn trao đổi với bạn nào có truyện thiếu nhi.', image: null },
    { title: 'Review sách Sapiens: Lược sử loài người', user: reader2.id, type: 'exchange', status: 'approved', content: 'Mọi người thấy cuốn này thế nào? Mình đọc xong thấy rất truyền cảm hứng.', image: null },
    { title: 'Pass lại sách Kinh tế học hài hước', user: reader.id, type: 'sell', status: 'approved', content: 'Sách mình mua mới, đọc 1 lần, pass lại giá rẻ cho bạn nào cần.', image: null },
    { title: 'Cần thuê sách ôn thi Đại học', user: reader2.id, type: 'rent', status: 'pending', content: 'Mình cần thuê lại sách tham khảo lớp 12 môn Toán trong vòng 1 tháng.', image: null }
  ];
  for (const postData of postsData) {
    const exists = await Post.findOne({ title: postData.title, user: postData.user });
    if (!exists) {
      await Post.create(postData);
    } else {
      await Post.updateOne({ _id: exists._id }, { $set: { image: postData.image } });
    }
  }

  // ==========================================
  // 4. DỮ LIỆU PHIẾU MƯỢN/THUÊ (RENTALS)
  // ==========================================
  console.log('📝 Đang tạo dữ liệu Phiếu mượn/thuê...');
  
  // Xóa các phiếu cũ để tránh trùng lặp khi chạy lại seed
  await Rental.deleteMany({});

  const book1 = await Book.findOne({ title: 'Dế Mèn phiêu lưu ký' });
  const book2 = await Book.findOne({ title: 'Sapiens: Lược sử loài người' });
  const book3 = await Book.findOne({ title: 'Nhà giả kim' });
  const book4 = await Book.findOne({ title: 'Cha giàu cha nghèo' });

  // Cấu trúc: [user, book, status, dueDate, returnedAt, rentalDays]
  const rentalsData = [
    {
      user: reader.id,
      book: book1.id,
      status: 'active', 
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày nữa
      dailyRate: book1.dailyRate || 0,
      rentalDays: 7,
      totalFee: (book1.dailyRate || 0) * 7,
    },
    {
      user: reader2.id,
      book: book2.id,
      status: 'active', 
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 ngày nữa
      dailyRate: book2.dailyRate || 0,
      rentalDays: 3,
      totalFee: (book2.dailyRate || 0) * 3,
    },
    {
      user: reader.id,
      book: book3.id,
      status: 'completed', // Đã trả
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Quá hạn 2 ngày
      returnedAt: new Date(),
      dailyRate: book3.dailyRate || 0,
      rentalDays: 5,
      totalFee: (book3.dailyRate || 0) * 5,
    },
    {
      user: reader2.id,
      book: book4.id,
      status: 'active', // Để active nhưng quá hạn -> tự động hiện "Quá hạn"
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Quá hạn 5 ngày
      dailyRate: book4.dailyRate || 0,
      rentalDays: 10,
      totalFee: (book4.dailyRate || 0) * 10,
    }
  ];

  for (const rental of rentalsData) {
    await Rental.create(rental);
  }

  console.log('✅ Đã nạp dữ liệu demo thành công!');
  console.log('Admin: thuthu / DemoAdmin123');
  console.log('User:  bandoc / DemoUser123');
}

seed()
  .catch(error => { 
    console.error('❌ Lỗi khi seed dữ liệu:', error.message); 
    process.exitCode = 1; 
  })
  .finally(() => mongoose.disconnect());