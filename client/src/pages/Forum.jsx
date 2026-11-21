import React from 'react';
import { Link } from 'react-router-dom';
import { Load, SignInLink, useAuth, useData } from '../components/shared';
import { PostList } from '../components/PostList';

export function Forum() {
  const posts = useData('/posts');
  const { user } = useAuth();
  return <><div className="spread page-heading"><h1>Diễn đàn</h1>
    {user ? <Link className="button" to="/forum/new">Đăng bài</Link> : <SignInLink>Đăng nhập để đăng bài</SignInLink>}</div>
    <Load source={posts}>{data => <PostList posts={data} />}</Load></>;
}
