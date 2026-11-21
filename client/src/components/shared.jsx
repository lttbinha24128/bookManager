import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, money } from '../services/api';

export const Auth = createContext(null);
export const useAuth = () => useContext(Auth);

export function useData(path) {
  const [state, setState] = useState({ path, data: null, error: '' });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api(path, { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setState({ path, data, error: '' });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ path, data: null, error: error.message });
    });
    return () => controller.abort();
  }, [path, revision]);
  return { ...(state.path === path ? state : { data: null, error: '' }), reload: () => setRevision(n => n + 1) };
}

export function Notice({ error, children }) {
  return error || children ? <p className={error ? 'notice error' : 'notice'} role={error ? 'alert' : 'status'}>{error || children}</p> : null;
}

export function Load({ source, children }) {
  if (source.error) return <Notice error={source.error} />;
  if (source.data === null) return <p role="status">Đang tải…</p>;
  return children(source.data);
}

export function Form({ onSave, children, className = '', label = 'Lưu', multipart = false }) {
  const [state, setState] = useState({});
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (multipart && !values.get('image')?.size) values.delete('image');
    setState({ busy: true });
    try {
      const message = await onSave(multipart ? values : Object.fromEntries(values));
      setState({ message });
    } catch (error) {
      setState({ error: error.message });
    }
  }
  return <form className={'form ' + className} onSubmit={submit}>
    {children}
    <Notice error={state.error}>{state.message}</Notice>
    <button disabled={state.busy}>{state.busy ? 'Đang xử lý…' : label}</button>
  </form>;
}

export function Action({ path, body, method = 'PATCH', onDone, children, secondary = false }) {
  const [state, setState] = useState({});
  return <span className="action"><button className={secondary ? 'secondary' : ''} disabled={state.busy} onClick={async () => {
    setState({ busy: true });
    try {
      await api(path, { method, body });
      onDone?.();
      setState({});
    } catch (error) {
      setState({ error: error.message });
    }
  }}>{state.busy ? 'Đang xử lý…' : children}</button><Notice error={state.error} /></span>;
}

export function SignInLink({ children = 'Đăng nhập để tiếp tục' }) {
  const { pathname, search } = useLocation();
  return <Link className="button" to="/login" state={{ back: pathname + search }}>{children}</Link>;
}

const labels = {
  pending: 'Chờ duyệt', active: 'Đang mượn', completed: 'Đã trả', cancelled: 'Đã hủy',
  approved: 'Đã duyệt', rejected: 'Từ chối', closed: 'Đã giao dịch', removed: 'Đã xóa',
  available: 'Đang hiển thị', hidden: 'Đã ẩn', locked: 'Đã khóa', overdue: 'Quá hạn',
};

export function Status({ value, label }) {
  return <span className={'badge ' + value}>{label || labels[value] || value}</span>;
}

export function Cover({ book }) {
  // Nếu có ảnh thật (book.image), hiển thị ảnh
  if (book.image) {
    return <img className="cover" src={book.image} alt={'Bìa ' + book.title} />;
  }
  
  // Nếu không có ảnh, hiển thị Placeholder được thiết kế lại
  return (
    <div className="cover placeholder">
      <span style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '0.5rem' }}>📖</span>
      <strong style={{ fontSize: '1rem', textAlign: 'center', padding: '0 1rem', color: 'var(--ink)' }}>
        {book.title}
      </strong>
      <small style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{book.author}</small>
    </div>
  );
}

export function BookGrid({ books }) {
  if (!books.length) return <p className="empty">Chưa tìm thấy sách phù hợp.</p>;
  
  return (
    <div className="book-grid">
      {books.map(book => (
        <Link className="book-card card" key={book._id} to={'/books/' + book._id}>
          <Cover book={book} />
          
          <div className="card-body">
            {/* Thể loại */}
            <small className="book-category">{book.category?.name || 'Chưa phân loại'}</small>
            
            {/* Tên sách (giới hạn 2 dòng) */}
            <h3>{book.title}{book.volumeNumber ? ` · Tập ${book.volumeNumber}` : ''}</h3>
            
            {/* Tác giả */}
            <p className="book-author">{book.author}</p>
            
            {/* Phần giá và số lượng */}
            <div className="spread book-meta">
              <span className="badge">
                {book.dailyRate ? `${money(book.dailyRate)}/ngày` : 'Miễn phí'}
              </span>
              <small className={book.quantity ? 'text-success' : 'text-danger'}>
                {book.quantity ? `Còn ${book.quantity}` : 'Hết sách'}
              </small>
            </div>
            
            {/* Nút Xem chi tiết (sẽ bị ẩn, chỉ hiện khi hover vào thẻ) */}
            <div className="book-action">
              <span>Xem chi tiết →</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function BookFields({ categories, book = {}, sale = false }) {
  return <>
    <label>Tên sách<input name="title" defaultValue={book.title} required maxLength="180" /></label>
    <label>Tác giả<input name="author" defaultValue={book.author} required maxLength="120" /></label>
    <div className="fields">
      <label>Thể loại<select name="category" required defaultValue={book.category?._id || ''}>
        <option value="">Chọn thể loại</option>{categories.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}
      </select></label>
      {/* Thêm step="1" ở đây */}
      <label>Số tập (nếu có)<input type="number" name="volumeNumber" min="1" step="1" defaultValue={book.volumeNumber ?? ''} /></label>
    </div>
    {sale ? 
      <label>Giá mong muốn (đ)<input type="number" name="expectedPrice" min="0" step="1" required /></label> :
      <div className="fields">
        {/* Thêm step="1" ở đây */}
        <label>Tồn kho{book._id && ' mới (nếu cần chỉnh)'}<input type="number" name="quantity" min="0" step="1" required={!book._id} placeholder={book._id ? String(book.quantity) : undefined} /></label>
        {/* Thêm step="1" ở đây */}
        <label>Giá thuê/ngày (đ)<input type="number" name="dailyRate" min="0" step="1" defaultValue={book.dailyRate ?? 0} required /></label>
      </div>}
    <label>{sale ? 'Tình trạng sách' : 'Mô tả'}<textarea name="description" required={sale} defaultValue={book.description} maxLength="3000" /></label>
    <label>{sale ? 'Ảnh tình trạng sách' : 'Ảnh bìa'}<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required={sale} /></label>
  </>;
}

export function Table({ headings, rows }) {
  if (!rows.length) return <p className="empty">Chưa có dữ liệu.</p>;
  return <div className="table-wrap"><table>
    <thead><tr>{headings.map(name => <th key={name} scope="col">{name}</th>)}</tr></thead>
    <tbody>{rows.map(([id, ...cells]) => <tr key={id}>{cells.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody>
  </table></div>;
}