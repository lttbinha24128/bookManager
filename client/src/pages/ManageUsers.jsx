import React, { useState } from 'react';
import { dateLabel, money } from '../services/api';
import { Action, Load, Status, Table, useData } from '../components/shared';

function UserDetail({ userId, onClose }) {
  const source = useData('/admin/users/' + userId); 
  
  return <div className="card card-body" style={{ marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
    <div className="spread">
      <h2>Chi tiết người dùng</h2>
      <button className="secondary" onClick={onClose}>Đóng</button>
    </div>
    <Load source={source}>
      {data => <div>
        <p><strong>Tài khoản:</strong> {data.user.username} - <strong>Họ tên:</strong> {data.user.fullName}</p>
        
        <h3>Lịch sử mượn sách ({data.rentals.length})</h3>
        {data.rentals.length === 0 ? <p>Chưa mượn sách nào.</p> : 
          <Table headings={['Tên sách', 'Hạn trả', 'Tổng phí', 'Trạng thái']} rows={data.rentals.map(r => [
            r._id, r.book?.title || 'Sách đã xóa', dateLabel(r.dueDate), money(r.totalFee), <Status value={r.status} />
          ])} />
        }

        <h3>Lịch sử bán sách ({data.sales.length})</h3>
        {data.sales.length === 0 ? <p>Chưa bán sách nào.</p> : 
          <Table headings={['Tên sách', 'Giá mong muốn', 'Trạng thái']} rows={data.sales.map(s => [
            s._id, s.title, money(s.expectedPrice), <Status value={s.status} />
          ])} />
        }
        
        <h3>Bài đăng diễn đàn ({data.posts.length})</h3>
        {data.posts.length === 0 ? <p>Chưa có bài đăng nào.</p> : 
          <ul>{data.posts.map(p => <li key={p._id}>{p.title} (Trạng thái: {p.status})</li>)}</ul>
        }
      </div>}
    </Load>
  </div>;
}

export function ManageUsers() {
  const source = useData('/admin/users');
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  return <><h1>Người dùng</h1>
    
    {selectedUserId && <UserDetail userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
    
    <Load source={source}>{data => <Table headings={['Tài khoản', 'Họ tên', 'Email', 'Vai trò', 'Trạng thái', 'Thao tác']} rows={data.map(user => [user._id,
      user.username, user.fullName, user.email, user.role === 'admin' ? 'Thủ thư' : 'Bạn đọc', <Status value={user.status} label={user.status === 'active' ? 'Hoạt động' : undefined} />,
      
      <div className="toolbar">
        <button className="secondary" onClick={() => setSelectedUserId(user._id)}>Chi tiết</button>
        {user.role === 'user' && <Action secondary path={'/admin/users/' + user._id} body={{ status: user.status === 'locked' ? 'active' : 'locked' }} onDone={source.reload}>{user.status === 'locked' ? 'Mở khóa' : 'Khóa'}</Action>}
      </div>,
      
    ])} />}</Load></>;
}