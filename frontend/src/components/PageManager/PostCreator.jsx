import React, { useState } from 'react';

const PostCreator = ({ pageName, onPost }) => {
    const [postMessage, setPostMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handlePostClick = () => {
        if (!postMessage.trim() && !selectedFile) return;
        onPost(postMessage, selectedFile);
        setPostMessage('');
        setSelectedFile(null);
        setPreviewUrl('');
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
            {previewUrl && (
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                    <img src={previewUrl} alt="preview" style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
                    <button
                        onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                        style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        ×
                    </button>
                </div>
            )}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', padding: '8px 12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px' }}>
                    <span>📸 Thêm Hình Ảnh</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </label>
            </div>
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
