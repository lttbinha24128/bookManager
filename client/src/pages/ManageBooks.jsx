import React, { useState, useEffect } from 'react';
import { api, money } from '../services/api';
import { Action, BookFields, Form, Load, Status, Table, useData } from '../components/shared';

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

  // Hàm xử lý xóa thể loại (dùng custom thay vì component Action)
  const handleDeleteCategory = async (id) => {
    try {
      await api('/admin/categories/' + id, { method: 'DELETE' });
      categories.reload();
      setToast({ type: 'success', message: 'Đã xóa thể loại thành công!' });
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    }
  };

  return <><h1>Quản lý sách</h1>
    
    {/* HIỂN THỊ POPUP THÔNG BÁO */}
    {toast.message && <div className={`toast ${toast.type}`}>{toast.message}</div>}

    <div className="tabs">
      <button className={tab === 'books' ? '' : 'secondary'} onClick={() => setTab('books')}>Kho sách</button>
      <button className={tab === 'sales' ? '' : 'secondary'} onClick={() => setTab('sales')}>Thu mua sách cũ</button>
    </div>
    
    {tab === 'books' ? <>
      <div className="spread" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
        
        <div className="toolbar" style={{ alignItems: 'flex-start' }}>
          <button onClick={() => setEditing({})}>Thêm đầu sách</button>
          
          <details className="card card-body" style={{ padding: '0.5rem', margin: 0 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--green-dark)' }}>+ Thêm thể loại</summary>
            <div style={{ marginTop: '10px', minWidth: '220px' }}>
              <Form label="Tên thể loại mới" onSave={async body => {
                await api('/admin/categories', { method: 'POST', body });
                categories.reload();
                return 'Đã thêm.';
              }}><input name="name" required maxLength="80" /></Form>
            </div>
          </details>

          <details className="card card-body" style={{ padding: '0.5rem', margin: 0 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--green-dark)' }}>Sửa / Xóa thể loại</summary>
            <div style={{ marginTop: '10px', width: '350px' }}> {/* Tăng nhẹ độ rộng để chứa nút cho đẹp */}
              
              <input 
                type="search" placeholder="Tìm thể loại..." 
                value={categorySearch} onChange={e => setCategorySearch(e.target.value)} 
                style={{ padding: '0.4rem', marginBottom: '10px' }} 
              />

              <Load source={categories}>{cats => {
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
                              }}><input name="name" defaultValue={cat.name} required autoFocus style={{ width: '120px' }} /></Form>
                            ) : (
                              <>
                                <span style={{ fontWeight: 500, flex: 1, wordBreak: 'break-word', marginRight: '10px' }}>
                                  {cat.name}
                                </span>
                                
                                {/* Sửa lại nút cho đều và vuông vức */}
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                  <button className="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', minWidth: '60px' }} onClick={() => setEditingCategory(cat._id)}>
                                    Sửa
                                  </button>
                                  <button className="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', minWidth: '60px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDeleteCategory(cat._id)}>
                                    Xóa
                                  </button>
                                </div>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    }
                  </div>
                );
              }}</Load>
            </div>
          </details>
        </div>

        <input 
          type="search" placeholder="Tìm sách, tác giả..." 
          value={bookSearch} onChange={e => setBookSearch(e.target.value)} 
          style={{ width: '300px' }} 
        />
      </div>

      {editing && <div className="card card-body" style={{ marginBottom: '1rem' }}>
        <div className="spread"><h2>{editing._id ? 'Sửa đầu sách' : 'Thêm đầu sách'}</h2><button className="secondary" onClick={() => setEditing(null)}>Đóng</button></div>
        <Load source={categories}>{data => <Form key={editing._id || 'new'} multipart label="Lưu đầu sách" onSave={async body => {
          await api('/admin/books' + (editing._id ? '/' + editing._id : ''), { method: editing._id ? 'PATCH' : 'POST', body });
          setEditing(null);
          books.reload();
        }}><BookFields categories={data} book={editing} /></Form>}</Load>
      </div>}

      <Load source={books}>
        {data => {
          const filteredBooks = data.filter(b => 
            b.title.toLowerCase().includes(bookSearch.toLowerCase()) || 
            b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
            (b.category?.name && b.category.name.toLowerCase().includes(bookSearch.toLowerCase()))
          );

          return (
            <div className="table-scroll" style={{ maxHeight: '1000px' }}>
              <Table headings={['Đầu sách', 'Thể loại', 'Tồn', 'Giá/ngày', 'Hiển thị', 'Thao tác']} rows={filteredBooks.map(book => [book._id,
                <div className="book-cell">{book.image && <img src={book.image} alt="" />}<div><strong>{book.title}{book.volumeNumber ? ' · Tập ' + book.volumeNumber : ''}</strong><small>{book.author}</small></div></div>,
                book.category?.name, book.quantity, book.dailyRate ? money(book.dailyRate) : 'Miễn phí', <Status value={book.status} />,
                <div className="toolbar"><button className="secondary" onClick={() => setEditing(book)}>Sửa</button>
                  <Action secondary path={'/admin/books/' + book._id + '/status'} body={{ status: book.status === 'hidden' ? 'available' : 'hidden' }} onDone={books.reload}>{book.status === 'hidden' ? 'Hiện lại' : 'Ẩn'}</Action></div>,
              ])} />
            </div>
          );
        }}
      </Load>
    </> : 
      <>
        <div className="spread" style={{ marginBottom: '1rem' }}>
          <span></span>
          <input 
            type="search" placeholder="Tìm tên sách, người gửi..." 
            value={saleSearch} onChange={e => setSaleSearch(e.target.value)} 
            style={{ width: '300px' }} 
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
              <div className="table-scroll" style={{ maxHeight: '1000px' }}>
                <Table headings={['Đề xuất', 'Người gửi', 'Giá mong muốn', 'Trạng thái', 'Thao tác']} rows={filteredSales.map(item => [item._id,
                  <div><strong>{item.title}{item.volumeNumber ? ' · Tập ' + item.volumeNumber : ''}</strong><p>{item.author} · {item.category?.name}</p><p className="preserve">{item.description}</p><a href={item.image} target="_blank" rel="noreferrer">Xem ảnh tình trạng</a></div>,
                  item.user?.fullName, money(item.expectedPrice), <Status value={item.status} label={item.status === 'approved' ? 'Đã thu mua' : undefined} />,
                  item.status === 'pending' && <div className="toolbar">
                    <Action path={'/admin/sales/' + item._id} body={{ action: 'approve' }} onDone={refresh}>Thu mua</Action>
                    <Action secondary path={'/admin/sales/' + item._id} body={{ action: 'reject' }} onDone={refresh}>Từ chối</Action>
                  </div>,
                ])} />
              </div>
            );
          }}
        </Load>
      </>
    }
  </>;
}