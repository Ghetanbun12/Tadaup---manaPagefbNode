import React from 'react';

const CommentItem = ({ comment, onAction }) => {
    return (
        <div style={{ marginBottom: '12px' }}>
            <div className="comment-bubble">
                <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--primary)', marginBottom: '2px' }}>
                    {comment.from?.name || 'Người dùng Facebook'}
                </div>
                <div style={{ fontSize: '14px' }}>{comment.message}</div>
            </div>
            <div className="action-links">
                <span className="action-link" onClick={() => onAction('like', comment.id)}>Thích</span>
                <span className="action-link" onClick={() => onAction('reply', comment.id)}>Phản hồi</span>
                <span className="action-link" onClick={() => onAction('hide', comment.id)}>Ẩn</span>
                <span className="action-link danger" onClick={() => onAction('delete', comment.id)}>Xóa</span>
                <span style={{ color: '#ccc', fontSize: '10px' }}>• {new Date(comment.created_time).toLocaleString('vi-VN')}</span>
            </div>
        </div>
    );
};

export default CommentItem;
