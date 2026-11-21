const { createHash } = require('node:crypto');
const Session = require('../models/Session');

const tokenDigest = token => createHash('sha256').update(token).digest('hex');

async function requireUser(req, res, next) {
  const token = req.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
  const session = await Session.findOne({ digest: tokenDigest(token), expiresAt: { $gt: new Date() } }).populate('user');
  if (!session?.user) return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn.' });
  if (session.user.status === 'locked') return res.status(403).json({ message: 'Tài khoản đã bị khóa.' });
  req.user = session.user;
  req.session = session;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ thủ thư có quyền thao tác.' });
  next();
}

module.exports = { requireUser, requireAdmin, tokenDigest };
