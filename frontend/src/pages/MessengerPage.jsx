import React, { useState, useEffect } from 'react';
import * as api from '../api/fbApi';
import Skeleton, { SkeletonMessage } from '../components/Common/Skeleton';

const MessengerPage = ({ onSendMessage, activePageId }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [loadingList, setLoadingList] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);

    // 1. INITIAL LOAD: Load conversation list when page changes
    useEffect(() => {
        if (activePageId) {
            loadConversations(true); // Initial load with spinner
        }
    }, [activePageId]);

    // 2. AUTO-POLLING: Refresh list every 15 seconds to check for new messages
    useEffect(() => {
        if (!activePageId) return;

        const pollInterval = setInterval(() => {
            console.log('Auto-refreshing conversations...');
            loadConversations(false); // Background refresh (no spinner)
        }, 15000); // 15 seconds

        return () => clearInterval(pollInterval);
    }, [activePageId]);

    // 3. CHAT SYNC: Load messages when a conversation is selected
    useEffect(() => {
        if (selectedConv) {
            loadMessages(selectedConv.id);
        }
    }, [selectedConv]);

    const loadConversations = async (showLoading = false) => {
        if (showLoading) setLoadingList(true);
        try {
            const res = await api.getConversations();
            // api.getConversations already returns axios.data (the FB JSON body)
            // So res.data is the actual array from Facebook
            setConversations(res.data || []);
        } catch (err) {
            console.error('Lỗi tải hội thoại:', err);
        } finally {
            if (showLoading) setLoadingList(false);
        }
    };

    const loadMessages = async (convId) => {
        setLoadingChat(true);
        try {
            const res = await api.getConversationMessages(convId);
            // res is the FB JSON body, so res.data is the array of messages
            setMessages(res.data || []);
        } catch (err) {
            console.error('Lỗi tải tin nhắn:', err);
            setMessages([]);
        } finally {
            setLoadingChat(false);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedConv) return;
        
        const recipientId = selectedConv.participants.data[0].id;
        try {
            await onSendMessage(recipientId, replyText);
            setReplyText('');
            
            // 1. Clear unread count in local state
            setConversations(prev => prev.map(c => 
                c.id === selectedConv.id ? { ...c, unread_count: 0 } : c
            ));
            
            // 2. Reload messages to show the new one
            loadMessages(selectedConv.id);
        } catch (err) {
            console.error('Gửi tin thất bại:', err);
        }
    };

    return (
        <div className="page-content" style={{ height: '100%' }}>
            <h2 style={{ marginBottom: '20px' }}>Hộp thư Inbox</h2>
            
            <div className="inbox-layout">
                {/* Left: Conversation List */}
                <div className="conv-list">
                    <div style={{ padding: '15px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontWeight: '700' }}>Hội thoại ({conversations.length})</span>
                            <div style={{ fontSize: '10px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <span style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }}></span>
                                LIVE (Auto-update)
                            </div>
                        </div>
                        <button onClick={() => loadConversations(true)} style={{ fontSize: '11px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>Làm mới</button>
                    </div>
                    {loadingList ? (
                        <div style={{ padding: '15px' }}>
                            <Skeleton width="80%" height="20px" margin="10px 0" />
                            <Skeleton width="60%" height="14px" margin="5px 0" />
                            <hr style={{ opacity: 0.1, margin: '15px 0' }} />
                            <Skeleton width="80%" height="20px" margin="10px 0" />
                            <Skeleton width="60%" height="14px" margin="5px 0" />
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const user = conv.participants.data[0];
                            const isActive = selectedConv?.id === conv.id;
                            const isUnread = conv.unread_count > 0;
                            
                            return (
                                <div 
                                    key={conv.id} 
                                    className={`conv-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setSelectedConv(conv)}
                                >
                                    <div className="conv-name">
                                        <span>{user.name}</span>
                                        {isUnread && <span className="unread-badge">{conv.unread_count}</span>}
                                    </div>
                                    <div className="conv-snippet" style={{ fontWeight: isUnread ? '700' : '400', color: isUnread ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                        {conv.snippet}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
                                        {new Date(conv.updated_time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Right: Chat Panel */}
                <div className="chat-panel">
                    {selectedConv ? (
                        <>
                            <div style={{ padding: '15px', borderBottom: '1px solid var(--border-light)', background: '#fff', zIndex: 1 }}>
                                <strong style={{ fontSize: '16px' }}>{selectedConv.participants.data[0].name}</strong>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {selectedConv.participants.data[0].id}</div>
                            </div>

                            <div className="chat-history">
                                {loadingChat ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
                                        <SkeletonMessage isMe={false} />
                                        <SkeletonMessage isMe={true} />
                                        <SkeletonMessage isMe={false} />
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isMe = !msg.from?.id || msg.from.id === activePageId || msg.from.name === selectedConv.participants.data[1]?.name; 
                                        // Note: Logic identify "me" might need adjustment based on FB SDK data
                                        return (
                                            <div key={msg.id} className={`msg-bubble ${isMe ? 'me' : 'them'}`}>
                                                <div style={{ wordBreak: 'break-word' }}>
                                                    {msg.message || (
                                                        <span style={{ fontStyle: 'italic', opacity: 0.8, fontSize: '13px' }}>
                                                            (Stickers/Hình ảnh/Icon)
                                                        </span>
                                                    )}
                                                </div>
                                                {msg.created_time && (
                                                    <div className="msg-time">
                                                        {new Date(msg.created_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="chat-footer">
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        placeholder="Nhập tin nhắn phản hồi..." 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                                    />
                                    <button className="btn btn-primary" onClick={handleSendReply}>GỬI</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column' }}>
                            <div style={{ fontSize: '60px', marginBottom: '10px' }}>✉️</div>
                            <p>Hãy chọn một hội thoại từ danh sách để xem lịch sử tin nhắn.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessengerPage;
