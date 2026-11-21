const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    await mongoose.connect('mongodb+srv://hnminha24124_db_user:123456789z@cluster0.k3zk5iu.mongodb.net/book_manager');
    console.log('Kết nối MongoDB thành công');
  } catch (err) {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDatabase;