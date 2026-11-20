import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, daysUntil, money } from '../services/api';
import { Cover, Form, Load, SignInLink, useAuth, useData } from '../components/shared';
import './BookDetail.css'; // <-- Nhớ import file CSS mới

export function BookDetail() {
  const { id } = useParams();
  const source = useData('/books/' + id);
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const days = date ? Math.max(0, daysUntil(date)) : 0;

  return (
    <Load source={source}>
      {book => (
        <div className="book-detail-page">
          
          {/* Nút quay lại */}
          <Link to="/books" className="back-link">
            ← Danh mục sách
          </Link>

          <div className="book-detail-card">
            
            {/* CỘT TRÁI: ẢNH BÌA */}
            <div className="book-cover-wrapper">
              <Cover book={book} />
            </div>

            {/* CỘT PHẢI: THÔNG TIN */}
            <div className="book-info">
              <div className="book-category-tag">{book.category?.name || 'Chưa phân loại'}</div>
              
              <h1>{book.title}{book.volumeNumber ? ` · Tập ${book.volumeNumber}` : ''}</h1>
              
              <div className="book-author-name">Tác giả: {book.author}</div>
              
              <p className="book-description">
                {book.description || 'Chưa có mô tả cho cuốn sách này.'}
              </p>

              {/* Thêm khối thông tin chi tiết ở đây */}
<div className="book-metadata">
  <div className="meta-item">
    <span className="meta-label">Nhà xuất bản</span>
    <span className="meta-value">{book.publisher || 'Đang cập nhật'}</span>
  </div>
  <div className="meta-item">
    <span className="meta-label">Năm xuất bản</span>
    <span className="meta-value">{book.year || 'Đang cập nhật'}</span>
  </div>
  <div className="meta-item">
    <span className="meta-label">Ngôn ngữ</span>
    <span className="meta-value">{book.language || 'Tiếng Việt'}</span>
  </div>
  <div className="meta-item">
    <span className="meta-label">Số trang</span>
    <span className="meta-value">{book.pages ? `${book.pages} trang` : 'Đang cập nhật'}</span>
  </div>
</div>

              {/* Trạng thái và giá */}
              <div className="book-stats">
                <span className="price-badge">
                  {book.dailyRate ? `${money(book.dailyRate)}/ngày` : 'Miễn phí'}
                </span>
                <span className="stock-info">
                  {book.quantity ? `Còn ${book.quantity} cuốn` : 'Hết sách'}
                </span>
              </div>

              {/* Form mượn/thuê sách */}
              {!book.quantity ? (
                <div className="notice error">Hiện đã hết sách.</div>
              ) : !user ? (
                <SignInLink>
                  {book.dailyRate ? 'Đăng nhập để thuê' : 'Đăng nhập để mượn'}
                </SignInLink>
              ) : (
                <div className="borrow-form">
                  <h3>{book.dailyRate ? 'Đăng ký thuê sách' : 'Đăng ký mượn sách'}</h3>
                  
                  <Form 
                    label={book.dailyRate ? 'Gửi yêu cầu thuê' : 'Gửi yêu cầu mượn'} 
                    onSave={async body => {
                      await api('/rentals', { method: 'POST', body: { ...body, book: id } });
                      return 'Đã gửi yêu cầu. Bạn có thể theo dõi trong Hồ sơ của tôi.';
                    }}
                  >
                    <label>Ngày trả dự kiến
                      <input 
                        name="dueDate" 
                        type="date" 
                        required 
                        value={date} 
                        onChange={event => setDate(event.target.value)} 
                      />
                    </label>
                    
                    {/* Hiển thị tổng phí nếu có chọn ngày */}
                    {days > 0 && (
                      <div style={{ background: 'var(--tint)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                        <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Thời gian: <strong>{days} ngày</strong></span>
                          <span>Tổng phí: <strong style={{ color: 'var(--green-dark)', fontSize: '1.2rem' }}>{money(days * book.dailyRate)}</strong></span>
                        </p>
                      </div>
                    )}
                    
                    <small style={{ display: 'block', marginTop: '1rem', color: 'var(--muted)', textAlign: 'center' }}>
                      Nhận sách và thanh toán tại thư viện.
                    </small>
                  </Form>
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}
    </Load>
  );
}