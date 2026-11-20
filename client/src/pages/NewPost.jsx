import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Form } from '../components/shared';
import './NewPost.css'; // <-- Import NewPost.css

export function NewPost() {
  return (
    <div className="newpost-page"> {/* <-- Dùng class mới */}
      <h1>Đăng bài diễn đàn</h1>
      
      <Form 
        multipart 
        label="Gửi bài chờ duyệt" 
        onSave={async body => {
          await api('/posts', { method: 'POST', body });
          return 'Đã gửi bài. Thủ thư sẽ duyệt trước khi bài xuất hiện.';
        }}
      >
        <label>Tiêu đề<input name="title" required maxLength="160" /></label>
        <label>Hình thức
          <select name="type">
            <option value="exchange">Trao đổi</option>
            <option value="sell">Thanh lý</option>
          </select>
        </label>
        <label>Nội dung<textarea name="content" required maxLength="5000" /></label>
        <label>Ảnh đính kèm<input type="file" name="image" accept="image/jpeg,image/png,image/webp" /></label>
      </Form>
      
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link to="/profile" style={{ fontWeight: '600', color: 'var(--green)' }}>
          Xem bài trong hồ sơ →
        </Link>
      </p>
    </div>
  );
}