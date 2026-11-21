const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const Book = require('./models/Book');

async function fix() {
  await connectDatabase();
  console.log('⏳ Đang kết nối Database...');
  
  // Tìm tất cả sách có chứa chữ /uploads/ trong đường dẫn ảnh
  const books = await Book.find({ image: /\/uploads\// });
  let count = 0;
  
  for (const b of books) {
    // Xóa chữ /uploads/ đi, chỉ giữ lại tên file
    b.image = b.image.replace('/uploads/', '');
    await b.save();
    count++;
    console.log(`✅ Đã sửa: ${b.title} -> ${b.image}`);
  }
  
  console.log(`🎉 Xong! Đã sửa ${count} cuốn sách.`);
  process.exit(0);
}
fix().catch(console.error);