import React, { useState, useEffect } from 'react';
import * as api from '../api/fbApi';
import Skeleton, { SkeletonMessage } from '../components/Common/Skeleton';
import AiReplyModal from '../components/AI/AiReplyModal';

const MessengerPage = ({ onSendMessage, activePageId }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [loadingList, setLoadingList] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [selectedMessageForAi, setSelectedMessageForAi] = useState(null);
    const [customerTags, setCustomerTags] = useState([]);
    const [newTag, setNewTag] = useState('');

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
            loadTags(selectedConv.participants.data[0].id);
        }
    }, [selectedConv]);

    const loadTags = async (customerId) => {
        try {
            const res = await api.getCustomerTags(customerId);
            setCustomerTags(res.tags || []);
        } catch (err) {
            console.error("Failed to load tags", err);
        }
    };

    const handleAddTag = async (e) => {
        if (e.key === 'Enter' && newTag.trim() && selectedConv) {
            const customerId = selectedConv.participants.data[0].id;
            try {
                const res = await api.addCustomerTag(customerId, newTag.trim());
                setCustomerTags([res.tag, ...customerTags]);
                setNewTag('');
            } catch (err) {
                alert('Tên nhãn dài quá hoặc bị lỗi!');
            }
        }
    };

    const handleDeleteTag = async (tagId) => {
        if (window.confirm("Xóa nhãn này khỏi khách hàng?")) {
            try {
                await api.deleteCustomerTag(tagId);
                setCustomerTags(customerTags.filter(t => t.id !== tagId));
            } catch (err) {
                console.error(err);
            }
        }
    };

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
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ccc', overflow: 'hidden', marginRight: '12px', flexShrink: 0 }}>
                                        <img src={`https://graph.facebook.com/${user.id}/picture?type=square`} alt="avatar" style={{ width: '100%', height: '100%' }} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random`; }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="conv-name">
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
                                            {isUnread && <span className="unread-badge">{conv.unread_count}</span>}
                                        </div>
                                        <div className="conv-snippet" style={{ fontWeight: isUnread ? '700' : '400', color: isUnread ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                            {conv.snippet}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
                                            {new Date(conv.updated_time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
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
                            <div style={{ padding: '15px', borderBottom: '1px solid var(--border-light)', background: '#fff', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ccc', overflow: 'hidden' }}>
                                        <img src={`https://graph.facebook.com/${selectedConv.participants.data[0].id}/picture?type=square`} alt="avatar" style={{ width: '100%', height: '100%' }} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConv.participants.data[0].name || 'U')}&background=random`; }} />
                                    </div>
                                    <div>
                                        <strong style={{ fontSize: '16px' }}>{selectedConv.participants.data[0].name}</strong>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {selectedConv.participants.data[0].id}</div>
                                    </div>
                                </div>
                                <div className="customer-tags" style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', maxWidth: '300px', justifyContent: 'flex-end' }}>
                                    {customerTags.map(tag => (
                                        <span key={tag.id} title="Bấm để xóa" onClick={() => handleDeleteTag(tag.id)} style={{ background: tag.color, color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {tag.name} <span>×</span>
                                        </span>
                                    ))}
                                    <input type="text" placeholder="+ Nhãn mới" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={handleAddTag} title="Gõ tên nhãn và nhấn Enter" style={{ fontSize: '11px', padding: '2px 6px', width: '80px', borderRadius: '12px', border: '1px dashed #ccc', outline: 'none' }} />
                                </div>
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
                                            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', marginBottom: '15px' }}>
                                                {!isMe && (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, marginTop: 'auto' }}>
                                                        <img src={`https://graph.facebook.com/${msg.from?.id || selectedConv.participants.data[0].id}/picture?type=square`} alt="avatar" style={{ width: '100%', height: '100%' }} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.from?.name || selectedConv.participants.data[0].name || 'U')}&background=random`; }} />
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                                    <div className={`msg-bubble ${isMe ? 'me' : 'them'}`}>
                                                        <div style={{ wordBreak: 'break-word' }}>
                                                            {msg.message || (
                                                                <span style={{ fontStyle: 'italic', opacity: 0.8, fontSize: '13px' }}>
                                                                    (Stickers/Hình ảnh/Icon)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                        {msg.created_time && (
                                                            <div className="msg-time" style={{ margin: 0 }}>
                                                                {new Date(msg.created_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                        {!isMe && (
                                                            <button
                                                                onClick={() => setSelectedMessageForAi({ id: msg.id, message: msg.message, from: msg.from })}
                                                                style={{ background: 'none', border: '1px solid #7c6aff', color: '#7c6aff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                                                            >
                                                                🤖 AI Phản hồi
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
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

            {selectedMessageForAi && (
                <AiReplyModal
                    comment={selectedMessageForAi}
                    onClose={() => setSelectedMessageForAi(null)}
                    onUseReply={(_, text) => setReplyText(text)}
                />
            )}
        </div>
    );
};

export default MessengerPage;
