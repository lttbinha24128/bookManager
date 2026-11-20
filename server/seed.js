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
  console.log('⏳ Đang kết nối Database...');
  await connectDatabase();
  await Promise.all([User.init(), Category.init(), Book.init(), Post.init()]);

  // 1. Tạo tài khoản mẫu
  const accounts = [
    { username: 'thuthu', email: 'thuthu@example.test', fullName: 'Thủ thư', role: 'admin', password: 'DemoAdmin123' },
    { username: 'bandoc', email: 'bandoc@example.test', fullName: 'Bạn đọc', role: 'user', password: 'DemoUser123' },
    { username: 'user2', email: 'user2@example.test', fullName: 'Nguyễn Văn A', role: 'user', password: 'DemoUser123' },
  ];
  
  console.log('👤 Đang tạo tài khoản...');
  for (const { password, ...account } of accounts) {
    await User.updateOne({ username: account.username }, {
      $setOnInsert: { ...account, passwordHash: await hashPassword(password) },
    }, { upsert: true });
  }

  // 2. Dữ liệu Sách (Bổ sung thêm nhiều thể loại và giá tiền khác nhau)
  // Cấu trúc: [Tên sách, Tác giả, Thể loại, Giá thuê (0 = miễn phí), Số lượng, Mô tả]
  const booksData = [
    // Văn học
    ['Dế Mèn phiêu lưu ký', 'Tô Hoài', 'Văn học', 0, 4, 'Cuộc phiêu lưu của Dế Mèn qua nhiều vùng đất và những tình bạn mới.'],
    ['Tôi thấy hoa vàng trên cỏ xanh', 'Nguyễn Nhật Ánh', 'Văn học', 5000, 3, 'Câu chuyện tuổi thơ ở một làng quê Việt Nam.'],
    ['Đất rừng phương Nam', 'Đoàn Giỏi', 'Văn học', 0, 2, 'Hành trình của An qua vùng sông nước Nam Bộ.'],
    ['Số đỏ', 'Vũ Trọng Phụng', 'Văn học', 3000, 5, 'Bức tranh trào phúng về xã hội Việt Nam thời Pháp thuộc.'],
    ['Nhà giả kim', 'Paulo Coelho', 'Văn học', 10000, 2, 'Hành trình theo đuổi giấc mơ của cậu bé chăn cừu Santiago.'],
    
    // Khoa học - Kỹ năng
    ['Vũ trụ', 'Carl Sagan', 'Khoa học', 7000, 2, 'Một chuyến khám phá các vì sao, hành tinh và lịch sử khoa học.'],
    ['Sapiens: Lược sử loài người', 'Yuval Noah Harari', 'Lịch sử', 15000, 3, 'Hành trình phát triển của loài người từ thời tiền sử.'],
    ['Đắc Nhân Tâm', 'Dale Carnegie', 'Kỹ năng', 8000, 6, 'Nghệ thuật giao tiếp và thu phục lòng người.'],
    
    // Kinh tế - Chính trị
    ['Kinh tế học hài hước', 'Steven D. Levitt', 'Kinh tế', 12000, 1, 'Những góc nhìn thú vị về kinh tế qua các hiện tượng đời thường.'],
    ['Bàn về tự do', 'John Stuart Mill', 'Chính trị', 0, 1, 'Tác phẩm kinh điển về triết lý tự do cá nhân.'],
  ];

  console.log('📚 Đang tạo dữ liệu Sách...');
  for (const [title, author, name, dailyRate, quantity, description] of booksData) {
    const category = await Category.findOneAndUpdate({ name }, { $setOnInsert: { name } }, { upsert: true, returnDocument: 'after' });
    const key = { title, author, volumeNumber: null };
    await Book.updateOne(key, { $setOnInsert: { ...key, category: category.id, dailyRate, quantity, description } },
      { upsert: true, collation: { locale: 'vi', strength: 2 } });
  }

  // 3. Dữ liệu Bài đăng Diễn đàn (Đa dạng trạng thái và thể loại)
  console.log('💬 Đang tạo dữ liệu Diễn đàn...');
  const reader = await User.findOne({ username: 'bandoc' });
  const reader2 = await User.findOne({ username: 'user2' });

  const postsData = [
    {
      title: 'Trao đổi Dế Mèn phiêu lưu ký',
      user: reader.id,
      type: 'exchange',
      status: 'approved',
      content: 'Mình có một cuốn còn mới và muốn trao đổi với bạn nào có truyện thiếu nhi.'
    },
    {
      title: 'Tìm mua sách Sapiens bản đẹp',
      user: reader2.id,
      type: 'buy',
      status: 'approved',
      content: 'Cần tìm mua cuốn Sapiens bản bìa cứng, có ai bán lại không ạ?'
    },
    {
      title: 'Review sách Nhà giả kim',
      user: reader.id,
      type: 'discussion',
      status: 'approved',
      content: 'Mọi người thấy cuốn này thế nào? Mình đọc xong thấy rất truyền cảm hứng.'
    },
    {
      title: 'Cần thuê sách ôn thi Đại học',
      user: reader2.id,
      type: 'rent',
      status: 'pending', // Bài này đang chờ duyệt
      content: 'Mình cần thuê lại sách tham khảo lớp 12 môn Toán trong vòng 1 tháng.'
    },
    {
      title: 'Pass lại sách Kinh tế học hài hước',
      user: reader.id,
      type: 'sell',
      status: 'approved',
      content: 'Sách mình mua mới, đọc 1 lần, pass lại giá rẻ cho bạn nào cần.'
    }
  ];

  for (const postData of postsData) {
    const exists = await Post.exists({ title: postData.title, user: postData.user });
    if (!exists) {
      await Post.create(postData);
    }
  }

  console.log('✅ Đã nạp dữ liệu demo thành công!');
  console.log('Tài khoản Admin: thuthu / DemoAdmin123');
  console.log('Tài khoản User:  bandoc / DemoUser123');
}

seed()
  .catch(error => { 
    console.error('❌ Lỗi khi seed dữ liệu:', error.message); 
    process.exitCode = 1; 
  })
  .finally(() => mongoose.disconnect());