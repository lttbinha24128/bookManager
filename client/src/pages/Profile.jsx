import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dateLabel, money } from '../services/api';
import { Action, Form, Load, Status, Table, useAuth, useData } from '../components/shared';
import './Profile.css'; // <-- Nhớ import file CSS mới

export function Profile() {
  const source = useData('/profile');
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('rentals');
  
  const tabs = { 
    rentals: 'Phiếu mượn/thuê', 
    sales: 'Đề xuất bán sách', 
    posts: 'Bài đăng của tôi' 
  };

  return (
    <div className="profile-page"> {/* Class bao ngoài */}
      <h1>Hồ sơ của tôi</h1>

      {/* 1. Khối thông tin cá nhân */}
      <div className="profile-card">
        <h2>Thông tin cá nhân</h2>
        <p className="profile-info-text">{user.username} · {user.email}</p>
        
        <Form 
          className="profile-form" 
          label="Cập nhật họ tên" 
          onSave={async body => {
            setUser(await api('/auth/me', { method: 'PATCH', body }));
            return 'Đã cập nhật.';
          }}
        >
          <label>
            Họ tên
            <input name="fullName" defaultValue={user.fullName} maxLength="120" required />
          </label>
        </Form>
      </div>

      {/* 2. Phần Tabs và Dữ liệu */}
      <section>
        <div className="profile-tabs">
          {Object.entries(tabs).map(([key, name]) => (
            <button 
              key={key} 
              // SỬA LOGIC: Nếu tab được chọn thì thêm class 'active'
              className={tab === key ? 'active' : ''} 
              aria-pressed={tab === key} 
              onClick={() => setTab(key)}
            >
              {name}
            </button>
          ))}
        </div>

        <Load source={source}>
          {data => (
            <>
              {/* Nếu dữ liệu trống, hiển thị khung thông báo đẹp mắt */}
              {(tab === 'rentals' && !data.rentals.length) || 
               (tab === 'sales' && !data.sales.length) || 
               (tab === 'posts' && !data.posts.length) ? (
                <div className="profile-content-empty">Chưa có dữ liệu.</div>
              ) : (
                <>
                  {tab === 'rentals' && (
                    <Table 
                      headings={['Sách', 'Hạn trả', 'Ngày trả', 'Tổng phí', 'Trạng thái']} 
                      rows={data.rentals.map(item => [
                        item._id, 
                        item.book?.title, 
                        dateLabel(item.dueDate), 
                        dateLabel(item.returnedAt), 
                        money(item.totalFee), 
                        <Status value={item.isOverdue ? 'overdue' : item.status} />
                      ])} 
                    />
                  )}
                  {tab === 'sales' && (
                    <Table 
                      headings={['Sách', 'Giá mong muốn', 'Trạng thái']} 
                      rows={data.sales.map(item => [
                        item._id, 
                        item.title, 
                        money(item.expectedPrice), 
                        <Status value={item.status} label={item.status === 'approved' ? 'Đã thu mua' : undefined} />
                      ])} 
                    />
                  )}
                  {tab === 'posts' && (
                    <Table 
                      headings={['Bài đăng', 'Trạng thái', 'Thao tác']} 
                      rows={data.posts.map(item => [
                        item._id,
                        ['approved', 'closed'].includes(item.status) 
                          ? <Link to={'/forum/' + item._id}>{item.title}</Link> 
                          : item.title,
                        <Status value={item.status} />, 
                        item.status === 'approved' && (
                          <Action path={'/posts/' + item._id + '/close'} onDone={source.reload}>
                            Đóng giao dịch
                          </Action>
                        )
                      ])} 
                    />
                  )}
                </>
              )}
            </>
          )}
        </Load>
      </section>
    </div>
  );
}