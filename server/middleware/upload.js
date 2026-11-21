const multer = require('multer');
const { randomUUID } = require('node:crypto');
const { writeFile, unlink, mkdir  } = require('node:fs/promises');
const path = require('node:path');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20 } }).single('image');

// Kiểm tra chữ ký tệp trước khi lưu vào thư mục ảnh công khai.
async function saveImage(file) {
  if (!file) return undefined;
  const data = file.buffer;
  let extension;
  if (data.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') extension = 'png';
  if (data.subarray(0, 3).toString('hex') === 'ffd8ff') extension = 'jpg';
  if (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP') extension = 'webp';
  if (!extension) throw Object.assign(new Error('Chỉ nhận ảnh PNG, JPG hoặc WebP.'), { status: 400 });
  const name = randomUUID() + '.' + extension;
  await mkdir(path.join(__dirname, '../uploads'), { recursive: true }); 
  await writeFile(path.join(__dirname, '../uploads', name), data, { flag: 'wx' });
  return '/uploads/' + name;
}

async function withImage(file, operation) {
  const image = await saveImage(file);
  try {
    return await operation(image);
  } catch (error) {
    if (image) await unlink(path.join(__dirname, '../uploads', path.basename(image))).catch(console.warn);
    throw error;
  }
}

module.exports = { upload, withImage };
