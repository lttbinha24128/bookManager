const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const Book = require('./models/Book');

async function fix() {
  await connectDatabase();
  console.log('⏳ Đang kết nối Database...');
  
  const books = await Book.find({ image: { $ne: null } });
  let count = 0;
  
  for (const b of books) {
    // Nếu đường dẫn ảnh không bắt đầu bằng /api/ hoặc http
    if (b.image && !b.image.startsWith('/api/') && !b.image.startsWith('http')) {
      b.image = '/api/images/' + b.image;
      await b.save();
      count++;
      console.log(`✅ Đã sửa: ${b.title}`);
    }
  }
  
  console.log(`🎉 Xong! Đã sửa ${count} cuốn sách.`);
  process.exit(0);
}
fix().catch(console.error);