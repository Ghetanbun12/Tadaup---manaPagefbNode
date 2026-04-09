import React, { useState, useEffect } from 'react';
import * as api from '../api/fbApi';
import Skeleton from '../components/Common/Skeleton';
import AiReplyModal from '../components/AI/AiReplyModal';

const AiCommentPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [selectedPostContext, setSelectedPostContext] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.autoAnalyzePage();
            setPosts(res.data || []);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Lỗi khi phân tích AI');
        } finally {
            setLoading(false);
        }
    };

    const handleUseAiReply = async (commentId, message) => {
        try {
            await api.replyToComment(commentId, message);
            // Optionally refresh data or show tick
            alert('Đã gửi phản hồi thành công!');
            // update UI local state (just basic for now)
        } catch (err) {
            alert('Lỗi gửi reply: ' + (err.response?.data?.error || err.message));
        }
    };

    const getPriorityColor = (priority) => {
        if (priority === 5) return 'var(--danger, #ff4d4f)';
        if (priority >= 4) return 'var(--warning, #faad14)';
        if (priority >= 3) return 'var(--success, #52c41a)';
        return 'var(--text-muted, #aaa)';
    };

    const getPriorityLabel = (priority) => {
        if (priority === 5) return '🔥 Khẩn cấp';
        if (priority >= 4) return '⭐ Quan tâm';
        if (priority >= 3) return '🟢 Tích cực';
        return '⚪ Bình thường';
    };

    return (
        <div className="page-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>🤖 Quản lý Comment AI</h2>
                <button onClick={loadData} className="btn btn-primary" disabled={loading}>
                    {loading ? 'Đang phân tích...' : '🔄 Làm mới & Phân tích'}
                </button>
            </div>

            {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4d4f', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

            {loading ? (
                <div>
                    <Skeleton height="120px" margin="0 0 20px 0" />
                    <Skeleton height="120px" margin="0 0 20px 0" />
                </div>
            ) : posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#aaa' }}>Không có bài viết hoặc comment nào.</div>
            ) : (
                posts.map(post => {
                    const comments = post.comments?.data || [];
                    if (comments.length === 0) return null;

                    return (
                        <div key={post.id} style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '15px', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
                                <strong>Bài viết:</strong> {post.message || `[Hình ảnh/Video] ID: ${post.id}`}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {comments.map(c => (
                                    <div key={c.id} style={{
                                        display: 'flex', gap: '15px', padding: '15px',
                                        borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
                                        borderLeft: `4px solid ${getPriorityColor(c.ai?.priority)}`
                                    }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ccc', overflow: 'hidden' }}>
                                            <img src={`https://graph.facebook.com/${c.from?.id}/picture?type=square`} alt="avatar" style={{ width: '100%', height: '100%' }} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.from?.name || 'U')}&background=random`; }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <strong>{c.from?.name}</strong>
                                                <span style={{ fontSize: '11px', color: getPriorityColor(c.ai?.priority), fontWeight: 'bold' }}>
                                                    {getPriorityLabel(c.ai?.priority)} • {c.ai?.category}
                                                </span>
                                            </div>
                                            <div style={{ marginBottom: '10px' }}>{c.message}</div>

                                            {c.ai?.summary && (
                                                <div style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '10px', fontStyle: 'italic' }}>
                                                    💡 AI Tóm tắt: {c.ai.summary}
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                                <button
                                                    onClick={() => { setSelectedComment(c); setSelectedPostContext(post.message); }}
                                                    style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                >
                                                    🤖 AI Phản hồi
                                                </button>
                                                <button style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-light)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                                                    Thích
                                                </button>
                                            </div>

                                            {/* Render Replies */}
                                            {c.comments?.data && c.comments.data.length > 0 && (
                                                <div style={{ paddingLeft: '15px', borderLeft: '2px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {c.comments.data.map(reply => (
                                                        <div key={reply.id} style={{ display: 'flex', gap: '8px' }}>
                                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ccc', overflow: 'hidden', flexShrink: 0 }}>
                                                                <img src={`https://graph.facebook.com/${reply.from?.id}/picture?type=square`} alt="avatar" style={{ width: '100%', height: '100%' }} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.from?.name || 'U')}&background=random`; }} />
                                                            </div>
                                                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                                                                <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-muted)' }}>{reply.from?.name || 'User'}</div>
                                                                <div style={{ fontSize: '13px' }}>{reply.message}</div>
                                                                <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>{new Date(reply.created_time).toLocaleString('vi-VN')}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}

            {selectedComment && (
                <AiReplyModal
                    comment={selectedComment}
                    postContext={selectedPostContext}
                    onClose={() => setSelectedComment(null)}
                    onUseReply={handleUseAiReply}
                />
            )}
        </div>
    );
};

export default AiCommentPage;
