import React, { useState } from 'react';
import FeedList from '../components/Feed/FeedList';
import AiReplyModal from '../components/AI/AiReplyModal';
import * as api from '../api/fbApi';

import { useNavigate } from 'react-router-dom';

const FeedPage = ({ comments, onAction, onRefresh, loading }) => {
    const [selectedComment, setSelectedComment] = useState(null);
    const navigate = useNavigate();

    const handleAction = async (action, payload) => {
        if (action === 'ai-reply') {
            setSelectedComment(payload);
        } else if (action === 'private_reply') {
            const comment = payload;
            // Nhảy thẳng sang Messenger, không cần hiện Prompt
            navigate('/messenger', { state: { targetUser: comment.from, sourceCommentId: comment.id } });
        } else {
            // For standard actions like 'like', 'delete', 'hide', etc., payload should be the ID
            // If the payload is an object here (due to my Fix), we pass its ID
            const id = typeof payload === 'object' ? payload.id : payload;
            onAction(action, id);
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
