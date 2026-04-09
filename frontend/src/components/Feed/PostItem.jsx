import React from 'react';
import CommentItem from './CommentItem';

const PostItem = ({ post, onAction }) => {
    return (
        <div style={{ 
            padding: '16px 0', 
            borderBottom: '1px solid var(--border-light)',
            animation: 'fadeIn 0.5s ease'
        }}>
            <p style={{ margin: '0 0 12px 0', fontWeight: '600', fontSize: '15px' }}>
                {post.message || <em style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(Bài viết không có nội dung chữ)</em>}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {post.comments ? (
                    post.comments.data.map(c => (
                        <CommentItem key={c.id} comment={c} onAction={onAction} />
                    ))
                ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '8px' }}>
                        Chưa có bình luận nào.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostItem;
