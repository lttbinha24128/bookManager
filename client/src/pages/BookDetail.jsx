import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, daysUntil, money } from '../services/api';
import { Cover, Form, Load, SignInLink, useAuth, useData } from '../components/shared';

export function BookDetail() {
  const { id } = useParams();
  const source = useData('/books/' + id);
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const days = date ? Math.max(0, daysUntil(date)) : 0;
  return <Load source={source}>{book => <>
    <Link to="/books">← Danh mục sách</Link>
    <div className="book-detail card card-body">
      <Cover book={book} />
      <div>
        <small>{book.category?.name}</small>
        <h1>{book.title}{book.volumeNumber ? ' · Tập ' + book.volumeNumber : ''}</h1>
        <p>{book.author}</p><p>{book.description}</p>
        <p><span className="badge">{book.dailyRate ? money(book.dailyRate) + '/ngày' : 'Miễn phí'}</span> · Còn {book.quantity} cuốn</p>
        {!book.quantity ? <p>Hiện đã hết sách.</p> : !user ? <SignInLink>{book.dailyRate ? 'Đăng nhập để thuê' : 'Đăng nhập để mượn'}</SignInLink> :
          <Form label={book.dailyRate ? 'Gửi yêu cầu thuê' : 'Gửi yêu cầu mượn'} onSave={async body => {
            await api('/rentals', { method: 'POST', body: { ...body, book: id } });
            return 'Đã gửi yêu cầu. Bạn có thể theo dõi trong Hồ sơ của tôi.';
          }}>
            <label>Ngày trả dự kiến<input name="dueDate" type="date" required value={date} onChange={event => setDate(event.target.value)} /></label>
            {days > 0 && <p>{days} ngày · Tổng phí <strong>{money(days * book.dailyRate)}</strong></p>}
            <small>Nhận sách và thanh toán tại thư viện.</small>
          </Form>}
      </div>
    </div>
  </>}</Load>;
}
