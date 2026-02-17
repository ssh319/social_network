import { useCallback, useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';

import './Posts.css';

import PostService from '@services/postService';
import UserService from '@services/userService';
import FriendService from '@services/friendService';
import { useAuth } from '@context/AuthContext';

import testAvatar from '@assets/images/test-avatar.jpg';
import Feed from '@components/Feed';
import SpeakerIcon from '@assets/icons/SpeakerIcon';
import PhotoIcon from '@assets/icons/PhotoIcon';
import PlusIcon from '@assets/icons/PlusIcon';
import CheckIcon from '@assets/icons/CheckIcon';


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
    
            setFeed(fetchedPosts.map(post => {
                post.liked = post.likes.includes(user._id);

                return post;
            }));

            setFeedLoaded(true);
    
        } catch (err) {
            console.error(err);
        }
    }, [cookies.token, user._id]);

    const fetchSuggestedUsers = useCallback(async () => {
        const service = new UserService(cookies.token);

        try {
            const fetchedUsers = await service.getSuggestedUsers();

            setSuggestedUsers(fetchedUsers.map(suggestedUser => {
                suggestedUser.status = user.friends.find(
                    friend => friend.user._id === suggestedUser._id
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

    const addSuggestedFriend = async (suggestion) => {
        const service = new FriendService(cookies.token);

        try {
            if (!suggestion.status) {
                await service.addFriend(suggestion._id);

                setSuggestedUsers(
                    suggestedUsers.map(usr =>
                        usr._id === suggestion._id ?
                        { ...usr, status: "sent" } :
                        usr
                    )
                );

            } else if (suggestion.status === "received") {
                await service.acceptFriend(suggestion._id);

                setSuggestedUsers(
                    suggestedUsers.map(usr => 
                        usr._id === suggestion._id ?
                        { ...usr, status: "friend" } :
                        usr
                    )
                );
            }

        } catch (err) {
            console.error(err);
        }
    }

    const cancelSuggestedFriend = async (suggestion) => {
        const service = new FriendService(cookies.token);

        try {
            await service.removeFriend(suggestion._id);

            setSuggestedUsers(
                suggestedUsers.map(usr =>
                    usr._id === suggestion._id ?
                    { ...usr, status: null } :
                    usr
                )
            );

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
                            src={testAvatar}
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
                                <strong>{user.posts.length}</strong>
                                <span>Posts</span>
                            </p>
                            <p style={{ borderInline: '1px solid var(--bs-gray-400)' }}>
                                <strong>{user.friends.filter(f => f.status === "friend").length}</strong>
                                <span>Friends</span>
                            </p>
                            <p>
                                <strong>{user.images.length}</strong>
                                <span>Photos</span>
                            </p>
                        </div>
                    </div>
                </nav>

                <div className='homepage-content-container'>
                    <form onSubmit={createPost}>
                        <div className='posting-form-container'>
                            <div className='post-edit-container'>
                                <Link to={`/users/${user._id}`}>
                                    <img className='post-avatar' alt='author' src={testAvatar} />
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
                                    <PhotoIcon color='var(--bs-gray-600)' />
                                </label>
                                <span className='chars-counter'>{postText.length} / {MAX_POST_LENGTH}</span>
                                <button type='submit' className='posting-submit-btn' disabled={!feedLoaded}>
                                    <SpeakerIcon color='white' />
                                </button>
                            </div>
                        </div>
                    </form>

                    <Feed posts={feed} isLoaded={feedLoaded} />

                </div>

                <div className='sidebar-container'>
                    <span className='sidebar-header'>People you may know</span>
                    <ul className='sidebar-suggestions'> 
                        {suggestionsLoaded ?
                            <>
                                {suggestedUsers.length ?
                                    <>
                                        {suggestedUsers.slice(0, 6).map(suggestion => (
                                            <li key={suggestion._id}>
                                                <Link to={`/users/${suggestion._id}`}>
                                                    <img
                                                        alt='user'
                                                        src={testAvatar}
                                                        width='32'
                                                        height='32'
                                                        style={{ borderRadius: '50%' }}
                                                    />
                                                </Link>
                                                <div className='suggested-user-info'>
                                                    <Link to={`/users/${suggestion._id}`}>
                                                        <span style={{ fontSize: '13px', fontWeight: '600' }}>
                                                            {suggestion.firstName} {suggestion.lastName}
                                                        </span>
                                                    </Link>
                                                    <span style={{ fontSize: '10px', color: 'var(--bs-gray-600)' }}>
                                                        Mutual friends: {suggestion.mutualFriendsCount}
                                                    </span>
                                                </div>

                                                {(!suggestion.status || suggestion.status === 'received') ?
                                                    <div
                                                        className='add-user-btn'
                                                        onClick={() => { addSuggestedFriend(suggestion) }}
                                                    >
                                                        <PlusIcon />
                                                    </div> :

                                                    <div
                                                        className='add-user-btn checked'
                                                        onClick={() => { cancelSuggestedFriend(suggestion) } }
                                                    >
                                                        <CheckIcon />
                                                    </div>
                                                }
                                            </li>
                                        ))}
                                    </> :
                                    <span style={{
                                        fontSize: '17px',
                                        color: 'var(--bs-gray-500)',
                                        textAlign: 'center',
                                        position: 'relative',
                                        top: '7rem',
                                    }}>
                                        No suggestions yet.
                                        <br />
                                        Try to <Link to='/users/friends/' style={{ color: 'inherit' }}>search new friends</Link>.
                                    </span>
                                }
                            </> :
                            <span className='loader' style={{ margin: '0 auto', position: 'relative', top: '9rem' }} />
                        }
                    </ul>
                </div>
            </div>
        </main>
    );
}


export default HomePage;
