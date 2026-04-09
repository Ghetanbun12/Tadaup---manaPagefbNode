import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navItems = [
        { path: '/', label: 'Overview', icon: '📊' },
        { path: '/posts', label: 'Create Post', icon: '📝' },
        { path: '/feed', label: 'Manage Feed', icon: '📰' },
        { path: '/messenger', label: 'Messenger', icon: '💬' },
    ];

    return (
        <aside className="sidebar">
            <nav style={{ padding: '20px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {navItems.map((item) => (
                        <li key={item.path} style={{ marginBottom: '8px' }}>
                            <NavLink 
                                to={item.path} 
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                <span style={{ marginRight: '10px' }}>{item.icon}</span>
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div style={{ padding: '20px', marginTop: 'auto', borderTop: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Fanpage Master v2.0
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
