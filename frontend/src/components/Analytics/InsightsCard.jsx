import React from 'react';

const InsightsCard = ({ insights, onFetch }) => {
    return (
        <div className="card" style={{ marginBottom: '24px', borderLeft: '6px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: insights ? '16px' : '0' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>🚀 Hiệu quả trang</h3>
                <button className="btn btn-primary" onClick={onFetch} style={{ padding: '8px 16px', fontSize: '13px' }}>
                    {insights ? 'Cập nhật' : 'Xem thống kê'}
                </button>
            </div>
            
            {insights && (
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ 
                        flex: 1, 
                        background: 'linear-gradient(135deg, #e7f3ff 0%, #ffffff 100%)', 
                        padding: '16px', 
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        boxShadow: 'inset 0 0 10px rgba(24,119,242,0.05)'
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            LƯỢT TIẾP CẬN (24H)
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>
                            {insights.values[0].value.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px' }}>
                            Metric: {insights.title}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsightsCard;
