import { useCallback, useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';

import '@styles/Posts.css';

import PostService from '@services/postService';
import UserService from '@services/userService';
import getImageUrl from '@utils/getImageUrl';
import { useAuth } from '@context/AuthContext';

import avatarPlaceholder from '@assets/images/avatar-placeholder.jpg';

import Feed from '@components/Feed';
import SpeakerIcon from '@assets/icons/SpeakerIcon';
import PhotoIcon from '@assets/icons/PhotoIcon';
import SuggestedUsers from '@components/SuggestedUsers';


const HomePage = () => {

    const [ cookies ] = useCookies(["token"]);

    const [ feed, setFeed ] = useState([]);
    const [ feedLoaded, setFeedLoaded ] = useState(false);

    const [ postText, setPostText ] = useState("");
    const MAX_POST_LENGTH = 3000;

    const [ suggestedUsers, setSuggestedUsers ] = useState([]);
    const [ suggestionsLoaded, setSuggestionsLoaded ] = useState(false);

    const postTextareaRef = useRef(null);

    const { user } = useAuth();

    useEffect(() => {
        document.title = "Feed";
    }, []);

    const fetchPosts = useCallback(async () => {
        const service = new PostService(cookies.token);
    
        try {
            const fetchedPosts = await service.getPostsFeed();

            setFeed(fetchedPosts);
            setFeedLoaded(true);
    
        } catch (err) {
            console.error(err);
        }
    }, [cookies.token]);

    const fetchSuggestedUsers = useCallback(async () => {
        const service = new UserService(cookies.token);

        try {
            const fetchedUsers = await service.getSuggestedUsers();

            setSuggestedUsers(fetchedUsers.map(suggestedUser => {
                suggestedUser.status = user.friends.find(
                    friend => friend.user === suggestedUser._id
                )?.status || null;

                return suggestedUser;
            }));

            setSuggestionsLoaded(true);

        } catch (err) {
            console.error(err);
        }
    }, [cookies.token, user.friends]);

    useEffect(() => {
        fetchPosts();
        fetchSuggestedUsers();
    }, [fetchPosts, fetchSuggestedUsers]);

    const handlePostChange = (event) => {
        setPostText(event.target.value);
    }

    const createPost = async (event) => {
        event.preventDefault();

        setFeedLoaded(false);
        
        const service = new PostService(cookies.token);
        
        try {
            await service.createPost({ text: postText });

            setPostText("");
            postTextareaRef.current.value = "";

            fetchPosts();

        } catch (err) {
            console.error(err);
        }
    }


    return (
        <main>
            <div className='main-homepage-container'>
                <nav className='sidenav-container'>
                    <div className='sidenav-header'>
                        <img
                            alt={`${user.firstName} ${user.lastName}`}
                            width='64'
                            height='64'
                            src={getImageUrl(user.profilePicture?.path) || avatarPlaceholder}
                            style={{ borderRadius: '50%' }}
                        />

                        <span style={{ fontWeight: '600' }}>{user.firstName} {user.lastName}</span>

                        {user.publicStatus &&
                            <span className='sidenav-public-status'>{user.publicStatus}</span>
                        }

                    </div>

                    <div className='sidenav-content'>
                        <div className='sidenav-summary'>
                            <p>
                                <strong>{user.stats.postsCount}</strong>
                                <span>Posts</span>
                            </p>
                            <p style={{ borderInline: '1px solid var(--border)' }}>
                                <strong>{user.stats.friendsCount}</strong>
                                <span>Friends</span>
                            </p>
                            <p>
                                <strong>{user.stats.imagesCount}</strong>
                                <span>Images</span>
                            </p>
                        </div>
                    </div>
                </nav>

                <div className='homepage-content-container'>
                    <form className='posting-form-container' onSubmit={createPost}>
                        <div className='post-edit-container'>
                            <Link to={`/users/${user._id}`}>
                                <img className='post-avatar' alt='author' src={getImageUrl(user.profilePicture?.path) || avatarPlaceholder} />
                            </Link>
                            <textarea
                                ref={postTextareaRef}
                                onChange={handlePostChange}
                                maxLength={MAX_POST_LENGTH}
                                className='posting-textarea'
                                placeholder='Create new post...'
                                required
                            />
                        </div>
                        <div className='post-panel'>
                            <label htmlFor='post-image-upload' className='image-attachment-btn'>
                                <input type='file' id='post-image-upload' accept='image/*' disabled={!feedLoaded} hidden />
                                <PhotoIcon />
                            </label>
                            <span className='chars-counter'>{postText.length} / {MAX_POST_LENGTH}</span>
                            <button type='submit' className='posting-submit-btn' disabled={!feedLoaded}>
                                <SpeakerIcon color='white' />
                            </button>
                        </div>
                    </form>

                    <div className='sidebar-container-mobile'>
                        <SuggestedUsers users={suggestedUsers} isLoaded={suggestionsLoaded} />
                    </div>

                    <Feed posts={feed} isLoaded={feedLoaded} />

                </div>

                <div className='sidebar-container'>
                    <SuggestedUsers users={suggestedUsers} isLoaded={suggestionsLoaded} />
                </div>
            </div>
        </main>
    );
}


export default HomePage;
