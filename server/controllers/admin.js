const Book = require('../models/Book');
const User = require('../models/User');
const Rental = require('../models/Rental');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const SellRequest = require('../models/SellRequest');
const { fail } = require('./catalog');

const recent = { createdAt: -1 };
const rentals = filter => Rental.find(filter).populate('book').populate('user', 'username fullName').sort(recent);
const sales = filter => SellRequest.find(filter).populate('category').populate('user', 'username fullName').sort(recent);

async function dashboard(req, res) {
  const [users, books, inventory, pending, overdue, purchases, posts, rentalsCount] = await Promise.all([
    User.countDocuments({ role: 'user' }), Book.countDocuments({ status: 'available' }),
    Book.aggregate([{ $match: { status: 'available' } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]),
    Rental.countDocuments({ status: 'pending' }),
    Rental.countDocuments({ status: 'active', dueDate: { $lt: new Date() } }),
    SellRequest.countDocuments({ status: 'pending' }), Post.countDocuments({ status: 'pending' }), Rental.countDocuments(),
  ]);
  res.json({ users, books, copies: inventory[0]?.total ?? 0, pending, overdue, purchases, posts, rentals: rentalsCount });
}

async function profile(req, res) {
  const filter = { user: req.user.id };
  const [rentalList, saleList, posts] = await Promise.all([rentals(filter), sales(filter), Post.find(filter).sort(recent)]);
  res.json({ rentals: rentalList, sales: saleList, posts });
}

async function listUsers(req, res) {
  res.json(await User.find().sort(recent));
}

async function setUserStatus(req, res) {
  if (!['active', 'locked'].includes(req.body.status)) throw fail(400, 'Trạng thái không hợp lệ.');
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'user' }, { status: req.body.status }, { returnDocument: 'after' });
  if (!user) throw fail(404, 'Không tìm thấy tài khoản người dùng.');
  res.json(user);
}

async function getUserDetail(req, res) {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) throw fail(404, 'Không tìm thấy người dùng.');

  const filter = { user: user._id };
  const [rentalList, saleList, postList] = await Promise.all([
    rentals(filter),
    sales(filter),
    Post.find(filter).sort(recent)
  ]);

  res.json({ 
    user, 
    rentals: rentalList, 
    sales: saleList, 
    posts: postList 
  });
}

async function listForum(req, res) {
  const [posts, comments] = await Promise.all([
    Post.find({ status: { $ne: 'removed' } }).populate('user', 'fullName').sort(recent),
    Comment.find({ removed: false }).populate('user', 'fullName').populate('post', 'title status').sort(recent),
  ]);
  res.json({ posts, comments: comments.filter(comment => comment.post?.status !== 'removed') });
}

module.exports = {
  dashboard, profile, listUsers, setUserStatus, listForum, getUserDetail,
  listBooks: async (req, res) => res.json(await Book.find().populate('category').sort(recent)),
  listRentals: async (req, res) => res.json(await rentals({})),
  listSales: async (req, res) => res.json(await sales({})),
};

