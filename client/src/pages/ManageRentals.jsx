import React, { useState } from 'react';
import { dateLabel, money } from '../services/api';
import { Action, Load, Status, Table, useData } from '../components/shared';
import './ManageRentals.css'; // <-- Import file CSS mới

export function ManageRentals() {
  const source = useData('/admin/rentals');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  
  return (
    <div className="manage-rentals-page"> {/* Class bao ngoài cho CSS */}
      {/* HEADER MỚI */}
      <div className="page-header-banner">
        <h1>Mượn và trả sách</h1>
        <p className="text-muted">Quản lý các phiếu mượn, trả sách và tình trạng quá hạn của độc giả.</p>
      </div>      
      {/* TOOLBAR MỚI */}
      <div className="toolbar">
        <label htmlFor="status-filter">Trạng thái</label>
        <select 
          id="status-filter" 
          value={status} 
          onChange={event => setStatus(event.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="pending">Chờ giao</option>
          <option value="active">Đang mượn</option>
          <option value="overdue">Quá hạn</option>
          <option value="completed">Đã trả</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        
        <input 
          type="search" 
          placeholder="Tìm người mượn, tên sách..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      <Load source={source}>
        {data => {
          const filteredData = data.filter(item => {
            const matchStatus = !status || (status === 'overdue' ? item.isOverdue : item.status === status);
            
            const textSearch = search.toLowerCase();
            const matchSearch = 
              (item.user?.fullName || '').toLowerCase().includes(textSearch) || 
              (item.book?.title || '').toLowerCase().includes(textSearch);

            return matchStatus && matchSearch;
          });

          return (
            <div className="table-scroll">
              <Table headings={['Người mượn', 'Đầu sách', 'Hạn trả', 'Tổng phí', 'Trạng thái', 'Thao tác']} rows={filteredData.map(item => {
                const path = '/admin/rentals/' + item._id;
                return [
                  item._id, 
                  item.user?.fullName, 
                  // Thêm ảnh bìa sách cho cột Đầu sách
                  <div className="book-cell">
                    {item.book?.image && <img src={`/api/images/${item.book.image}`} alt="" />}
                    <div>
                      <strong>{item.book?.title}</strong>
                      <small>{item.book?.author}</small>
                    </div>
                  </div>,
                  dateLabel(item.dueDate), 
                  money(item.totalFee), 
                  <Status value={item.isOverdue ? 'overdue' : item.status} />,
                  <div className="action-buttons">
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
    </div>
  );
}