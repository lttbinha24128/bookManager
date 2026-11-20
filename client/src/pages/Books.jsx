import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookGrid, Load, Notice, useData } from '../components/shared';
import './Books.css';


export function Books() {
  const categories = useData('/categories');
  const [query, setQuery] = useState({ q: '', category: '', kind: '' });
  const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value));
  const books = useData('/books?' + params);
  const change = event => setQuery({ ...query, [event.target.name]: event.target.value });
  return <>
    <div className="spread page-heading"><h1>Danh mục sách</h1><Link className="button secondary" to="/sell">Bán sách cho thư viện</Link></div>
    <div className="filters card card-body">
      <label>Tìm sách<input name="q" value={query.q} onChange={change} placeholder="Tên sách hoặc tác giả" /></label>
      <label>Thể loại<select name="category" value={query.category} onChange={change}><option value="">Tất cả</option>
        {categories.data?.map(category => <option value={category._id} key={category._id}>{category.name}</option>)}
      </select></label>
      <label>Hình thức<select name="kind" value={query.kind} onChange={change}><option value="">Tất cả</option><option value="free">Miễn phí</option><option value="paid">Có phí</option></select></label>
    </div>
    <Notice error={categories.error} />
    <Load source={books}>{data => <BookGrid books={data} />}</Load>
  </>;
}
