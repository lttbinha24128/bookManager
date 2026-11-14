const router = require('express').Router();
const auth = require('../controllers/auth');
const catalog = require('../controllers/catalog');
const rentals = require('../controllers/rentals');
const forum = require('../controllers/forum');
const admin = require('../controllers/admin');
const { requireUser, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/health', (req, res) => res.json({ ok: true }));
router.get('/books', catalog.listBooks);
router.get('/books/:id', catalog.getBook);
router.get('/categories', catalog.listCategories);
router.get('/posts', forum.listPosts);
router.get('/posts/:id', forum.postDetail);
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);

router.use(requireUser);
router.get('/auth/me', (req, res) => res.json(req.user));
router.patch('/auth/me', auth.updateProfile);
router.post('/auth/logout', auth.logout);
router.get('/profile', admin.profile);
router.post('/rentals', rentals.requestRental);
router.post('/sales', upload, catalog.submitSale);
router.post('/posts', upload, forum.createPost);
router.post('/posts/:id/comments', forum.addComment);
router.patch('/posts/:id/close', forum.closePost);

// Mọi API quản trị đều kiểm tra vai trò thủ thư ở máy chủ.
router.use('/admin', requireAdmin);
router.get('/admin/dashboard', admin.dashboard);
router.get('/admin/books', admin.listBooks);
router.post('/admin/books', upload, catalog.saveBook);
router.patch('/admin/books/:id', upload, catalog.saveBook);
router.patch('/admin/books/:id/status', catalog.setVisibility);
router.post('/admin/categories', catalog.addCategory);
router.get('/admin/rentals', admin.listRentals);
router.patch('/admin/rentals/:id', rentals.changeRental);
router.get('/admin/sales', admin.listSales);
router.patch('/admin/sales/:id', catalog.decideSale);
router.get('/admin/users', admin.listUsers);
router.patch('/admin/users/:id', admin.setUserStatus);
router.get('/admin/forum', admin.listForum);
router.patch('/admin/posts/:id', forum.moderatePost);
router.delete('/admin/comments/:id', forum.removeComment);

module.exports = router;
