import React, { useState } from 'react';
import { dateLabel, money } from '../services/api';
import { Action, Load, Status, Table, useData } from '../components/shared';

export function ManageRentals() {
  const source = useData('/admin/rentals');
  const [status, setStatus] = useState('');
  return <><h1>Mượn và trả sách</h1>
    <label className="filter-label">Trạng thái<select value={status} onChange={event => setStatus(event.target.value)}>
      <option value="">Tất cả</option><option value="pending">Chờ giao</option><option value="active">Đang mượn</option>
      <option value="overdue">Quá hạn</option><option value="completed">Đã trả</option><option value="cancelled">Đã hủy</option>
    </select></label>
    <Load source={source}>{data => <Table headings={['Người mượn', 'Đầu sách', 'Hạn trả', 'Tổng phí', 'Trạng thái', 'Thao tác']} rows={data.filter(item =>
      !status || (status === 'overdue' ? item.isOverdue : item.status === status)
    ).map(item => {
      const path = '/admin/rentals/' + item._id;
      return [item._id, item.user?.fullName, item.book?.title, dateLabel(item.dueDate), money(item.totalFee), <Status value={item.isOverdue ? 'overdue' : item.status} />,
        <div className="toolbar">
          {item.status === 'pending' && <><Action path={path} body={{ action: 'lend' }} onDone={source.reload}>Xác nhận giao</Action><Action secondary path={path} body={{ action: 'cancel' }} onDone={source.reload}>Hủy</Action></>}
          {item.status === 'active' && <Action path={path} body={{ action: 'return' }} onDone={source.reload}>Xác nhận trả</Action>}
        </div>];
    })} />}</Load>
  </>;
}
