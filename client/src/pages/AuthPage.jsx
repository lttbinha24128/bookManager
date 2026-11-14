import React from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Form, Notice, useAuth } from '../components/shared';

export function AuthPage({ signup = false }) {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const back = location.state?.back;
  if (user) return <Navigate replace to={back || (user.role === 'admin' ? '/admin' : '/')} />;
  return <section className="narrow card card-body">
    <h1>{signup ? 'Đăng ký' : 'Đăng nhập'}</h1>
    <Form key={String(signup)} label={signup ? 'Tạo tài khoản' : 'Đăng nhập'} onSave={async body => {
      const result = await api('/auth/' + (signup ? 'register' : 'login'), { method: 'POST', body });
      if (signup) {
        navigate('/login', { replace: true, state: { back, message: result.message + (result.emailStatus === 'sent' ? ' Thư thông báo đã được gửi.' : '') } });
      } else {
        sessionStorage.setItem('bookmanager-token', result.token);
        setUser(result.user);
        navigate(back || (result.user.role === 'admin' ? '/admin' : '/'), { replace: true });
      }
    }}>
      {!signup && <Notice>{location.state?.message}</Notice>}
      {signup && <><label>Họ tên<input name="fullName" required maxLength="120" autoComplete="name" /></label>
      <label>Email<input name="email" type="email" required autoComplete="email" /></label></>}
      <label>Tên đăng nhập<input name="username" required autoComplete="username" minLength={signup ? 3 : undefined} /></label>
      <label>Mật khẩu<input name="password" type="password" required minLength={signup ? 8 : undefined} maxLength="128" autoComplete={signup ? 'new-password' : 'current-password'} /></label>
    </Form>
    <p>{signup ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <Link to={signup ? '/login' : '/register'} state={{ back }}>{signup ? 'Đăng nhập' : 'Đăng ký'}</Link></p>
  </section>;
}
