const dns = require('dns');
// Giữ nguyên dòng này để tránh lỗi DNS trên một số mạng
dns.setServers(['8.8.8.8', '1.1.1.1']); 

const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    // Đọc chuỗi kết nối từ file .env
    const uri = process.env.MONGODB_URI; 
    
    if (!uri) {
      throw new Error('Chưa cấu hình MONGODB_URI trong file .env');
    }

    await mongoose.connect(uri);
    console.log('✅ Kết nối MongoDB Atlas thành công');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;