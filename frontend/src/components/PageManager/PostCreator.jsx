import React, { useState } from 'react';

const PostCreator = ({ pageName, onPost }) => {
    const [postMessage, setPostMessage] = useState('');

    const handlePostClick = () => {
        if (!postMessage.trim()) return;
        onPost(postMessage);
        setPostMessage('');
    };

    return (
        <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success)' }}>📝</span> Đăng bài mới
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Đang đăng lên: <strong>{pageName}</strong>
            </p>
            <textarea 
                className="input-field"
                value={postMessage} 
                onChange={(e) => setPostMessage(e.target.value)} 
                placeholder="Bạn đang nghĩ gì?" 
                style={{ minHeight: '120px', marginBottom: '16px', resize: 'vertical' }} 
            />
            <button 
                className="btn btn-success"
                onClick={handlePostClick} 
                style={{ width: '100%' }}
            >
                Đăng lên Fanpage
            </button>
        </div>
    );
};

export default PostCreator;
