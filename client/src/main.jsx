import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { api } from './services/api';
import { Auth, Notice, useAuth } from './components/shared';
import { Home } from './pages/Home';
import { Books } from './pages/Books';
import { BookDetail } from './pages/BookDetail';
import { AuthPage } from './pages/AuthPage';
import { Forum } from './pages/Forum';
import { NewPost } from './pages/NewPost';
import { PostDetail } from './pages/PostDetail';
import { Sell } from './pages/Sell';
import { Profile } from './pages/Profile';
import { AdminLayout } from './pages/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { ManageBooks } from './pages/ManageBooks';
import { ManageRentals } from './pages/ManageRentals';
import { ManageUsers } from './pages/ManageUsers';
import { ManageForum } from './pages/ManageForum';
import './styles.css';

function RequireUser({ admin = false }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <p role="status">Đang kiểm tra đăng nhập…</p>;
  if (!user) return <Navigate to="/login" replace state={{ back: location.pathname + location.search }} />;
  if (admin && user.role !== 'admin') return <Notice error="Trang này dành cho thủ thư." />;
  return <Outlet />;
}

function Layout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Xóa thông tin phiên trên trình duyệt kể cả khi phiên máy chủ đã hết hạn.
    } finally {
      sessionStorage.removeItem('bookmanager-token');
      setUser(null);
      navigate('/');
    }
  }
  return <>
    <a className="skip-link" href="#main">Đến nội dung chính</a>
    <header><div className="nav container">
  {/* Gom Logo và Menu về bên trái */}
  <div className="nav-left">
    <Link className="brand" to="/"><span aria-hidden="true">▤</span> BookManager</Link>
    <nav aria-label="Điều hướng chính">
      <NavLink end to="/">Trang chủ</NavLink>
      <NavLink to="/books">Sách</NavLink>
      <NavLink to="/forum">Diễn đàn</NavLink>
    </nav>
  </div>

  {/* Tài khoản nằm bên phải */}
  <div className="account">
    {user ? (
      <>
        {user.role === 'admin' && <Link to="/admin">Quản trị</Link>}
        <Link to="/profile">Hồ sơ</Link>
        <button className="secondary" onClick={logout}>Đăng xuất</button>
      </>
    ) : (
      <>
        <Link to="/login" className="login-link">Đăng nhập</Link>
        <Link className="button" to="/register">Đăng ký</Link>
      </>
    )}
  </div>
</div></header>
    <main id="main" className="container"><Outlet /></main>
    <footer>
  <div className="container footer-grid">
    {/* Cột 1: Giới thiệu */}
    <div className="footer-col brand-col">
      <Link className="brand" to="/"><span aria-hidden="true">▤</span> BookManager</Link>
      <p className="muted">Nền tảng quản lý và trao đổi sách dành cho cộng đồng yêu sách. Mượn, thuê, mua bán và thảo luận cùng nhau.</p>
    </div>

    {/* Cột 2: Liên kết nhanh */}
    <div className="footer-col">
      <h3>Khám phá</h3>
      <Link to="/books">Tất cả sách</Link>
      <Link to="/forum">Diễn đàn</Link>
      <Link to="/sell">Đăng bán sách</Link>
    </div>

    {/* Cột 3: Hỗ trợ */}
    <div className="footer-col">
      <h3>Hỗ trợ</h3>
      <Link to="/profile">Tài khoản của tôi</Link>
      <a href="#">Chính sách bảo mật</a>
      <a href="#">Điều khoản sử dụng</a>
    </div>

    {/* Cột 4: Liên hệ */}
<div className="footer-col">
  <h3>Liên hệ</h3>
  <a href="mailto:support@bookmanager.vn">Email: support@bookmanager.vn</a>
  <a href="tel:19001234">Hotline: 1900 1234</a>
  <p>Địa chỉ: 123 Đường Sách, TP. HCM</p> {/* Thêm dòng này */}
</div>
  </div>
  
  {/* Dòng bản quyền */}
  <div className="footer-bottom">
    <div className="container">
      <span>© {new Date().getFullYear()} BookManager. Bảo lưu mọi quyền.</span>
      <span></span>
    </div>
  </div>
</footer>
  </>;
}

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(sessionStorage.getItem('bookmanager-token')));
  useEffect(() => {
    if (!sessionStorage.getItem('bookmanager-token')) return;
    api('/auth/me').then(setUser).catch(() => sessionStorage.removeItem('bookmanager-token')).finally(() => setChecking(false));
  }, []);
  return <Auth.Provider value={{ user, setUser, checking }}><BrowserRouter><Routes>
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="books" element={<Books />} />
      <Route path="books/:id" element={<BookDetail />} />
      <Route path="forum" element={<Forum />} />
      <Route path="forum/:id" element={<PostDetail />} />
      <Route path="login" element={<AuthPage />} />
      <Route path="register" element={<AuthPage signup />} />
      <Route element={<RequireUser />}>
        <Route path="profile" element={<Profile />} />
        <Route path="sell" element={<Sell />} />
        <Route path="forum/new" element={<NewPost />} />
      </Route>
      <Route element={<RequireUser admin />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<ManageBooks />} />
          <Route path="rentals" element={<ManageRentals />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="forum" element={<ManageForum />} />
        </Route>
      </Route>
      <Route path="*" element={<><h1>Không tìm thấy trang</h1><Link to="/">Về trang chủ</Link></>} />
    </Route>
  </Routes></BrowserRouter></Auth.Provider>;
}

createRoot(document.getElementById('root')).render(<App />);
