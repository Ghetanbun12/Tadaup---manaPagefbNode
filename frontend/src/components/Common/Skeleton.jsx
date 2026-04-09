import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', margin = '10px 0' }) => {
    return (
        <div style={{
            width,
            height,
            borderRadius,
            margin,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear'
        }} />
    );
};

export const SkeletonPost = () => (
    <div className="card" style={{ marginBottom: '20px' }}>
        <Skeleton width="40%" height="24px" margin="0 0 15px 0" />
        <Skeleton width="100%" height="16px" />
        <Skeleton width="90%" height="16px" />
        <Skeleton width="80%" height="16px" />
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <Skeleton width="60px" height="32px" borderRadius="16px" />
            <Skeleton width="60px" height="32px" borderRadius="16px" />
        </div>
    </div>
);

export const SkeletonMessage = ({ isMe }) => (
    <div style={{ 
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        width: '60%',
        marginBottom: '12px'
    }}>
        <Skeleton height="40px" borderRadius="18px" margin="0" />
    </div>
);

export default Skeleton;
