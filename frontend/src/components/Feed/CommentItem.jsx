import React from 'react';

const CommentItem = ({ comment, onAction }) => {
    return (
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
            <div
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ccc', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
                onClick={() => {
                    const fallbackUser = { id: `anon_${comment.id}`, name: 'Người dùng Facebook (Ẩn danh)' };
                    onAction('private_reply', { ...comment, from: comment.from || fallbackUser });
                }}
                title="Nhấn để gửi tin nhắn riêng (Inbox)"
            >
                {comment.from?.id ? (
                    <img src={`https://graph.facebook.com/${comment.from.id}/picture?type=square`} alt="avatar" style={{ width: '100%', height: '100%' }} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.from?.name || 'U')}&background=random`; }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                )}
            </div>

            <div style={{ flex: 1 }}>
                <div className="comment-bubble" style={{ display: 'inline-block', maxWidth: '100%' }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--primary)', marginBottom: '2px' }}>
                        {comment.from?.name || 'Người dùng Facebook'}
                    </div>
                    <div style={{ fontSize: '14px' }}>{comment.message}</div>
                </div>
                <div className="action-links" style={{ marginTop: '6px', marginLeft: '6px' }}>
                    <span className="action-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }} onClick={() => onAction('ai-reply', comment)}>🤖 AI Phản hồi</span>
                    <span className="action-link" onClick={() => onAction('like', comment.id)}>Thích</span>
                    <span className="action-link" onClick={() => onAction('reply', comment.id)}>Phản hồi</span>
                    <span className="action-link" onClick={() => {
                        const fallbackUser = { id: `anon_${comment.id}`, name: 'Người dùng Facebook (Ẩn danh)' };
                        onAction('private_reply', { ...comment, from: comment.from || fallbackUser });
                    }}>Nhắn tin</span>
                    <span className="action-link" onClick={() => onAction('hide', comment.id)}>Ẩn</span>
                    <span className="action-link danger" onClick={() => onAction('delete', comment.id)}>Xóa</span>
                    <span style={{ color: '#ccc', fontSize: '10px' }}>• {new Date(comment.created_time).toLocaleString('vi-VN')}</span>
                </div>

                {comment.comments?.data && comment.comments.data.length > 0 && (
                    <div style={{ marginTop: '12px', paddingLeft: '20px', borderLeft: '2px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {comment.comments.data.map(reply => (
                            <div key={reply.id} style={{ display: 'flex', gap: '8px' }}>
                                <div
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ccc', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
                                    onClick={() => {
                                        const fallbackUser = { id: `anon_${reply.id}`, name: 'Người dùng Facebook (Ẩn danh)' };
                                        onAction('private_reply', { ...reply, from: reply.from || fallbackUser });
                                    }}
                                    title="Nhấn để gửi tin nhắn riêng (Inbox)"
                                >
                                    {reply.from?.id ? (
                                        <img src={`https://graph.facebook.com/${reply.from.id}/picture?type=square`} alt="avatar" style={{ width: '100%', height: '100%' }} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.from?.name || 'U')}&background=random`; }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="comment-bubble" style={{ display: 'inline-block', maxWidth: '100%', padding: '6px 10px' }}>
                                        <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                                            {reply.from?.name || 'Người dùng Facebook'}
                                        </div>
                                        <div style={{ fontSize: '13px' }}>{reply.message}</div>
                                    </div>
                                    <div style={{ color: '#ccc', fontSize: '10px', marginLeft: '6px', marginTop: '2px' }}>
                                        {new Date(reply.created_time).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
