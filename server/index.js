const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const express = require('express');
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const api = require('./routes/api');

// Bắt buộc phải require model Image ở đây để mongoose nhận diện được
require('./models/Image'); 

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
app.use(express.json({ limit: '64kb' }));

// Phục vụ ảnh tĩnh (nếu cần dùng cho các file không lưu trong DB)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { index: false }));

app.use('/api', api);
app.use('/api', (req, res) => res.status(404).json({ message: 'Không tìm thấy đường dẫn.' }));

const client = path.join(__dirname, '../client/dist');
app.use(express.static(client));
app.get('/{*route}', (req, res, next) => {
  if (req.path.startsWith('/uploads/') || path.extname(req.path)) return next();
  res.sendFile(path.join(client, 'index.html'));
});

// ✅ Route lấy ảnh "vạn năng" sử dụng Regex để bắt mọi đường dẫn
app.get(/^\/api\/images\/(.*)/, async (req, res) => {
  try {
    // Lấy toàn bộ chuỗi phía sau /api/images/
    let rawName = req.params[0]; 
    
    // Xóa các dấu / bị dư ở đầu hoặc chữ /uploads/
    let cleanName = rawName.replace(/^\/+uploads\/+/, '').replace(/^\/+/, ''); 

    const Image = mongoose.model('Image'); 
    const image = await Image.findOne({ filename: cleanName });
    
    if (!image) {
      return res.status(404).json({ message: 'Không tìm thấy ảnh' });
    }
    
    res.set('Content-Type', image.contentType);
    res.send(image.data); 
  } catch (error) {
    console.error('Lỗi lấy ảnh:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.use('/api', api); // Dòng này phải nằm DƯỚI route ảnh

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.code === 11000) return res.status(409).json({ message: 'Dữ liệu đã tồn tại...' });
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Ảnh tối đa 5 MB.' });
  if (error.name === 'MulterError') return res.status(400).json({ message: 'Dữ liệu tải lên không hợp lệ.' });
  if (['ValidationError', 'CastError'].includes(error.name)) return res.status(400).json({ message: 'Dữ liệu không hợp lệ...' });
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ message: status >= 500 ? 'Có lỗi xảy ra trên máy chủ.' : error.message });
});

async function start() {
  await connectDatabase();
  await Promise.all(Object.values(require('mongoose').models).map(model => model.init()));
  const port = Number(process.env.PORT || 3000);
  
  // ⚠️ ĐÃ SỬA LỖI TẠI ĐÂY: Xóa '127.0.0.1' để Render có thể chạy được
  const server = app.listen(port, () => console.log('BookManager đang chạy ở port: ' + port));
  
  server.on('error', error => {
    console.error(error.message);
    process.exit(1);
  });
}
start().catch(error => {
  console.error(error.message);
  process.exit(1);
});