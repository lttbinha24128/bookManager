import React, { useState } from 'react';
import { api, money } from '../services/api';
import { Action, BookFields, Form, Load, Status, Table, useData } from '../components/shared';

export function ManageBooks() {
  const books = useData('/admin/books');
  const categories = useData('/categories');
  const sales = useData('/admin/sales');
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('tab') === 'sales' ? 'sales' : 'books');
  const [editing, setEditing] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null); 
  const refresh = () => { books.reload(); sales.reload(); };
  return <><h1>Quản lý sách</h1>
    <div className="tabs">
      <button className={tab === 'books' ? '' : 'secondary'} onClick={() => setTab('books')}>Kho sách</button>
      <button className={tab === 'sales' ? '' : 'secondary'} onClick={() => setTab('sales')}>Thu mua sách cũ</button>
    </div>
    {tab === 'books' ? <>
      <div className="toolbar">
        <button onClick={() => setEditing({})}>Thêm đầu sách</button>
                <details className="card card-body"><summary>Quản lý thể loại</summary>
          {/* Form thêm mới */}
          <Form label="Thêm thể loại" onSave={async body => {
            await api('/admin/categories', { method: 'POST', body });
            categories.reload();
            return 'Đã thêm thể loại.';
          }}><label>Tên thể loại<input name="name" required maxLength="80" /></label></Form>

          <Load source={categories}>{cats => (
            <ul style={{ marginTop: '15px', padding: 0, listStyle: 'none' }}>
              {cats.map(cat => (
                <li key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  {editingCategory === cat._id ? (
                    <Form label="Lưu" onSave={async body => {
                      await api('/admin/categories/' + cat._id, { method: 'PATCH', body });
                      setEditingCategory(null);
                      categories.reload();
                    }}><input name="name" defaultValue={cat.name} required autoFocus /></Form>
                  ) : (
                    <>
                      <span>{cat.name}</span>
                      <div className="toolbar">
                        <button className="secondary" onClick={() => setEditingCategory(cat._id)}>Sửa</button>
                        <Action secondary path={'/admin/categories/' + cat._id} method="DELETE" onDone={categories.reload}>Xóa</Action>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}</Load>
        </details>
      </div>
      {editing && <div className="card card-body">
        <div className="spread"><h2>{editing._id ? 'Sửa đầu sách' : 'Thêm đầu sách'}</h2><button className="secondary" onClick={() => setEditing(null)}>Đóng</button></div>
        <Load source={categories}>{data => <Form key={editing._id || 'new'} multipart label="Lưu đầu sách" onSave={async body => {
          await api('/admin/books' + (editing._id ? '/' + editing._id : ''), { method: editing._id ? 'PATCH' : 'POST', body });
          setEditing(null);
          books.reload();
        }}><BookFields categories={data} book={editing} /></Form>}</Load>
      </div>}
      <Load source={books}>{data => <Table headings={['Đầu sách', 'Thể loại', 'Tồn', 'Giá/ngày', 'Hiển thị', 'Thao tác']} rows={data.map(book => [book._id,
        <div className="book-cell">{book.image && <img src={book.image} alt="" />}<div><strong>{book.title}{book.volumeNumber ? ' · Tập ' + book.volumeNumber : ''}</strong><small>{book.author}</small></div></div>,
        book.category?.name, book.quantity, book.dailyRate ? money(book.dailyRate) : 'Miễn phí', <Status value={book.status} />,
        <div className="toolbar"><button className="secondary" onClick={() => setEditing(book)}>Sửa</button>
          <Action secondary path={'/admin/books/' + book._id + '/status'} body={{ status: book.status === 'hidden' ? 'available' : 'hidden' }} onDone={books.reload}>{book.status === 'hidden' ? 'Hiện lại' : 'Ẩn'}</Action></div>,
      ])} />}</Load>
    </> : <Load source={sales}>{data => <Table headings={['Đề xuất', 'Người gửi', 'Giá mong muốn', 'Trạng thái', 'Thao tác']} rows={data.map(item => [item._id,
      <div><strong>{item.title}{item.volumeNumber ? ' · Tập ' + item.volumeNumber : ''}</strong><p>{item.author} · {item.category?.name}</p><p className="preserve">{item.description}</p><a href={item.image} target="_blank" rel="noreferrer">Xem ảnh tình trạng</a></div>,
      item.user?.fullName, money(item.expectedPrice), <Status value={item.status} label={item.status === 'approved' ? 'Đã thu mua' : undefined} />,
      item.status === 'pending' && <div className="toolbar">
        <Action path={'/admin/sales/' + item._id} body={{ action: 'approve' }} onDone={refresh}>Thu mua</Action>
        <Action secondary path={'/admin/sales/' + item._id} body={{ action: 'reject' }} onDone={refresh}>Từ chối</Action>
      </div>,
    ])} />}</Load>}
  </>;
}
