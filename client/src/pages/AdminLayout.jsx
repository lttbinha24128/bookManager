import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export function AdminLayout() {
  return <div className="admin-layout">
    <aside className="card sidebar"><strong>Quản trị thư viện</strong>
      <NavLink end to="/admin">Tổng quan</NavLink>
      <NavLink to="/admin/books">Quản lý sách</NavLink>
      <NavLink to="/admin/rentals">Mượn và trả sách</NavLink>
      <NavLink to="/admin/users">Người dùng</NavLink>
      <NavLink to="/admin/forum">Kiểm duyệt diễn đàn</NavLink>
    </aside><div className="admin-content"><Outlet /></div>
  </div>;
}
