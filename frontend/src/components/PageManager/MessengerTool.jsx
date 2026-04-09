import React, { useState, useEffect } from 'react';
import * as api from '../../api/fbApi';

const MessengerTool = ({ onSendMessage, activePageId }) => {
    const [recipientId, setRecipientId] = useState('');
    const [message, setMessage] = useState('');
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch conversations when page changes
    useEffect(() => {
        if (activePageId) {
            loadConversations();
        }
    }, [activePageId]);

    const loadConversations = async () => {
        setIsLoading(true);
        try {
            const res = await api.getConversations();
            // Map conversations to a simpler format
            const list = res.data.map(conv => ({
                id: conv.participants.data[0].id,
                name: conv.participants.data[0].name,
                snippet: conv.snippet
            }));
            setConversations(list);
            if (list.length > 0) setRecipientId(list[0].id);
        } catch (err) {
            console.error('Error loading conversations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = () => {
        if (!recipientId.trim() || !message.trim()) return;
        onSendMessage(recipientId, message);
        setMessage('');
    };

    return (
        <div className="card">
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--primary)' }}>💬</span> Gửi tin nhanh
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                        CHỌN NGƯỜI NHẬN
                    </label>
                    <button 
                        onClick={loadConversations} 
                        style={{ fontSize: '10px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                        Làm mới danh sách
                    </button>
                </div>
                
                {isLoading ? (
                    <div style={{ padding: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>Đang tải danh sách...</div>
                ) : (
                    <select 
                        className="input-field"
                        value={recipientId} 
                        onChange={(e) => setRecipientId(e.target.value)}
                    >
                        <option value="">-- Chọn khách hàng --</option>
                        {conversations.map(conv => (
                            <option key={conv.id} value={conv.id}>
                                {conv.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    NỘI DUNG TIN NHẮN
                </label>
                <textarea 
                    className="input-field"
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="Nhập tin nhắn..." 
                    style={{ minHeight: '80px', resize: 'none' }} 
                />
            </div>
            
            <button 
                className="btn btn-primary"
                onClick={handleSend} 
                style={{ width: '100%' }}
                disabled={!recipientId || isLoading}
            >
                Gửi qua Messenger
            </button>
        </div>
    );
};

export default MessengerTool;
