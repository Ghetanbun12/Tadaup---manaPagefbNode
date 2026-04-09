import React from 'react';
import FeedList from '../components/Feed/FeedList';

const FeedPage = ({ comments, onAction, onRefresh, loading }) => {
    return (
        <div className="page-content">
            <h2 style={{ marginBottom: '24px' }}>Quản lý Feed & Bình luận</h2>
            <FeedList 
                comments={comments} 
                onAction={onAction} 
                onRefresh={onRefresh} 
                loading={loading}
            />
        </div>
    );
};

export default FeedPage;
