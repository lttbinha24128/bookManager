const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const Book = require('./models/Book');
const Post = require('./models/Post');

async function fixPaths() {
  console.log('⏳ Đang kết nối Database...');
  await connectDatabase();
  
  let count = 0;
  
  // Sửa đường dẫn ảnh cho Sách
  const books = await Book.find({ image: { $ne: null } });
  for (let b of books) {
    if (!b.image.startsWith('http') && !b.image.startsWith('/api/') && !b.image.startsWith('/uploads/')) {
      b.image = '/api/images/' + b.image;
      await b.save();
      count++;
      console.log(`✅ Đã sửa sách: ${b.title}`);
    }
  }

  // Sửa đường dẫn ảnh cho Bài viết (nếu có)
  const posts = await Post.find({ image: { $ne: null } });
  for (let p of posts) {
    if (!p.image.startsWith('http') && !p.image.startsWith('/api/') && !p.image.startsWith('/uploads/')) {
      p.image = '/api/images/' + p.image;
      await p.save();
      count++;
    }
  }

  console.log(`🎉 Hoàn tất! Đã sửa ${count} đường dẫn ảnh trong Database.`);
  process.exit(0);
}

fixPaths().catch(err => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});