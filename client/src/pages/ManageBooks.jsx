import React, { useState, useEffect } from 'react';
import { api, money } from '../services/api';
import { Action, BookFields, Form, Load, Status, Table, useData } from '../components/shared';
import './ManageBooks.css'; // Import file CSS riêng

export function ManageBooks() {
  const books = useData('/admin/books');
  const categories = useData('/categories');
  const sales = useData('/admin/sales');
  
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('tab') === 'sales' ? 'sales' : 'books');
  const [editing, setEditing] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null); 
  
  const [bookSearch, setBookSearch] = useState('');
  const [saleSearch, setSaleSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  
  // State cho Toast thông báo
  const [toast, setToast] = useState({ type: '', message: '' });

  // Tự động tắt Toast sau 5 giây
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const refresh = () => { books.reload(); sales.reload(); };

  // Hàm xử lý xóa thể loại
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) return;
    try {
      await api('/admin/categories/' + id, { method: 'DELETE' });
      categories.reload();
      setToast({ type: 'success', message: 'Đã xóa thể loại thành công!' });
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    }
  };

  return (
    <div className="manage-books-page">
      
      {/* HEADER */}
      <div className="page-header-banner">
        <h1>Quản lý sách</h1>
        <p className="text-muted">Quản lý kho sách, thể loại và các đề xuất thu mua từ độc giả.</p>
      </div>
      
      {toast.message && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      {/* TABS ĐIỀU HƯỚNG */}
      <div className="tabs">
        <button className={tab === 'books' ? 'active' : ''} onClick={() => setTab('books')}>
          Kho sách
        </button>
        <button className={tab === 'sales' ? 'active' : ''} onClick={() => setTab('sales')}>
          Thu mua sách cũ
        </button>
      </div>
      
      {/* NỘI DUNG TAB KHO SÁCH */}
      {tab === 'books' ? (
        <>
          {/* THANH CÔNG CỤ */}
          <div className="toolbar">
            <button onClick={() => setEditing({})}>+ Thêm đầu sách</button>
            
            {/* Dropdown Thêm thể loại */}
            <details>
              <summary>Thể loại</summary>
              <div className="dropdown-content">
                <Form label="Thêm thể loại mới" onSave={async body => {
                  await api('/admin/categories', { method: 'POST', body });
                  categories.reload();
                  return 'Đã thêm.';
                }}>
                  <input name="name" required maxLength="80" placeholder="Tên thể loại..." />
                </Form>
              </div>
            </details>

            {/* Dropdown Sửa/Xóa thể loại */}
            <details>
              <summary>Sửa / Xóa thể loại</summary>
              <div className="dropdown-content dropdown-wide">
                <input 
                  type="search" placeholder="Tìm thể loại..." 
                  value={categorySearch} onChange={e => setCategorySearch(e.target.value)} 
                  style={{ marginBottom: '10px', width: '100%' }} 
                />
                <Load source={categories}>
                  {cats => {
                    const filteredCats = cats.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
                    return (
                      <div style={{ maxHeight: '250px', overflowY: 'auto', borderTop: '1px solid #eee' }}>
                        {filteredCats.length === 0 ? <p style={{ padding: '10px 0', color: '#888' }}>Không tìm thấy thể loại.</p> :
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                            {filteredCats.map(cat => (
                              <li key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                {editingCategory === cat._id ? (
                                  <Form label="Lưu" onSave={async body => {
                                    await api('/admin/categories/' + cat._id, { method: 'PATCH', body });
                                    setEditingCategory(null);
                                    categories.reload();
                                  }}>
                                    <input name="name" defaultValue={cat.name} required autoFocus style={{ width: '120px' }} />
                                  </Form>
                                ) : (
                                  <>
                                    <span style={{ fontWeight: 500, flex: 1, wordBreak: 'break-word', marginRight: '10px' }}>{cat.name}</span>
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                      <button className="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setEditingCategory(cat._id)}>Sửa</button>
                                      <button className="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)' }} onClick={() => handleDeleteCategory(cat._id)}>Xóa</button>
                                    </div>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        }
                      </div>
                    );
                  }}
                </Load>
              </div>
            </details>

            {/* Ô tìm kiếm sách */}
            <input 
              type="search" placeholder="Tìm sách, tác giả..." 
              value={bookSearch} onChange={e => setBookSearch(e.target.value)} 
            />
          </div>

          {/* FORM THÊM/SỬA SÁCH */}
          {editing && (
            <div className="card card-body form-wrapper">
              <div className="spread form-header">
                <h2>{editing._id ? 'Sửa đầu sách' : 'Thêm đầu sách mới'}</h2>
                <button className="secondary" onClick={() => setEditing(null)}>Đóng</button>
              </div>
              <Load source={categories}>
                {data => (
                  <Form key={editing._id || 'new'} multipart label="Lưu đầu sách" onSave={async body => {
                    await api('/admin/books' + (editing._id ? '/' + editing._id : ''), { method: editing._id ? 'PATCH' : 'POST', body });
                    setEditing(null);
                    books.reload();
                    setToast({ type: 'success', message: editing._id ? 'Đã cập nhật sách!' : 'Đã thêm sách mới!' });
                  }}>
                    <BookFields categories={data} book={editing} />
                  </Form>
                )}
              </Load>
            </div>
          )}

          {/* BẢNG DỮ LIỆU SÁCH */}
          <Load source={books}>
            {data => {
              const filteredBooks = data.filter(b => 
                b.title.toLowerCase().includes(bookSearch.toLowerCase()) || 
                b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
                (b.category?.name && b.category.name.toLowerCase().includes(bookSearch.toLowerCase()))
              );

              return (
                <div className="table-scroll">
                  <Table headings={['Đầu sách', 'Thể loại', 'Tồn', 'Giá/ngày', 'Hiển thị', 'Thao tác']} rows={filteredBooks.map(book => [book._id,
                    <div className="book-cell">
                      {book.image && <img src={`/api/images/${book.image}`} alt={book.title} />}
                      <div>
                        <strong>{book.title}{book.volumeNumber ? ` · Tập ${book.volumeNumber}` : ''}</strong>
                        <small>{book.author}</small>
                      </div>
                    </div>,
                    book.category?.name || 'Chưa phân loại', 
                    book.quantity, 
                    book.dailyRate ? money(book.dailyRate) : 'Miễn phí', 
                    <Status value={book.status} />,
                    <div className="action-buttons">
                      <button className="secondary" onClick={() => setEditing(book)}>Sửa</button>
                      <Action 
                        secondary 
                        path={'/admin/books/' + book._id + '/status'} 
                        body={{ status: book.status === 'hidden' ? 'available' : 'hidden' }} 
                        onDone={books.reload}
                      >
                        {book.status === 'hidden' ? 'Hiện' : 'Ẩn'}
                      </Action>
                    </div>,
                  ])} />
                </div>
              );
            }}
          </Load>
        </>
      ) : (
        /* NỘI DUNG TAB THU MUA SÁCH CŨ */
        <>
          <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
            <input 
              type="search" placeholder="Tìm tên sách, người gửi..." 
              value={saleSearch} onChange={e => setSaleSearch(e.target.value)} 
            />
          </div>

          <Load source={sales}>
            {data => {
              const filteredSales = data.filter(s => 
                s.title.toLowerCase().includes(saleSearch.toLowerCase()) ||
                s.author.toLowerCase().includes(saleSearch.toLowerCase()) ||
                (s.user?.fullName && s.user.fullName.toLowerCase().includes(saleSearch.toLowerCase()))
              );

              return (
                <div className="table-scroll">
                  <Table headings={['Đề xuất', 'Người gửi', 'Giá mong muốn', 'Trạng thái', 'Thao tác']} rows={filteredSales.map(item => [item._id,
                    <div>
                      <strong>{item.title}{item.volumeNumber ? ` · Tập ${item.volumeNumber}` : ''}</strong>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--muted)' }}>{item.author} · {item.category?.name}</p>
                      {item.image && <a href={`/api/images/${item.image}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Xem ảnh tình trạng</a>}
                    </div>,
                    item.user?.fullName, 
                    money(item.expectedPrice), 
                    <Status value={item.status} label={item.status === 'approved' ? 'Đã thu mua' : undefined} />,
                    item.status === 'pending' && (
                      <div className="action-buttons">
                        <Action path={'/admin/sales/' + item._id} body={{ action: 'approve' }} onDone={refresh}>Thu mua</Action>
                        <Action secondary path={'/admin/sales/' + item._id} body={{ action: 'reject' }} onDone={refresh}>Từ chối</Action>
                      </div>
                    ),
                  ])} />
                </div>
              );
            }}
          </Load>
        </>
      )}
    </div>
  );
}