import React, { useState } from 'react';
import FeedList from '../components/Feed/FeedList';
import AiReplyModal from '../components/AI/AiReplyModal';
import * as api from '../api/fbApi';

const FeedPage = ({ comments, onAction, onRefresh, loading }) => {
    const [selectedComment, setSelectedComment] = useState(null);

    const handleAction = (action, payload) => {
        if (action === 'ai-reply') {
            setSelectedComment(payload);
        } else {
            onAction(action, payload);
        }
    };

    const handleUseAiReply = async (commentId, message) => {
        try {
            await api.replyToComment(commentId, message);
            alert('Đã gửi AI reply thành công!');
            onRefresh();
        } catch (err) {
            alert('Lỗi gửi reply: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="page-content">
            <h2 style={{ marginBottom: '24px' }}>Quản lý Feed & Bình luận</h2>
            <FeedList
                comments={comments}
                onAction={handleAction}
                onRefresh={onRefresh}
                loading={loading}
            />
            {selectedComment && (
                <AiReplyModal
                    comment={selectedComment}
                    onClose={() => setSelectedComment(null)}
                    onUseReply={handleUseAiReply}
                />
            )}
        </div>
    );
};

export default FeedPage;
