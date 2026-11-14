import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, dateLabel } from '../services/api';
import { Action, Form, Load, SignInLink, Status, useAuth, useData } from '../components/shared';

export function PostDetail() {
  const { id } = useParams();
  const source = useData('/posts/' + id);
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  return <Load source={source}>{({ post, comments }) => <>
    <Link to="/forum">← Diễn đàn</Link>
    <article className="card card-body detail-post">
      <span className="badge">{post.type === 'sell' ? 'Thanh lý' : 'Trao đổi'}</span>
      <h1>{post.title}</h1><small>{post.user?.fullName} · {dateLabel(post.createdAt)}</small>
      <p className="preserve">{post.content}</p>
      {post.image && <img className="attachment" src={post.image} alt="Ảnh đính kèm bài đăng" />}
      {post.status === 'closed' && <Status value="closed" />}
      {post.status === 'approved' && post.user?._id === user?._id && <Action path={'/posts/' + id + '/close'} onDone={source.reload}>Đã hoàn tất giao dịch</Action>}
    </article>
    <section className="card card-body"><h2>Bình luận</h2>
      {!comments.length && <p>Chưa có bình luận.</p>}
      {comments.map(item => <div className="comment" key={item._id}><strong>{item.user?.fullName}</strong> <small>{dateLabel(item.createdAt)}</small><p className="preserve">{item.content}</p></div>)}
      {post.status === 'approved' && (user ? <Form label="Gửi bình luận" onSave={async body => {
        await api('/posts/' + id + '/comments', { method: 'POST', body });
        setComment('');
        source.reload();
      }}><label>Nội dung<textarea name="content" maxLength="1500" required value={comment} onChange={event => setComment(event.target.value)} /></label></Form> : <SignInLink>Đăng nhập để bình luận</SignInLink>)}
    </section>
  </>}</Load>;
}
