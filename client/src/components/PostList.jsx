import React from 'react';
import { Link } from 'react-router-dom';
import { dateLabel } from '../services/api';
import { Status } from './shared';

export function PostList({ posts }) {
  if (!posts.length) return <p className="empty">Chưa có bài đăng công khai.</p>;
  
  return (
    <div className="post-list">
      {posts.map(post => (
        <article className="post-row" key={post._id}>
          
          {/* Ảnh thumbnail (nếu có) */}
          {post.image && <img className="post-thumb" src={post.image} alt="" />}
          
          {/* Phần nội dung chính */}
          <div className="post-content">
            
            {/* Hàng trên: Badge + Trạng thái */}
            <div className="post-header">
              <span className="badge">
                {post.type === 'sell' ? 'Thanh lý' : 'Trao đổi'}
              </span>
              {post.status === 'closed' && <Status value="closed" />}
            </div>

            {/* Tiêu đề bài viết (Bấm vào để chuyển trang) */}
            <h3 className="post-title">
              <Link to={'/forum/' + post._id}>{post.title}</Link>
            </h3>

            {/* Tác giả & Ngày tháng */}
            <div className="post-meta">
              <span>{post.user?.fullName || 'Ẩn danh'}</span>
              <span className="dot">•</span>
              <span>{dateLabel(post.createdAt)}</span>
            </div>

          </div>
        </article>
      ))}
    </div>
  );
}