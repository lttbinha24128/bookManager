import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Sell.css';

import { BookFields, Form, Load, useData } from '../components/shared';

export function Sell() {
  const categories = useData('/categories');
  
  return (
    // ĐÃ ĐỔI CLASS TỪ "narrow card card-body" SANG "sell-page"
    <div className="sell-page">
      <h1>Bán sách cho thư viện</h1>
      <p className="subtitle">Điền thông tin bên dưới để gửi yêu cầu bán sách của bạn cho thủ thư.</p>
      
      <Load source={categories}>
        {data => (
          <Form 
            multipart 
            label="Gửi đề xuất thu mua" 
            onSave={async body => {
              await api('/sales', { method: 'POST', body });
              return 'Đã gửi đề xuất. Theo dõi kết quả trong hồ sơ.';
            }}
          >
            <BookFields categories={data} sale />
          </Form>
        )}
      </Load>
      
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link to="/profile" style={{ fontWeight: '600', color: 'var(--green)' }}>
          Xem đề xuất trong hồ sơ →
        </Link>
      </p>
    </div>
  );
}