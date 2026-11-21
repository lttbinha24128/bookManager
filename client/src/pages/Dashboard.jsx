import React from 'react';
import './Admin.css';
import { Link } from 'react-router-dom';
import { Load, useData } from '../components/shared';

export function Dashboard() {
  const source = useData('/admin/dashboard');
  
  // Cấu trúc mới: [key, title, page, icon, colorClass]
  const metrics = [
    ['users', 'Người dùng', 'users', '👤', 'blue'],
    ['books', 'Đầu sách hiển thị', 'books', '📚', 'green'],
    ['copies', 'Cuốn trong kho', 'books', '📦', 'orange'],
    ['pending', 'Phiếu chờ giao', 'rentals', '⏳', 'yellow'],
    ['overdue', 'Phiếu quá hạn', 'rentals', '⚠️', 'red'],
    ['rentals', 'Tổng phiếu mượn', 'rentals', '📝', 'purple'],
    ['purchases', 'Đề xuất thu mua', 'books?tab=sales', '🛒', 'teal'],
    ['posts', 'Bài chờ duyệt', 'forum', '💬', 'pink'],
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Tổng quan</h1>
        <p className="text-muted">Chào mừng trở lại, đây là tình hình thư viện hôm nay.</p>
      </div>

      <Load source={source}>
        {data => (
          <div className="metrics-grid">
            {metrics.map(([key, title, page, icon, color]) => (
              <Link className={`metric-card metric-${color}`} key={key} to={'/admin/' + page}>
                <div className="metric-icon">{icon}</div>
                <div className="metric-content">
                  <span className="metric-title">{title}</span>
                  <strong className="metric-value">{data[key]}</strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Load>
    </div>
  );
}