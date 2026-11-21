const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { withImage } = require('../middleware/upload');
const { fail } = require('./catalog');

async function listPosts(req, res) {
  res.json(await Post.find({ status: { $in: ['approved', 'closed'] } }).populate('user', 'fullName').sort({ createdAt: -1 }));
}

async function postDetail(req, res) {
  const post = await Post.findOne({ _id: req.params.id, status: { $in: ['approved', 'closed'] } }).populate('user', 'fullName');
  if (!post) throw fail(404, 'Không tìm thấy bài đăng.');
  const comments = await Comment.find({ post: post.id, removed: false }).populate('user', 'fullName').sort({ createdAt: 1 });
  res.json({ post, comments });
}

async function createPost(req, res) {
  const { title, content, type } = req.body;
  res.status(201).json(await withImage(req.file, image => Post.create({ user: req.user.id, title, content, type, image })));
}

async function addComment(req, res) {
  if (!await Post.exists({ _id: req.params.id, status: 'approved' })) throw fail(409, 'Bài đăng đã đóng hoặc chưa được duyệt.');
  res.status(201).json(await Comment.create({ post: req.params.id, user: req.user.id, content: req.body.content }));
}

async function closePost(req, res) {
  const post = await Post.findOneAndUpdate({ _id: req.params.id, user: req.user.id, status: 'approved' }, { status: 'closed' }, { returnDocument: 'after' });
  if (!post) throw fail(409, 'Chỉ chủ bài có thể đóng bài đã được duyệt.');
  res.json(post);
}

async function moderatePost(req, res) {
  const status = req.body.status;
  if (!['approved', 'rejected', 'removed'].includes(status)) throw fail(400, 'Trạng thái không hợp lệ.');
  const filter = { _id: req.params.id, status: status === 'removed' ? { $ne: 'removed' } : 'pending' };
  const post = await Post.findOneAndUpdate(filter, { status }, { returnDocument: 'after' });
  if (!post) throw fail(409, 'Bài đăng đã được xử lý.');
  res.json(post);
}

async function removeComment(req, res) {
  const comment = await Comment.findByIdAndUpdate(req.params.id, { removed: true }, { returnDocument: 'after' });
  if (!comment) throw fail(404, 'Không tìm thấy bình luận.');
  res.json(comment);
}

module.exports = { listPosts, postDetail, createPost, addComment, closePost, moderatePost, removeComment };

