import React from 'react';
import { Link } from 'react-router-dom';
import { BookGrid, Load, useData } from '../components/shared';
import { PostList } from '../components/PostList';

export function Home() {
  const books = useData('/books');
  const posts = useData('/posts');
  return <>
    <section className="hero">
      <div><h1>Thư viện sách</h1><p>Tìm cuốn sách bạn muốn đọc, mượn hoặc thuê tại thư viện và trao đổi sách cùng bạn đọc.</p>
        <Link className="button" to="/books">Khám phá sách →</Link></div>
      <div className="shelf" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
    </section>
    <section><div className="spread"><h2>Sách mới</h2><Link to="/books">Xem danh sách →</Link></div>
      <Load source={books}>{data => <BookGrid books={data.slice(0, 4)} />}</Load></section>
    <section><div className="spread"><h2>Diễn đàn gần đây</h2><Link to="/forum">Vào diễn đàn →</Link></div>
      <Load source={posts}>{data => <PostList posts={data.slice(0, 3)} />}</Load></section>
  </>;
}
