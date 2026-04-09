import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import * as api from './api/fbApi';

// Layout Components
import Header from './components/Layout/Header';
import StatusAlert from './components/Layout/StatusAlert';
import Sidebar from './components/Layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import PostPage from './pages/PostPage';
import FeedPage from './pages/FeedPage';
import MessengerPage from './pages/MessengerPage';
import AiCommentPage from './pages/AiCommentPage';

// Auth Component
import LoginSection from './components/Auth/LoginSection';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [pageName, setPageName] = useState('');
    const [pages, setPages] = useState([]);
    const [activePageId, setActivePageId] = useState('');

    const [comments, setComments] = useState([]);
    const [loadingFeed, setLoadingFeed] = useState(false);
    const [insights, setInsights] = useState(null);
    const [status, setStatus] = useState('');

    // Check for saved session on mount
    React.useEffect(() => {
        const savedJwt = localStorage.getItem('fb_jwt_token');
        if (savedJwt) {
            restoreSession();
        }
    }, []);

    const restoreSession = () => {
        setStatus('Đang khôi phục phiên làm việc...');
        api.getCurrentUser()
            .then(res => {
                setIsLoggedIn(true);
                setPageName(res.activePage?.name || '');
                setActivePageId(res.activePage?.id || '');
                setStatus(`Chào mừng trở lại!`);
                fetchPagesList();
            })
            .catch(err => {
                setStatus('Phiên hết hạn, vui lòng đăng nhập lại.');
                localStorage.removeItem('fb_jwt_token');
            });
    };

    /**
     * Auth Handlers
     */
    const handleLogin = () => {
        if (!window.FB) return alert('Facebook SDK not loaded.');
        setStatus('Đang đăng nhập...');
        window.FB.login((response) => {
            if (response.authResponse) {
                const userToken = response.authResponse.accessToken;
                setStatus('Đang xác thực bảo mật...');
                api.loginToBackend(userToken)
                    .then(res => {
                        localStorage.setItem('fb_jwt_token', res.jwt); // Save internal JWT
                        setIsLoggedIn(true);
                        setPageName(res.activePage);
                        setStatus(`Thành công! Chào ${res.user.name}.`);
                        fetchPagesList();
                    })
                    .catch(err => setStatus(`Lỗi xác thực: ${err.message}`));
            } else {
                setStatus('Đăng nhập Facebook thất bại.');
            }
        }, {
            scope: 'public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,pages_messaging',
            return_scopes: true
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('fb_jwt_token');
        setIsLoggedIn(false);
        setPageName('');
        setPages([]);
        setStatus('Đã đăng xuất an toàn.');
    };

    /**
     * Page Handlers
     */
    const fetchPagesList = async () => {
        try {
            const res = await api.getAllPages();
            setPages(res.pages);
            setActivePageId(res.activePageId);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePageSwitch = async (e) => {
        const pageId = e.target.value;
        setStatus('Đang chuyển Page...');
        try {
            const res = await api.selectPage(pageId);
            setPageName(res.activePage);
            setActivePageId(pageId);
            setStatus(`Đã chuyển sang: ${res.activePage}`);
            setComments([]);
            setInsights(null);
        } catch (err) {
            setStatus('Lỗi khi chuyển Page');
        }
    };

    /**
     * Action Handlers
     */
    const handlePost = async (message, file = null) => {
        try {
            const res = await api.postToPage(message, file);
            setStatus(`Đã đăng bài! ID: ${res.id || res.postId}`);
        } catch (err) {
            setStatus('Đăng bài thất bại');
        }
    };

    const fetchComments = async (postId = null) => {
        setLoadingFeed(true);
        try {
            const res = await api.getComments(postId);
            if (!postId) {
                // res is already the array from our fixed api.js logic
                setComments(res.data || []);
            }
        } catch (err) {
            setStatus('Lỗi khi lấy dữ liệu');
        } finally {
            setLoadingFeed(false);
        }
    };

    const handleAction = async (action, id) => {
        try {
            if (action === 'like') await api.likeComment(id);
            if (action === 'delete') await api.deleteComment(id);
            if (action === 'hide') await api.hideComment(id, true);
            if (action === 'unhide') await api.hideComment(id, false);
            if (action === 'reply') {
                const msg = prompt('Nhập nội dung phản hồi:');
                if (!msg) return;
                await api.replyToComment(id, msg);
            }
            setStatus(`Thao tác ${action} thành công!`);
            fetchComments();
        } catch (err) {
            setStatus(`Lỗi khi ${action}`);
        }
    };

    const handleFetchInsights = async () => {
        try {
            const res = await api.getInsights();
            // Facebook returns insights data wrap
            setInsights(res.data && res.data[0]);
        } catch (err) {
            setStatus('Lỗi lấy Insights');
        }
    };

    const handleSendMessage = async (recipientId, message) => {
        try {
            await api.sendMessengerMessage(recipientId, message);
            setStatus('Đã gửi tin nhắn thành công!');
        } catch (err) {
            setStatus('Lỗi gửi tin nhắn');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="container-900" style={{ marginTop: '100px' }}>
                <StatusAlert status={status} />
                <LoginSection onLogin={handleLogin} />
            </div>
        );
    }

    return (
        <Router>
            <div className="app-layout">
                <Sidebar />
                <main className="main-wrapper">
                    <Header
                        pageName={pageName}
                        pages={pages}
                        activePageId={activePageId}
                        onPageSwitch={handlePageSwitch}
                        isLoggedIn={isLoggedIn}
                        onLogout={handleLogout}
                    />

                    <StatusAlert status={status} />

                    <Routes>
                        <Route path="/" element={
                            <Dashboard insights={insights} onFetchInsights={handleFetchInsights} />
                        } />
                        <Route path="/posts" element={
                            <PostPage pageName={pageName} onPost={handlePost} />
                        } />
                        <Route path="/feed" element={
                            <FeedPage comments={comments} onAction={handleAction} onRefresh={() => fetchComments()} loading={loadingFeed} />
                        } />
                        <Route path="/messenger" element={
                            <MessengerPage onSendMessage={handleSendMessage} activePageId={activePageId} />
                        } />
                        <Route path="/ai-comments" element={
                            <AiCommentPage />
                        } />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
