import React from 'react';
import PostCreator from '../components/PageManager/PostCreator';

const PostPage = ({ pageName, onPost }) => {
    return (
        <div className="page-content">
            <h2 style={{ marginBottom: '24px' }}>Soạn thảo bài viết</h2>
            <div style={{ maxWidth: '600px' }}>
                <PostCreator 
                    pageName={pageName} 
                    onPost={onPost} 
                />
            </div>
        </div>
    );
};

export default PostPage;
