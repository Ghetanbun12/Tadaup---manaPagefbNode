import React from 'react';

const Header = ({ pageName, pages, activePageId, onPageSwitch, isLoggedIn, onLogout }) => {
    return (
        <header style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '30px',
            padding: '10px 0',
            borderBottom: '1px solid var(--border-light)'
        }}>
            <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '24px', letterSpacing: '-0.5px' }}>
                Fanpage Master
            </h1>
            {isLoggedIn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Quản lý:</span>
                    <select 
                        className="input-field" 
                        value={activePageId} 
                        onChange={onPageSwitch} 
                        style={{ padding: '8px 12px', width: 'auto', minWidth: '180px' }}
                    >
                        {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button 
                        className="btn btn-outline" 
                        onClick={onLogout}
                        style={{ padding: '8px 16px', color: 'var(--error)' }}
                    >
                        Đăng xuất
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;
