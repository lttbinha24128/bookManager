const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const User = require('../models/User');
const Session = require('../models/Session');
const { tokenDigest } = require('../middleware/auth');
const sendWelcome = require('../config/mail');

const deriveKey = promisify(scrypt);
const text = value => typeof value === 'string' ? value.trim() : '';

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await deriveKey(password, salt, 64);
  return salt + ':' + key.toString('hex');
}

async function register(req, res) {
  const username = text(req.body.username).toLowerCase();
  const email = text(req.body.email).toLowerCase();
  const fullName = text(req.body.fullName);
  const password = req.body.password;
  if (!/^[a-z0-9_.-]{3,32}$/.test(username) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 || !fullName || fullName.length > 120 || typeof password !== 'string' ||
      password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: 'Kiểm tra họ tên, email, tên đăng nhập (3–32 ký tự) và mật khẩu (8–128 ký tự).' });
  }
  const user = await User.create({ username, email, fullName, passwordHash: await hashPassword(password) });
  // Lưu tài khoản trước để lỗi SMTP không làm mất đăng ký.
  const emailStatus = await sendWelcome(user);
  res.status(201).json({ message: 'Đăng ký thành công. Bạn có thể đăng nhập.', emailStatus });
}

async function login(req, res) {
  const { password } = req.body;
  const user = await User.findOne({ username: text(req.body.username).toLowerCase() }).select('+passwordHash');
  if (!user || typeof password !== 'string' || password.length > 128) {
    return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
  }
  const [salt, hash] = user.passwordHash.split(':');
  const expected = Buffer.from(hash || '', 'hex');
  const candidate = await deriveKey(password, salt, 64);
  if (expected.length !== candidate.length || !timingSafeEqual(candidate, expected)) {
    return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
  }
  if (user.status === 'locked') return res.status(403).json({ message: 'Tài khoản đã bị khóa.' });
  const token = randomBytes(32).toString('hex');
  await Session.create({ user: user._id, digest: tokenDigest(token), expiresAt: new Date(Date.now() + 86400000) });
  const { _id, username, email, fullName, role, status } = user;
  res.json({ token, user: { _id, username, email, fullName, role, status } });
}

async function updateProfile(req, res) {
  const fullName = text(req.body.fullName);
  if (!fullName || fullName.length > 120) return res.status(400).json({ message: 'Họ tên phải có từ 1 đến 120 ký tự.' });
  req.user.fullName = fullName;
  await req.user.save();
  res.json(req.user);
}

async function logout(req, res) {
  await req.session.deleteOne();
  res.json({ message: 'Đã đăng xuất.' });
}

module.exports = { register, login, updateProfile, logout, hashPassword };
