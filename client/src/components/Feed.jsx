import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import PostService from '@services/postService';
import { useAuth } from '@context/AuthContext';

import '@styles/Feed.css';

import testAvatar from '@assets/images/test-avatar.jpg';
import HeartIcon from '@assets/icons/HeartIcon';
import FilledHeartIcon from '@assets/icons/FilledHeartIcon';
import CommentsIcon from '@assets/icons/CommentsIcon';
import TrashIcon from '@assets/icons/TrashIcon';


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

    const deletePost = async (postId) => {
        setFeedLoaded(false);

        const service = new PostService(cookies.token);

        try {
            await service.deletePost(postId);
            setFeed(feed.filter(post => post._id !== postId));
            
        } catch (err) {
            console.error(err);
            
        } finally {
            setFeedLoaded(true);
        }
    }

    return (
        <div className='feed-container'>
            {feedLoaded ?
                <>
                    {feed &&
                        feed.map((post) => (
                            <div key={post._id} className='post-container'>
                                <div className='post-header'>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ padding: '5px' }}>
                                            <Link to={`/users/${post.user._id}`}>
                                                <img className='feed-avatar' alt='test avatar' src={testAvatar} />
                                            </Link>
                                        </div>
                                        <div className='post-info'>
                                            <Link to={`/users/${post.user._id}`} className='post-creator'>
                                                <span>{post.user.firstName} {post.user.lastName}</span>
                                            </Link>
                                            <span className='post-timestamp'>{new Date(post.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {post.user._id === user._id &&
                                        <button
                                            className='trash-icon'
                                            onClick={() => { deletePost(post._id) }}
                                            disabled={!feedLoaded}
                                        >
                                            <TrashIcon />
                                        </button>
                                    }
                                </div>

                                <div className='post-content'>
                                    <Link to={`/posts/${post._id}`}>
                                        <span>{post.text}</span>
                                    </Link>
                                </div>

                                <div className='post-footer'>
                                    <div className='like-button' onClick={() => { togglePostLike(post._id, post.liked) }}>
                                        {post.liked ? <FilledHeartIcon color='var(--bs-red)'/> : <HeartIcon />}
                                        <span style={{ padding: '0 3px' }}>{post.likes.length}</span>
                                    </div>
                                    <div className='comment-button' /* onClick={() => { expandComments(post._id) }} */>
                                        <CommentsIcon />
                                        <span style={{ padding: '0 3px' }}>{post.comments.length}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </> :
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <span
                        className="loader"
                        style={{
                            width: '32px',
                            height: '32px',
                            borderWidth: '3px',
                            animationDuration: '1.3s'
                        }}
                    />
                </div>
            }
        </div>
    );
}


export default Feed;
