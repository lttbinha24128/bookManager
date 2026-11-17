import React, { useState } from 'react';
import { dateLabel, money } from '../services/api';
import { Action, Load, Status, Table, useData } from '../components/shared';

export function ManageRentals() {
  const source = useData('/admin/rentals');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState(''); // Thêm State cho thanh tìm kiếm
  
  return <>
    <h1>Mượn và trả sách</h1>
    
    {/* Khu vực chứa bộ lọc và tìm kiếm */}
    <div className="spread" style={{ marginBottom: '1rem', alignItems: 'flex-end' }}>
      <label className="filter-label" style={{ marginBottom: 0 }}>
        Trạng thái
        <select value={status} onChange={event => setStatus(event.target.value)}>
          <option value="">Tất cả</option>
          <option value="pending">Chờ giao</option>
          <option value="active">Đang mượn</option>
          <option value="overdue">Quá hạn</option>
          <option value="completed">Đã trả</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </label>
      
      <input 
        type="search" 
        placeholder="Tìm người mượn, tên sách..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        style={{ width: '300px' }} 
      />
    </div>

    <Load source={source}>
      {data => {
        // Kết hợp cả 2 điều kiện: Lọc theo Trạng thái VÀ Lọc theo Từ khóa tìm kiếm
        const filteredData = data.filter(item => {
          const matchStatus = !status || (status === 'overdue' ? item.isOverdue : item.status === status);
          
          const textSearch = search.toLowerCase();
          const matchSearch = 
            (item.user?.fullName || '').toLowerCase().includes(textSearch) || 
            (item.book?.title || '').toLowerCase().includes(textSearch);

          return matchStatus && matchSearch;
        });

        return (
          <div className="table-scroll" style={{ maxHeight: '600px' }}>
            <Table headings={['Người mượn', 'Đầu sách', 'Hạn trả', 'Tổng phí', 'Trạng thái', 'Thao tác']} rows={filteredData.map(item => {
              const path = '/admin/rentals/' + item._id;
              return [
                item._id, 
                item.user?.fullName, 
                item.book?.title, 
                dateLabel(item.dueDate), 
                money(item.totalFee), 
                <Status value={item.isOverdue ? 'overdue' : item.status} />,
                <div className="toolbar">
                  {item.status === 'pending' && (
                    <>
                      <Action path={path} body={{ action: 'lend' }} onDone={source.reload}>Xác nhận giao</Action>
                      <Action secondary path={path} body={{ action: 'cancel' }} onDone={source.reload}>Hủy</Action>
                    </>
                  )}
                  {item.status === 'active' && (
                    <Action path={path} body={{ action: 'return' }} onDone={source.reload}>Xác nhận trả</Action>
                  )}
                </div>
              ];
            })} />
          </div>
        );
      }}
    </Load>
  </>;
}