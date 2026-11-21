import React, { useState } from 'react';
import { Action, Load, Status, Table, useData } from '../components/shared';
import './ManageForum.css'; // <-- Import file CSS mới

export function ManageForum() {
  const source = useData('/admin/forum');
  const [postSearch, setPostSearch] = useState('');
  const [commentSearch, setCommentSearch] = useState('');

  return (
    <div className="manage-forum-page">
      
      {/* HEADER */}
      <div className="page-header-banner">
        <h1>Kiểm duyệt diễn đàn</h1>
        <p className="text-muted">Quản lý bài đăng, bình luận và xử lý các nội dung vi phạm.</p>
      </div>

      <Load source={source}>
        {({ posts, comments }) => {
          const filteredPosts = posts.filter(p => 
            p.title.toLowerCase().includes(postSearch.toLowerCase()) || 
            (p.content && p.content.toLowerCase().includes(postSearch.toLowerCase())) ||
            (p.user?.fullName && p.user.fullName.toLowerCase().includes(postSearch.toLowerCase()))
          );

          const filteredComments = comments.filter(c => 
            (c.content && c.content.toLowerCase().includes(commentSearch.toLowerCase())) ||
            (c.post?.title && c.post.title.toLowerCase().includes(commentSearch.toLowerCase())) ||
            (c.user?.fullName && c.user.fullName.toLowerCase().includes(commentSearch.toLowerCase()))
          );

          return (
            <>
              {/* PHẦN BÀI ĐĂNG */}
              <section>
                <div className="section-header">
                <h2>📝 Bài đăng</h2>
                <input 
                    type="search" 
                    placeholder="Tìm bài đăng, người đăng..." 
                    value={postSearch} 
                    onChange={e => setPostSearch(e.target.value)} 
                  />
                </div>
                
                <div className="table-scroll">
                  <Table headings={['Bài đăng', 'Người đăng', 'Trạng thái', 'Thao tác']} rows={filteredPosts.map(post => {
                    const path = '/admin/posts/' + post._id;
                    return [
                      post._id, 
                      <div>
                        <strong>{post.title}</strong>
                        <p className="post-content-preview">{post.content}</p>
                        {post.image && <a href={`/api/images/${post.image}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem' }}>Xem ảnh</a>}
                      </div>,
                      post.user?.fullName, 
                      <Status value={post.status} />, 
                      <div className="action-buttons">
                        {post.status === 'pending' && (
                          <>
                            <Action path={path} body={{ status: 'approved' }} onDone={source.reload}>Duyệt</Action>
                            <Action secondary path={path} body={{ status: 'rejected' }} onDone={source.reload}>Từ chối</Action>
                          </>
                        )}
                        <Action secondary path={path} body={{ status: 'removed' }} onDone={source.reload}>Xóa bài</Action>
                      </div>
                    ];
                  })} />
                </div>
              </section>

              {/* PHẦN BÌNH LUẬN */}
              <section>
                <div className="section-header">
                <h2>💬 Bình luận</h2>
                <input 
                    type="search" 
                    placeholder="Tìm nội dung, người bình luận..." 
                    value={commentSearch} 
                    onChange={e => setCommentSearch(e.target.value)} 
                  />
                </div>

                <div className="table-scroll">
                  <Table headings={['Bài đăng', 'Người bình luận', 'Nội dung', 'Thao tác']} rows={filteredComments.map(item => [
                    item._id,
                    item.post?.title, 
                    item.user?.fullName, 
                    <span className="preserve">{item.content}</span>,
                    <div className="action-buttons">
                      <Action secondary method="DELETE" path={'/admin/comments/' + item._id} onDone={source.reload}>Xóa bình luận</Action>
                    </div>,
                  ])} />
                </div>
              </section>
            </>
          );
        }}
      </Load>
    </div>
  );
}