import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dateLabel, money } from '../services/api';
import { Action, Form, Load, Status, Table, useAuth, useData } from '../components/shared';

export function Profile() {
  const source = useData('/profile');
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('rentals');
  const tabs = { rentals: 'Phiếu mượn/thuê', sales: 'Đề xuất bán sách', posts: 'Bài đăng của tôi' };
  return <><h1>Hồ sơ của tôi</h1>
    <div className="card card-body"><h2>Thông tin cá nhân</h2><p>{user.username} · {user.email}</p>
      <Form label="Cập nhật họ tên" onSave={async body => {
        setUser(await api('/auth/me', { method: 'PATCH', body }));
        return 'Đã cập nhật.';
      }}><label>Họ tên<input name="fullName" defaultValue={user.fullName} maxLength="120" required /></label></Form>
    </div>
    <section><div className="tabs">{Object.entries(tabs).map(([key, name]) => <button key={key} className={tab === key ? '' : 'secondary'} aria-pressed={tab === key} onClick={() => setTab(key)}>{name}</button>)}</div>
      <Load source={source}>{data => <>
        {tab === 'rentals' && <Table headings={['Sách', 'Hạn trả', 'Ngày trả', 'Tổng phí', 'Trạng thái']} rows={data.rentals.map(item => [item._id, item.book?.title, dateLabel(item.dueDate), dateLabel(item.returnedAt), money(item.totalFee), <Status value={item.isOverdue ? 'overdue' : item.status} />])} />}
        {tab === 'sales' && <Table headings={['Sách', 'Giá mong muốn', 'Trạng thái']} rows={data.sales.map(item => [item._id, item.title, money(item.expectedPrice), <Status value={item.status} label={item.status === 'approved' ? 'Đã thu mua' : undefined} />])} />}
        {tab === 'posts' && <Table headings={['Bài đăng', 'Trạng thái', 'Thao tác']} rows={data.posts.map(item => [item._id,
          ['approved', 'closed'].includes(item.status) ? <Link to={'/forum/' + item._id}>{item.title}</Link> : item.title,
          <Status value={item.status} />, item.status === 'approved' && <Action path={'/posts/' + item._id + '/close'} onDone={source.reload}>Đóng giao dịch</Action>])} />}
      </>}</Load>
    </section></>;
}
