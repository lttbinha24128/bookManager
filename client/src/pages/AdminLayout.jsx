import React from 'react';
import './Admin.css';
import { NavLink, Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="brand-icon">📚</span>
          <strong>Quản trị thư viện</strong>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink end to="/admin">
             Tổng quan
          </NavLink>
          <NavLink to="/admin/books">
             Quản lý sách
          </NavLink>
          <NavLink to="/admin/rentals">
             Mượn và trả sách
          </NavLink>
          <NavLink to="/admin/users">
             Người dùng
          </NavLink>
          <NavLink to="/admin/forum">
            Kiểm duyệt diễn đàn
          </NavLink>
        </nav>
      </aside>
      
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}