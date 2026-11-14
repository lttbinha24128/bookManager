import React from 'react';
import { Action, Load, Status, Table, useData } from '../components/shared';

export function ManageUsers() {
  const source = useData('/admin/users');
  return <><h1>Người dùng</h1><Load source={source}>{data => <Table headings={['Tài khoản', 'Họ tên', 'Email', 'Vai trò', 'Trạng thái', 'Thao tác']} rows={data.map(user => [user._id,
    user.username, user.fullName, user.email, user.role === 'admin' ? 'Thủ thư' : 'Bạn đọc', <Status value={user.status} label={user.status === 'active' ? 'Hoạt động' : undefined} />,
    user.role === 'user' && <Action secondary path={'/admin/users/' + user._id} body={{ status: user.status === 'locked' ? 'active' : 'locked' }} onDone={source.reload}>{user.status === 'locked' ? 'Mở khóa' : 'Khóa'}</Action>,
  ])} />}</Load></>;
}
