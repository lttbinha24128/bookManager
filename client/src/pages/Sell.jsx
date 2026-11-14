import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { BookFields, Form, Load, useData } from '../components/shared';

export function Sell() {
  const categories = useData('/categories');
  return <div className="narrow card card-body"><h1>Bán sách cho thư viện</h1>
    <Load source={categories}>{data => <Form multipart label="Gửi đề xuất thu mua" onSave={async body => {
      await api('/sales', { method: 'POST', body });
      return 'Đã gửi đề xuất. Theo dõi kết quả trong hồ sơ.';
    }}><BookFields categories={data} sale /></Form>}</Load>
    <p><Link to="/profile">Xem đề xuất trong hồ sơ →</Link></p>
  </div>;
}
