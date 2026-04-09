import React from 'react';

const LoginSection = ({ onLogin }) => {
    return (
        <div className="card" style={{ 
            textAlign: 'center', 
            padding: '80px 40px',
            background: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("https://www.facebook.com/images/fb_icon_325x325.png")',
            backgroundSize: '100px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center 20px'
        }}>
            <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Chào mừng trở lại!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                Quản lý các Fanpage của bạn một cách dễ dàng. Đăng bài, trả lời bình luận và xem phân tích ngay tại một nơi.
            </p>
            <button className="btn btn-primary" onClick={onLogin} style={{ fontSize: '18px', padding: '16px 40px' }}>
                Tiếp tục với Facebook
            </button>
        </div>
    );
};

export default LoginSection;
