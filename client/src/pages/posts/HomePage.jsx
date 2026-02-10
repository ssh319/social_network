import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import '@styles/App.css';
import './Posts.css';

import PostService from '@services/postService';
import { useAuth } from '@context/AuthContext';

import testAvatar from '@assets/images/test-avatar.jpg';
import Feed from '@components/Feed';
import SpeakerIcon from '@assets/icons/SpeakerIcon';
import PhotoIcon from '@assets/icons/PhotoIcon';
import PlusIcon from '@assets/icons/PlusIcon';
// import CheckIcon from '@assets/icons/CheckIcon';


const HomePage = () => {

    const [ cookies ] = useCookies(["token"]);

    const [ feed, setFeed ] = useState([]);
    const [ feedLoaded, setFeedLoaded ] = useState(false);

    const [ postText, setPostText ] = useState("");
    const maxPostLength = 3000;

    const { user } = useAuth();
    
    useEffect(() => {
        document.title = "Feed";
    }, []);
    
    const fetchPosts = useCallback(async () => {
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
    }, [cookies.token, user._id]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handlePostChange = (event) => {
        setPostText(event.target.value);
    }

    const createPost = async (event) => {
        event.preventDefault();

        const submitPostBtn = document.getElementById('submit-post-btn');
        const postTextarea = document.getElementById('post-textarea');

        submitPostBtn.disabled = true;
        setFeedLoaded(false);
        
        const service = new PostService(cookies.token);
        
        try {
            await service.createPost({ text: postText });

            setPostText("");
            postTextarea.value = "";

            await fetchPosts();
            submitPostBtn.disabled = false;

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <main>
            <div className='main-homepage-container'>
                <nav className='sidenav-container'>
                    <span>?</span>
                </nav>
                <div className='homepage-content-container'>
                    <form onSubmit={createPost}>
                        <div className='posting-form-container'>
                            <div className='post-edit-container'>
                                <Link to={`/users/${user._id}`}>
                                    <img className='post-avatar' alt='author' src={testAvatar} />
                                </Link>
                                <textarea
                                    id='post-textarea'
                                    onChange={handlePostChange}
                                    maxLength={maxPostLength}
                                    className='posting-textarea'
                                    placeholder='Create new post...'
                                    required
                                />
                            </div>
                            <div className='post-panel'>
                                <label htmlFor='post-image-upload' className='image-attachment-btn'>
                                    <input type='file' id='post-image-upload' accept='image/*' hidden />
                                    <PhotoIcon color='var(--bs-gray-600)' />
                                </label>
                                <span className='symbols-counter'>{postText.length} / {maxPostLength}</span>
                                <button id='submit-post-btn' type='submit' className='posting-submit-btn'>
                                    <SpeakerIcon color='white' />
                                </button>
                            </div>
                        </div>
                    </form>
                    <Feed posts={feed} isLoaded={feedLoaded} />
                </div>
                <div className='sidebar-container'>
                    <span className='sidebar-header'>Add new friends</span>
                    <ul className='sidebar-suggestions'> 
                        {/* suggestedUsers.map(user => onClick=() => addFriend(user._id)) */}
                        {[15,12,8,6,24,1].map(i => (
                            <li key={i}>
                                <img alt='user' src={testAvatar} width='32' height='32' style={{ borderRadius: '50%' }} />
                                <div className='suggested-user-info'>
                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>User User</span>
                                    <span style={{ fontSize: '10px', color: 'var(--bs-gray-600)' }}>Mutual friends: {i}</span>
                                </div>
                                <div className='add-user-btn'><PlusIcon /></div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    );
}


export default HomePage;
