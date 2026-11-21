const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const mongoose = require('mongoose');
const fs = require('fs');
const connectDatabase = require('./config/database');
const Book = require('./models/Book');
const Post = require('./models/Post');

const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true, unique: true },
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true },
  uploadedAt: { type: Date, default: Date.now }
});
const Image = mongoose.model('Image', imageSchema);

async function uploadImages() {
  console.log('⏳ Đang kết nối Database...');
  await connectDatabase();
  
  const uploadDir = path.join(__dirname, 'uploads');
  const files = fs.readdirSync(uploadDir);
  console.log(`Tìm thấy ${files.length} file trong thư mục uploads.`);

  const books = await Book.find({ image: { $ne: null } });
  const posts = await Post.find({ image: { $ne: null } });

  const neededFiles = new Set();
  books.forEach(b => neededFiles.add(b.image));
  posts.forEach(p => neededFiles.add(p.image));

  console.log(`Cần upload ${neededFiles.size} file ảnh lên Atlas...`);

  for (const filename of neededFiles) {
    const exists = await Image.findOne({ filename });
    if (exists) {
      console.log(`⏩ Bỏ qua (đã có trong DB): ${filename}`);
      continue;
    }

    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Không tìm thấy file vật lý: ${filename}`);
      continue;
    }

    const ext = path.extname(filename).toLowerCase().replace('.', '');
    const data = fs.readFileSync(filePath);
    
    await Image.create({
      filename: filename,
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      data: data
    });
    console.log(`✅ Đã lưu: ${filename}`);
  }

  console.log('🎉 Hoàn tất!');
  mongoose.disconnect();
}

uploadImages().catch(error => {
  console.error('❌ Lỗi:', error.message);
  process.exitCode = 1;
});