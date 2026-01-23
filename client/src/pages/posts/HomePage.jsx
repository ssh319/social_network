import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
// import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import PostService from '@services/postService';
import { useAuth } from '@context/AuthContext';
import Feed from '@components/Feed';

import './Posts.css';


const HomePage = () => {

    const [ cookies ] = useCookies(["token"]);
    
    const [ feed, setFeed ] = useState([]);
    const [ feedLoaded, setFeedLoaded ] = useState(false);

    const { user } = useAuth();
    
    useEffect(() => {
        document.title = "Feed";
    }, []);
    
    useEffect(() => {
        const fetchPosts = async () => {
            const service = new PostService(cookies.token);

            try {
                const fetchedPosts = await service.getPostsFeed();

                setFeed(fetchedPosts.map((post) => {
                    post.liked = post.likes.includes(user._id);
                    return post;
                }));
                setFeedLoaded(true);

            } catch (err) {
                console.error(err);
            }
        }

        fetchPosts();

    }, [cookies.token, user._id]);

    // const togglePostLike = async (postId, liked) => {
    //     const service = new PostService(cookies.token);
        
    //     setFeed(feed.map((post) => {
    //         if (post._id === postId) {
    //             post.liked = !liked;
                
    //             post.liked ? post.likes.push(user._id) : post.likes = post.likes.filter(id => id !== user._id);
    //         }

    //         return post;
    //     }));

    //     try {
    //         if (!liked) {
    //             await service.likePost(postId);

    //         } else {
    //             await service.unlikePost(postId);
    //         }

    //     } catch (err) {
    //         console.error(err);
    //     }
    // }

    return (
        <main style={{ paddingTop: '' }}>
            <Feed posts={feed} isLoaded={feedLoaded} />
            {/* <div className='feed-container'>
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
                                    <div className='post-content'>{post.text}</div>
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
            </div> */}
        </main>
    );
}


export default HomePage;
