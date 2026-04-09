import React from 'react';
import PostItem from './PostItem';
import { SkeletonPost } from '../Common/Skeleton';

const FeedList = ({ comments, onAction, onRefresh, loading }) => {
    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Bài viết gần đây</h3>
                <button className="btn btn-outline" onClick={onRefresh} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    🔄 Làm mới
                </button>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
                {loading ? (
                    <>
                        <SkeletonPost />
                        <SkeletonPost />
                    </>
                ) : comments.length > 0 ? (
                    comments.map(post => (
                        <PostItem key={post.id} post={post} onAction={onAction} />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                        <p>Chưa có nội dung bài viết nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedList;
