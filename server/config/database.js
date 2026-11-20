const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    // Ưu tiên lấy từ file .env, nếu không có thì dùng link Atlas của User
    const uri = process.env.MONGODB_URI || 'mongodb+srv://hnminha24124_db_user:123456789z@cluster0.k3zk5iu.mongodb.net/book_manager';
    
    await mongoose.connect(uri);
    console.log('Kết nối MongoDB thành công!');
  } catch (err) {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDatabase;