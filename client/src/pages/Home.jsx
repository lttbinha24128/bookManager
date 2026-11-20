import React from 'react';
import { Link } from 'react-router-dom';
import { BookGrid, Load, useData } from '../components/shared';
import { PostList } from '../components/PostList';
import './Home.css'; // <-- Import file CSS mới tạo

export function Home() {
  const books = useData('/books');
  const posts = useData('/posts');
  const categories = useData('/categories');


  return (
    <div className="home-page"> {/* Bọc ngoài cùng để dễ style nếu cần */}
      
      {/* 1. Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Thư viện sách</h1>
          <p>Tìm cuốn sách bạn muốn đọc, mượn hoặc thuê tại thư viện và trao đổi sách cùng bạn đọc.</p>
          <Link className="button" to="/books">Khám phá sách →</Link>
        </div>
        <div className="shelf" aria-hidden="true">
          <i /><i /><i /><i /><i /><i />
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
  <div className="spread">
    <h2>Khám phá thể loại</h2>
    <Link to="/books">Tất cả thể loại →</Link>
  </div>
  <div className="category-grid">
    {/* Giả sử API trả về mảng categories có name và _id */}
    <Load source={categories}>
  {data => data.slice(0, 6).map(cat => (
    <Link key={cat._id} to={`/books?category=${cat._id}`} className="category-card">
      <span>{cat.name}</span> {/* Bọc chữ trong thẻ span */}
    </Link>
  ))}
</Load>
  </div>
</section>

      {/* 2. Sách mới */}
      <section style={{ marginTop: '4rem' }}> {/* Thêm margin để tách khoảng cách */}
        <div className="spread">
          <h2>Sách mới</h2>
          <Link to="/books">Xem danh sách →</Link>
        </div>
        <Load source={books}>
          {data => <BookGrid books={data.slice(0, 4)} />}
        </Load>
      </section>

      {/* 3. Diễn đàn gần đây */}
      <section style={{ marginTop: '4rem' }}>
        <div className="spread">
          <h2>Diễn đàn gần đây</h2>
          <Link to="/forum">Vào diễn đàn →</Link>
        </div>
        <Load source={posts}>
          {data => <PostList posts={data.slice(0, 3)} />}
        </Load>
      </section>

      <section style={{ marginTop: '4rem', marginBottom: '2rem' }}>
  <div className="features-grid">
    
    {/* ĐÃ THAY ĐỔI Ở ĐÂY */}
    <div className="feature-item">
      <span style={{fontSize: '2rem'}}>📚</span>
      <h3>Đặt mượn trực tuyến</h3>
      <p className="muted">Đặt trước sách yêu thích và nhận tại thư viện chỉ trong 24h.</p>
    </div>

    <div className="feature-item">
      <span style={{fontSize: '2rem'}}>🛡️</span>
      <h3>Sách đảm bảo</h3>
      <p className="muted">100% sách được kiểm duyệt chất lượng trước khi giao.</p>
    </div>
    
    <div className="feature-item">
      <span style={{fontSize: '2rem'}}>💬</span>
      <h3>Hỗ trợ 24/7</h3>
      <p className="muted">Đội ngũ hỗ trợ luôn sẵn sàng giải đáp thắc mắc của bạn.</p>
    </div>

  </div>
</section>

    </div>
  );
}