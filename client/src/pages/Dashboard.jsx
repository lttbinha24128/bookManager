import React from 'react';
import { Link } from 'react-router-dom';
import { Load, useData } from '../components/shared';

export function Dashboard() {
  const source = useData('/admin/dashboard');
  const metrics = [
    ['users', 'Người dùng', 'users'], ['books', 'Đầu sách đang hiển thị', 'books'],
    ['copies', 'Cuốn còn trong kho', 'books'], ['pending', 'Phiếu chờ giao', 'rentals'],
    ['overdue', 'Phiếu quá hạn', 'rentals'], ['rentals', 'Tổng phiếu mượn/thuê', 'rentals'],
    ['purchases', 'Đề xuất chờ thu mua', 'books?tab=sales'], ['posts', 'Bài đăng chờ duyệt', 'forum'],
  ];
  return <><h1>Tổng quan</h1><Load source={source}>{data =>
    <div className="metrics">{metrics.map(([key, title, page]) => <Link className="card card-body metric" key={key} to={'/admin/' + page}><span>{title}</span><strong>{data[key]}</strong></Link>)}</div>
  }</Load></>;
}
