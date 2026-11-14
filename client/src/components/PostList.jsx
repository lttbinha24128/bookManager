import React from 'react';
import { Link } from 'react-router-dom';
import { dateLabel } from '../services/api';
import { Status } from './shared';

export function PostList({ posts }) {
  if (!posts.length) return <p className="empty">Chưa có bài đăng công khai.</p>;
  return <div className="post-list">{posts.map(post => <article className="card card-body post-row" key={post._id}>
    {post.image && <img className="post-thumb" src={post.image} alt="" />}
    <div><span className="badge">{post.type === 'sell' ? 'Thanh lý' : 'Trao đổi'}</span>
    {post.status === 'closed' && <Status value="closed" />}
    <h3><Link to={'/forum/' + post._id}>{post.title}</Link></h3>
    <small>{post.user?.fullName} · {dateLabel(post.createdAt)}</small></div>
  </article>)}</div>;
}
