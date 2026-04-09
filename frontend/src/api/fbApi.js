import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create specialized axios instance
const apiClient = axios.create({
    baseURL: API_URL
});

// Interceptor to auto-add JWT from localStorage to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('fb_jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const loginToBackend = async (shortLivedToken) => {
    const response = await apiClient.post('/auth/facebook', { shortLivedToken });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await apiClient.get('/me');
    return response.data;
};

export const getAllPages = async () => {
    const response = await apiClient.get('/pages');
    return response.data;
};

export const selectPage = async (pageId) => {
    const response = await apiClient.post('/page/select', { pageId });
    return response.data;
};

export const postToPage = async (message, file = null) => {
    if (file) {
        const formData = new FormData();
        formData.append('message', message);
        formData.append('file', file);
        const response = await apiClient.post('/page/post', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } else {
        const response = await apiClient.post('/page/post', { message });
        return response.data;
    }
};

export const getComments = async (postId = null) => {
    const url = postId ? `/page/comments?postId=${postId}` : '/page/comments';
    const response = await apiClient.get(url);
    return response.data;
};

export const getInsights = async () => {
    const response = await apiClient.get('/page/insights');
    return response.data;
};

export const replyToComment = async (commentId, message) => {
    const response = await apiClient.post('/page/comment/reply', { commentId, message });
    return response.data;
};

export const attackComment = async (commentId) => {
    const response = await apiClient.post('/page/comment/like', { commentId });
    return response.data;
};

export const likeComment = async (commentId) => {
    const response = await apiClient.post('/page/comment/like', { commentId });
    return response.data;
};

export const deleteComment = async (commentId) => {
    const response = await apiClient.delete('/page/comment', { data: { commentId } });
    return response.data;
};

export const hideComment = async (commentId, hide = true) => {
    const response = await apiClient.post('/page/comment/hide', { commentId, hide });
    return response.data;
};

export const sendMessengerMessage = async (recipientId, message) => {
    const response = await apiClient.post('/page/message/send', { recipientId, message });
    return response.data;
};

export const getConversations = async () => {
    const response = await apiClient.get('/page/conversations');
    return response.data;
};

export const getConversationMessages = async (conversationId) => {
    const response = await apiClient.get(`/page/conversation/messages?conversationId=${conversationId}`);
    return response.data;
};

// ─── Gemini AI APIs ───────────────────────────────────────────────────────────

export const analyzeComments = async (comments) => {
    const response = await apiClient.post('/ai/analyze-comments', { comments });
    return response.data;
};

export const suggestReply = async (commentText, postContext = '', tone = 'friendly') => {
    const response = await apiClient.post('/ai/suggest-reply', { commentText, postContext, tone });
    return response.data;
};

export const autoAnalyzePage = async () => {
    const response = await apiClient.post('/ai/auto-analyze-page');
    return response.data;
};

// --- CUSTOMER TAGS ---
export const getCustomerTags = async (customerId) => {
    const response = await apiClient.get(`/tags/${customerId}`);
    return response.data;
};

export const addCustomerTag = async (customerId, name, color) => {
    const response = await apiClient.post(`/tags/${customerId}`, { name, color });
    return response.data;
};

export const deleteCustomerTag = async (tagId) => {
    const response = await apiClient.delete(`/tags/${tagId}`);
    return response.data;
};
