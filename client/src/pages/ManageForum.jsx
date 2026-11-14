import React from 'react';
import { Action, Load, Status, Table, useData } from '../components/shared';

export function ManageForum() {
  const source = useData('/admin/forum');
  return <><h1>Kiểm duyệt diễn đàn</h1><Load source={source}>{({ posts, comments }) => <>
    <section><h2>Bài đăng</h2><Table headings={['Bài đăng', 'Người đăng', 'Trạng thái', 'Thao tác']} rows={posts.map(post => {
      const path = '/admin/posts/' + post._id;
      return [post._id, <div><strong>{post.title}</strong><p className="preserve">{post.content}</p>{post.image && <a href={post.image} target="_blank" rel="noreferrer">Xem ảnh</a>}</div>,
        post.user?.fullName, <Status value={post.status} />, <div className="toolbar">
          {post.status === 'pending' && <><Action path={path} body={{ status: 'approved' }} onDone={source.reload}>Duyệt</Action><Action secondary path={path} body={{ status: 'rejected' }} onDone={source.reload}>Từ chối</Action></>}
          <Action secondary path={path} body={{ status: 'removed' }} onDone={source.reload}>Xóa bài</Action>
        </div>];
    })} /></section>
    <section><h2>Bình luận</h2><Table headings={['Bài đăng', 'Người bình luận', 'Nội dung', 'Thao tác']} rows={comments.map(item => [item._id,
      item.post?.title, item.user?.fullName, <span className="preserve">{item.content}</span>,
      <Action secondary method="DELETE" path={'/admin/comments/' + item._id} onDone={source.reload}>Xóa bình luận</Action>,
    ])} /></section>
  </>}</Load></>;
}
