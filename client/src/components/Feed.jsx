import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import PostService from '@services/postService';
import { useAuth } from '@context/AuthContext';

import '@styles/App.css';

import testAvatar from '@assets/images/test-avatar.jpg';
import LikeHeart from '@assets/icons/LikeHeart';
import FilledLikeHeart from '@assets/icons/FilledLikeHeart';


const Feed = ({ posts, isLoaded }) => {

    const [ cookies ] = useCookies(["token"]);
    
    const [ feed, setFeed ] = useState(posts);
    const [ feedLoaded, setFeedLoaded ] = useState(isLoaded);

    const { user } = useAuth();

    useEffect(() => {
        setFeed(posts);
        setFeedLoaded(isLoaded);
    }, [posts, isLoaded]);

    const togglePostLike = async (postId, liked) => {

        const service = new PostService(cookies.token);

        setFeed(feed.map((post) => {
            if (post._id === postId) {
                post.liked = !liked;
                
                post.liked ? post.likes.push(user._id) : post.likes = post.likes.filter(id => id !== user._id);
            }

            return post;
        }));

        try {
            if (!liked) {
                await service.likePost(postId);

            } else {
                await service.unlikePost(postId);
            }

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className='feed-container'>
            {feedLoaded ?
                <div>
                    {feed &&
                        feed.map((post) => (
                            <div key={post._id} className='post-container'>
                                <div className='post-header'>
                                    <div style={{ padding: '5px' }}>
                                        <Link to={`/users/${post.user._id}`}>
                                            <img className='avatar' alt="test avatar" width="40" height="40" src={testAvatar} />
                                        </Link>
                                    </div>
                                    <div className='post-info'>
                                        <Link to={`/users/${post.user._id}`} className='post-creator'>
                                            <span>{post.user.firstName} {post.user.lastName}</span>
                                        </Link>
                                        <span className='post-timestamp'>{new Date(post.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className='post-content'>
                                    <Link to={`/posts/${post._id}`} style={{ all: 'unset', cursor: 'pointer' }}>
                                        {post.text}
                                    </Link>
                                </div>
                                <div className='post-footer'>
                                    <div className='like-button' onClick={() => { togglePostLike(post._id, post.liked); }}>
                                        {post.liked ? <FilledLikeHeart color='var(--bs-red)'/> : <LikeHeart />}
                                        <span style={{ padding: '0 3px' }}>{post.likes.length}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div> :
                <span className="loader" />
            }
        </div>
    );
}


export default Feed;
