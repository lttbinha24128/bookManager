export async function api(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  const token = sessionStorage.getItem('bookmanager-token');
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  const response = await fetch('/api' + path, { method, headers, body, signal });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.message), { status: response.status });
  return data;
}

export const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
export const dateLabel = value => value ? new Date(value).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—';
export const today = () => new Date(Date.now() + 25200000).toISOString().slice(0, 10);
export const daysUntil = date => Math.round((new Date(date) - new Date(today())) / 86400000);