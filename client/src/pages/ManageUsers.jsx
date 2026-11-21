import React, { useState } from 'react';
import { dateLabel, money } from '../services/api';
import { Action, Load, Status, Table, useData } from '../components/shared';
import './ManageUsers.css'; // <-- Import file CSS mới

// Component con hiển thị chi tiết người dùng
function UserDetail({ userId, onClose }) {
  const source = useData('/admin/users/' + userId); 
  const [rentalSearch, setRentalSearch] = useState('');
  const [saleSearch, setSaleSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  
  return (
    <div className="card card-body form-wrapper">
      <div className="spread form-header">
        <h3 style={{ margin: 0 }}>Chi tiết người dùng</h3>
        <button className="secondary" onClick={onClose}>Đóng</button>
      </div>
      <Load source={source}>
        {data => {
          const filteredRentals = data.rentals.filter(r => 
            (r.book?.title && r.book.title.toLowerCase().includes(rentalSearch.toLowerCase()))
          );
          const filteredSales = data.sales.filter(s => 
            (s.title && s.title.toLowerCase().includes(saleSearch.toLowerCase()))
          );
          const filteredPosts = data.posts.filter(p => 
            (p.title && p.title.toLowerCase().includes(postSearch.toLowerCase()))
          );

          return (
            <div>
              <p><strong>Tài khoản:</strong> {data.user.username} - <strong>Họ tên:</strong> {data.user.fullName}</p>
              
              {/* --- PHẦN MƯỢN SÁCH --- */}
              <div className="spread" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>Lịch sử mượn sách ({filteredRentals.length})</h3>
                <input 
                  type="search" placeholder="Tìm tên sách..." 
                  value={rentalSearch} onChange={e => setRentalSearch(e.target.value)} 
                  style={{ width: '250px', padding: '0.4rem' }} 
                />
              </div>
              <div className="table-scroll" style={{ maxHeight: '280px' }}>
                {filteredRentals.length === 0 ? <p style={{ padding: '10px' }}>Không tìm thấy dữ liệu.</p> : 
                  <Table headings={['Tên sách', 'Hạn trả', 'Tổng phí', 'Trạng thái']} rows={filteredRentals.map(r => [
                    r._id, r.book?.title || 'Sách đã xóa', dateLabel(r.dueDate), money(r.totalFee), <Status value={r.status} />
                  ])} />
                }
              </div>

              {/* --- PHẦN BÁN SÁCH --- */}
              <div className="spread" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>Lịch sử bán sách ({filteredSales.length})</h3>
                <input 
                  type="search" placeholder="Tìm tên sách..." 
                  value={saleSearch} onChange={e => setSaleSearch(e.target.value)} 
                  style={{ width: '250px', padding: '0.4rem' }} 
                />
              </div>
              <div className="table-scroll" style={{ maxHeight: '280px' }}>
                {filteredSales.length === 0 ? <p style={{ padding: '10px' }}>Không tìm thấy dữ liệu.</p> : 
                  <Table headings={['Tên sách', 'Giá mong muốn', 'Trạng thái']} rows={filteredSales.map(s => [
                    s._id, s.title, money(s.expectedPrice), <Status value={s.status} />
                  ])} />
                }
              </div>
              
              {/* --- PHẦN BÀI ĐĂNG --- */}
              <div className="spread" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>Bài đăng diễn đàn ({filteredPosts.length})</h3>
                <input 
                  type="search" placeholder="Tìm tiêu đề bài đăng..." 
                  value={postSearch} onChange={e => setPostSearch(e.target.value)} 
                  style={{ width: '250px', padding: '0.4rem' }} 
                />
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--surface)', padding: '10px 10px 10px 30px' }}>
                {filteredPosts.length === 0 ? <p>Không tìm thấy dữ liệu.</p> : 
                  <ul style={{ margin: 0 }}>
                    {filteredPosts.map(p => <li key={p._id} style={{ marginBottom: '5px' }}>{p.title} (Trạng thái: {p.status})</li>)}
                  </ul>
                }
              </div>
            </div>
          );
        }}
      </Load>
    </div>
  );
}

export function ManageUsers() {
  const source = useData('/admin/users');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState(''); 
  
  return (
    <div className="manage-users-page"> {/* Class bao ngoài */}
      
      {/* HEADER */}
      <div className="page-header-banner">
        <h1>Người dùng</h1>
        <p className="text-muted">Quản lý tài khoản, phân quyền và trạng thái hoạt động của độc giả.</p>
      </div>

      {/* COMPONENT CHI TIẾT (NẾU CÓ CHỌN) */}
      {selectedUserId && <UserDetail userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
      
      {/* TOOLBAR */}
      <div className="toolbar">
        <input 
          type="search" 
          placeholder="Tìm tài khoản, họ tên, email..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {/* BẢNG DỮ LIỆU */}
      <Load source={source}>
        {data => {
          const filteredData = data.filter(u => 
            u.username.toLowerCase().includes(search.toLowerCase()) || 
            (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
          );

          return (
            <div className="table-scroll">
              <Table headings={['Tài khoản', 'Họ tên', 'Email', 'Vai trò', 'Trạng thái', 'Thao tác']} rows={filteredData.map(user => [
                user._id,
                user.username, 
                user.fullName, 
                user.email, 
                user.role === 'admin' ? 'Thủ thư' : 'Bạn đọc', 
                <Status value={user.status} label={user.status === 'active' ? 'Hoạt động' : undefined} />,
                <div className="action-buttons">
                  <button className="secondary" onClick={() => setSelectedUserId(user._id)}>Chi tiết</button>
                  {user.role === 'user' && (
                    <Action 
                      secondary 
                      path={'/admin/users/' + user._id} 
                      body={{ status: user.status === 'locked' ? 'active' : 'locked' }} 
                      onDone={source.reload}
                    >
                      {user.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                    </Action>
                  )}
                </div>,
              ])} />
            </div>
          );
        }}
      </Load>
    </div>
  );
}