import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Form } from '../components/shared';

export function NewPost() {
  return <div className="narrow card card-body"><h1>Đăng bài diễn đàn</h1>
    <Form multipart label="Gửi bài chờ duyệt" onSave={async body => {
      await api('/posts', { method: 'POST', body });
      return 'Đã gửi bài. Thủ thư sẽ duyệt trước khi bài xuất hiện.';
    }}>
      <label>Tiêu đề<input name="title" required maxLength="160" /></label>
      <label>Hình thức<select name="type"><option value="exchange">Trao đổi</option><option value="sell">Thanh lý</option></select></label>
      <label>Nội dung<textarea name="content" required maxLength="5000" /></label>
      <label>Ảnh đính kèm<input type="file" name="image" accept="image/jpeg,image/png,image/webp" /></label>
    </Form><p><Link to="/profile">Xem bài trong hồ sơ →</Link></p>
  </div>;
}
