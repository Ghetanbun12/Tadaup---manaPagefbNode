import React from 'react';
import InsightsCard from '../components/Analytics/InsightsCard';

const Dashboard = ({ insights, onFetchInsights }) => {
    return (
        <div className="page-content">
            <h2 style={{ marginBottom: '24px' }}>Tổng quan hệ thống</h2>
            <div style={{ maxWidth: '500px' }}>
                <InsightsCard insights={insights} onFetch={onFetchInsights} />
            </div>
            <div className="card" style={{ marginTop: '24px' }}>
                <h4>Gợi ý hoạt động</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Chào mừng bạn đến với Fanpage Master! Hãy chuyển sang tab **Feed** để trả lời các bình luận mới nhất hoặc tab **Messenger** để trò chuyện trực tiếp với khách hàng.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
