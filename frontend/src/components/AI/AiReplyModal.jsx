import React, { useState, useEffect } from 'react';
import * as api from '../../api/fbApi';

const toneOptions = [
    { value: 'friendly', label: '😊 Thân thiện', desc: 'Vui vẻ, dùng emoji' },
    { value: 'professional', label: '💼 Chuyên nghiệp', desc: 'Lịch sự, formal' },
    { value: 'urgent', label: '🔥 Tạo urgency', desc: 'Thúc đẩy mua nhanh' },
];

const AiReplyModal = ({ comment, postContext = '', onClose, onUseReply }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tone, setTone] = useState('friendly');
    const [error, setError] = useState('');
    const [editingIdx, setEditingIdx] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        if (comment) fetchSuggestions();
        // eslint-disable-next-line
    }, [comment]);

    const fetchSuggestions = async () => {
        setLoading(true);
        setError('');
        setSuggestions([]);
        try {
            const res = await api.suggestReply(comment.message, postContext, tone);
            setSuggestions(res.suggestions || []);
        } catch (err) {
            setError('Không tạo được gợi ý. Kiểm tra GEMINI_API_KEY.');
        } finally {
            setLoading(false);
        }
    };

    const handleUse = (text) => {
        onUseReply(comment.id, text);
        onClose();
    };

    const overlayStyle = {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
    };

    const modalStyle = {
        background: 'var(--bg-card, #1e2235)',
        border: '1px solid rgba(120,120,255,0.25)',
        borderRadius: '16px',
        padding: '28px',
        width: '520px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
    };

    return (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={modalStyle}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--primary, #7c6aff)' }}>🤖 AI Gợi ý Reply</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted, #aaa)' }}>
                            Powered by Google Gemini
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
                </div>

                {/* Comment preview */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px', borderLeft: '3px solid var(--primary, #7c6aff)' }}>
                    <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>
                        💬 {comment?.from?.name || 'Khách hàng'}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-main, #fff)' }}>{comment?.message}</div>
                </div>

                {/* Tone selector */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
                    {toneOptions.map(t => (
                        <button key={t.value} onClick={() => setTone(t.value)} style={{
                            padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                            border: tone === t.value ? '2px solid var(--primary, #7c6aff)' : '1px solid rgba(255,255,255,0.15)',
                            background: tone === t.value ? 'rgba(124,106,255,0.15)' : 'transparent',
                            color: tone === t.value ? 'var(--primary, #7c6aff)' : '#aaa',
                            transition: 'all 0.2s',
                        }}>
                            {t.label}
                        </button>
                    ))}
                    <button onClick={fetchSuggestions} disabled={loading} style={{
                        marginLeft: 'auto', padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                        cursor: 'pointer', border: 'none',
                        background: 'rgba(124,106,255,0.2)', color: 'var(--primary, #7c6aff)',
                    }}>
                        {loading ? '⏳ ...' : '🔄 Tạo lại'}
                    </button>
                </div>

                {/* Suggestions */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
                        <div style={{ fontSize: '32px', marginBottom: '10px', animation: 'spin 1s linear infinite' }}>⚙️</div>
                        Gemini đang phân tích...
                    </div>
                )}
                {error && (
                    <div style={{ color: '#ff6b6b', background: 'rgba(255,100,100,0.1)', borderRadius: '8px', padding: '12px', fontSize: '13px' }}>
                        ⚠️ {error}
                    </div>
                )}
                {!loading && suggestions.map((s, idx) => (
                    <div key={idx} style={{
                        background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                        padding: '14px', marginBottom: '10px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'border-color 0.2s',
                    }}>
                        {editingIdx === idx ? (
                            <textarea
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                rows={3}
                                style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', resize: 'vertical', outline: 'none' }}
                            />
                        ) : (
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-main, #fff)', lineHeight: 1.6 }}>{s}</p>
                        )}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
                            {editingIdx === idx ? (
                                <>
                                    <button onClick={() => { handleUse(editText); }} style={btnStyle('#22c55e')}>✅ Gửi</button>
                                    <button onClick={() => setEditingIdx(null)} style={btnStyle('#aaa', true)}>Hủy</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleUse(s)} style={btnStyle('#7c6aff')}>⚡ Dùng ngay</button>
                                    <button onClick={() => { setEditingIdx(idx); setEditText(s); }} style={btnStyle('#aaa', true)}>✏️ Sửa</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const btnStyle = (color, outline = false) => ({
    padding: '6px 16px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
    border: outline ? `1px solid ${color}` : 'none',
    background: outline ? 'transparent' : color,
    color: outline ? color : '#fff',
    fontWeight: '600', transition: 'opacity 0.2s',
});

export default AiReplyModal;
