import React from 'react';

const StatusAlert = ({ status }) => {
    if (!status) return null;
    
    return (
        <div className="status-bar">
            <span style={{ marginRight: '8px' }}>⚡</span>
            <span>{status}</span>
        </div>
    );
};

export default StatusAlert;
