import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import PostService from '@services/postService';
import { useAuth } from '@context/AuthContext';
import getImageUrl from '@utils/getImageUrl';

import '@styles/Posts.css';
import '@styles/Feed.css';

import avatarPlaceholder from '@assets/images/avatar-placeholder.jpg';
import TrashIcon from '@assets/icons/TrashIcon';
import HeartIcon from '@assets/icons/HeartIcon';
import FilledHeartIcon from '@assets/icons/FilledHeartIcon';
import SendIcon from '@assets/icons/SendIcon';


const PostViewing = () => {

    const params = useParams();
    const navigate = useNavigate();
    const [ cookies ] = useCookies(["token"]);

    const [ post, setPost ] = useState(null);
    const [ postLoaded, setPostLoaded ] = useState(false);
    const [ comments, setComments ] = useState([]);
    const [ commentText, setCommentText ] = useState("");

    const { user } = useAuth();

    useEffect(() => {
        const service = new PostService(cookies.token);

        const fetchPost = async (postId) => {
            try {
                const fetchedPost = await service.getPost(postId);
                fetchedPost.liked = fetchedPost.likes.some(like => like._id === user._id);

                setPost(fetchedPost);
                setComments(fetchedPost.comments.map(comment => {
                    comment.liked = comment.likes.some(like => like === user._id);
                    
                    return comment;
                }));

                setPostLoaded(true);
    
            } catch (err) {
                if (err.response?.status < 500) {
                    navigate('/not-found');
                } else {
                    console.error(err);
                }
            }
        }

        fetchPost(params.postId);
        
    }, [cookies.token, params.postId, navigate, user._id]);

    useEffect(() => {
        if (!post) return;

        document.title = `${post.user.firstName} ${post.user.lastName}'s post`;
    }, [post]);

    const deletePost = async () => {
        const service = new PostService(cookies.token);

        try {
            await service.deletePost(post._id);
            navigate('/');
            
        } catch (err) {
            console.error(err);
        }
    }

    const togglePostLike = async (liked) => {
        setPost(prev => ({
            ...prev,
            liked: !liked,
            likes: liked ? prev.likes.filter(like => like._id !== user._id) : prev.likes.concat(user)
        }));

        const service = new PostService(cookies.token);
        
        try {
            if (!liked) {
                await service.likePost(post._id);

            } else {
                await service.unlikePost(post._id);
            }

        } catch (err) {
            console.error(err);
        }
    }

    const handleCommentChange = (event) => {
        setCommentText(event.target.value);
    }
    
    const sendComment = async (event) => {
        event.preventDefault();

        setPostLoaded(false);

        const service = new PostService(cookies.token);
        
        try {
            await service.sendPostComment(post._id, { text: commentText });

            const updatedPost = await service.getPost(post._id);
            setComments(updatedPost.comments.map(comment => {
                comment.liked = comment.likes.some(like => like === user._id);
                
                return comment;
            }));

        } catch (err) {
            console.error(err);

        } finally {
            setPostLoaded(true);
        }
    }

    const deleteComment = async (commentId) => {

        setPostLoaded(false);

        const service = new PostService(cookies.token);

        try {
            await service.deletePostComment(post._id, commentId);

            const updatedPost = await service.getPost(post._id);
            setComments(updatedPost.comments.map(comment => {
                comment.liked = comment.likes.some(like => like === user._id);
                
                return comment;
            }));

        } catch (err) {
            console.error(err);

        } finally {
            setPostLoaded(true);
        }
    }
    
    const toggleCommentLike = async (commentId, liked) => {
        setComments(comments.map(comment => {
            if (comment._id === commentId) {
                comment.liked = !liked;

                comment.liked ? comment.likes.push(user._id) : comment.likes = comment.likes.filter(id => id !== user._id);
            }

            return comment;
        }));


        const service = new PostService(cookies.token);

        try {
            if (!liked) {
                await service.likePostComment(post._id, commentId);

            } else {
                await service.unlikePostComment(post._id, commentId);
            }

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <main>
            {postLoaded ? 
                <div className='main-postview-container'>
                    {post &&
                        <div className='postview-content-container'>
                            <div className='post-container'>
                                <div className='post-header'>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ padding: '5px' }}>
                                            <Link to={`/users/${post.user._id}`}>
                                                <img
                                                    className='feed-avatar'
                                                    alt='test avatar'
                                                    src={getImageUrl(post.user.profilePicture?.path) || avatarPlaceholder}
                                                />
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
                                        <button className='trash-icon' onClick={deletePost}>
                                            <TrashIcon />
                                        </button>
                                    }
                                </div>

                                <div className='post-content'>
                                    <span>{post.text}</span>
                                </div>

                                <div className='post-footer'>
                                    <div className='like-button' onClick={() => { togglePostLike(post.liked) }}>
                                        {post.liked ? <FilledHeartIcon color='var(--bs-red)'/> : <HeartIcon />}
                                        <span style={{ padding: '0 3px' }}>{post.likes.length}</span>
                                    </div>
                                </div>
                            </div>
                            <div className='postview-comments-container'>
                                <div className='postview-comments-header'>
                                    Comments <span style={{ color: 'var(--bs-gray-600)', marginLeft: '4px' }}>{comments.length}</span>
                                </div>

                                <form className='postview-newcomment-form' onSubmit={sendComment}>
                                    <img
                                        className='post-avatar'
                                        style={{ cursor: 'default', flexShrink: '0' }}
                                        alt='me'
                                        src={getImageUrl(user.profilePicture?.path) || avatarPlaceholder}
                                    />
                                    <input
                                        onChange={handleCommentChange}
                                        className='form-control'
                                        placeholder='Add new comment...'
                                        required
                                    />
                                    <button type='submit' className='btn btn-primary'>
                                        <SendIcon />
                                    </button>
                                </form>

                                {comments.length !== 0 &&
                                    <ul className='postview-comments'>
                                        {comments.map(comment => (
                                            <li key={comment._id}>

                                                <div className='post-header' style={{ padding: '5px' }}>
                                                    <div style={{ display: 'flex' }}>
                                                        <div style={{ padding: '5px' }}>
                                                            <Link to={`/users/${comment.user._id}`}>
                                                                <img
                                                                    className='feed-avatar'
                                                                    alt='comment author'
                                                                    src={getImageUrl(comment.user.profilePicture?.path) || avatarPlaceholder}
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className='post-info'>
                                                            <Link to={`/users/${comment.user._id}`} className='post-creator'>
                                                                <span>{comment.user.firstName} {comment.user.lastName}</span>
                                                            </Link>
                                                            <span className='post-timestamp'>
                                                                {new Date(comment.timestamp).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {comment.user._id === user._id &&
                                                        <button className='trash-icon' onClick={() => { deleteComment(comment._id) }}>
                                                            <TrashIcon />
                                                        </button>
                                                    }
                                                </div>

                                                <div className='post-content' style={{ padding: '6px 12px' }}>
                                                    <span>{comment.text}</span>
                                                </div>

                                                <div className='post-footer' style={{ paddingBottom: '' }}>
                                                    <div className='like-button' onClick={() => { toggleCommentLike(comment._id, comment.liked) }}>
                                                        {comment.liked ? <FilledHeartIcon color='var(--bs-red)'/> : <HeartIcon />}
                                                        <span style={{ padding: '0 3px' }}>{comment.likes.length}</span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                }
                            </div>
                        </div>
                    }
                </div> :
                <span className='loader' />
            }
        </main>
    );
}


export default PostViewing;
