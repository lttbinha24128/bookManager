import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, dateLabel } from '../services/api';
import { Action, Form, Load, SignInLink, Status, useAuth, useData } from '../components/shared';
import './PostDetail.css'; // <-- Nhớ import file CSS

export function PostDetail() {
  const { id } = useParams();
  const source = useData('/posts/' + id);
  const { user } = useAuth();

  return (
    <Load source={source}>
      {({ post, comments }) => (
        <div className="post-detail-page"> {/* Class bao ngoài mới */}
          
          <div style={{ marginBottom: '1rem' }}>
            <Link to="/forum" style={{ color: 'var(--muted)', fontWeight: '600' }}>
              ← Quay lại diễn đàn
            </Link>
          </div>

          {/* KHUNG BÀI VIẾT */}
          <article className="post-content-card">
            <div style={{ marginBottom: '1rem' }}>
              <span className="badge">{post.type === 'sell' ? 'Thanh lý' : 'Trao đổi'}</span>
              {post.status === 'closed' && <Status value="closed" />}
            </div>
            
            <h1>{post.title}</h1>
            
            <div className="post-meta-info">
              <span>{post.user?.fullName || 'Ẩn danh'}</span>
              <span>•</span>
              <span>{dateLabel(post.createdAt)}</span>
            </div>
            
            <div className="post-text preserve">
              {post.content}
            </div>
            
            {post.image && <img className="post-attachment" src={post.image} alt="Ảnh đính kèm bài đăng" />}
            
            {/* Nút hoàn tất giao dịch (Chỉ hiện với chủ bài viết) */}
            {post.status === 'approved' && post.user?._id === user?._id && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px dashed var(--line)', paddingTop: '1.5rem' }}>
                <Action path={'/posts/' + id + '/close'} onDone={source.reload}>
                  Đã hoàn tất giao dịch
                </Action>
              </div>
            )}
          </article>

          {/* KHUNG BÌNH LUẬN */}
          <section className="comments-section">
            <h2>Bình luận</h2>
            
            {!comments.length && <p style={{ color: 'var(--muted)' }}>Chưa có bình luận nào. Hãy là người đầu tiên!</p>}
            
            {comments.map(item => (
              <div className="comment-item" key={item._id}>
                <div className="comment-author">
                  {item.user?.fullName || 'Ẩn danh'}
                  <span className="comment-date">{dateLabel(item.createdAt)}</span>
                </div>
                <div className="comment-text preserve">
                  {item.content}
                </div>
              </div>
            ))}

            {/* Form gửi bình luận */}
            {post.status === 'approved' && (
              user ? (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--line)' }}>
                  <Form 
                    label="Gửi bình luận" 
                    onSave={async body => {
                      await api('/posts/' + id + '/comments', { method: 'POST', body });
                      source.reload();
                      return 'Đã gửi bình luận.';
                    }}
                  >
                    <label>
                      Nội dung
                      <textarea name="content" maxLength="1500" required rows="3" placeholder="Viết bình luận của bạn..." />
                    </label>
                  </Form>
                </div>
              ) : (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <SignInLink>Đăng nhập để bình luận</SignInLink>
                </div>
              )
            )}
          </section>

        </div>
      )}
    </Load>
  );
}