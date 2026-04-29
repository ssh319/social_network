import { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useParams, useNavigate } from 'react-router-dom';

import UserService from '@services/userService';
import FriendService from '@services/friendService';
import ChatService from '@services/chatService';
import { useAuth } from '@context/AuthContext';

import Feed from '@components/Feed';
import LastActive from '@components/LastActive';
import getImageUrl from '@utils/getImageUrl';

import '@styles/Users.css';

import avatarPlaceholder from '@assets/images/avatar-placeholder.jpg';

import EditIcon from '@assets/icons/EditIcon';
import UserPlusIcon from '@assets/icons/UserPlusIcon';
import UserMinusIcon from '@assets/icons/UsersMinusIcon';
import ChatsIcon from '@assets/icons/ChatsIcon';
import ChevronDownIcon from '@assets/icons/ChevronDownIcon';


const UserPage = () => {

    const [ cookies ] = useCookies(["token"]);
    const params = useParams();
    const navigate = useNavigate();

    const [ userProfile, setUserProfile ] = useState(null);
    const [ userLoaded, setUserLoaded ] = useState(false);
    const [ friendStatus, setFriendStatus ] = useState(null);
    
    const profileAboutRef = useRef(null);

    const { user } = useAuth();

    const formatDate = (value) => {
        if (!value) return;

        const monthsList = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ]

        const date = new Date(value);
        
        return `${date.getDate()} ${monthsList[date.getMonth()]} ${date.getFullYear()}`
    }

    useEffect(() => {
        const loadProfile = async (userId) => {
            const service = new UserService(cookies.token);

            try {
                let profile = await service.getUser(userId);
                document.title = `${profile.firstName} ${profile.lastName}`;
                
                profile.posts = profile.posts.map(post => {
                    post.user = {
                        _id: post.user,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        profilePicture: profile.profilePicture
                    };

                    return post;
                });

                setUserProfile(profile);
                setUserLoaded(true);

                setFriendStatus(
                    user.friends.find(friend => (
                        friend.user === profile._id
                    ))?.status || null
                );

            } catch (err) {
                if (err.response?.status < 500) {
                    navigate('/not-found');

                } else {
                    console.error(err);
                }
            }
        }

        loadProfile(params.userId);

    }, [cookies.token, params.userId, user._id, user.friends, user.chats, navigate]);

    const addFriend = async () => {
        const service = new FriendService(cookies.token);

        try {
            await service.addFriend(userProfile._id);
            setFriendStatus("sent");

        } catch (err) {
            console.error(err);
        }
    }

    const acceptFriend = async () => {
        const service = new FriendService(cookies.token);

        try {
            await service.acceptFriend(userProfile._id);
            setFriendStatus("friend");

        } catch (err) {
            console.error(err);
        }
    }

    const removeFriend = async () => {
        const service = new FriendService(cookies.token);

        try {
            await service.removeFriend(userProfile._id);
            setFriendStatus(null);

        } catch (err) {
            console.error(err);
        }
    }

    const startChat = async () => {
        try {
            const service = new ChatService(cookies.token);

            const chat = await service.getOrCreateChat(userProfile._id);
            navigate(`/chats/${chat}`);

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <main>
            <div className='main-userpage-container'>
                {userLoaded ?
                    <>
                        <div className='userpage-content-container'>
                            <div className='userpage-account'>
                                <div className='userpage-account-info'>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {userProfile.profilePicture ?
                                            <Link to={`/images/${userProfile.profilePicture._id}`}>
                                                <img
                                                    alt={`${userProfile.firstName} ${userProfile.lastName}`}
                                                    width={108}
                                                    height={108}
                                                    src={getImageUrl(userProfile.profilePicture.path) || avatarPlaceholder}
                                                    style={{ borderRadius: '50%' }}
                                                />
                                            </Link> :

                                            <img
                                                alt={`${userProfile.firstName} ${userProfile.lastName}`}
                                                width={108}
                                                height={108}
                                                src={avatarPlaceholder}
                                                style={{ borderRadius: '50%' }}
                                            />
                                        }

                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '7px',
                                            position: 'relative',
                                            left: '12px'
                                        }}>
                                            <span style={{ fontWeight: '600' }}>{userProfile.firstName} {userProfile.lastName}</span>

                                            <LastActive lastActive={userProfile.lastActive} />
                                        </div>
                                    </div>

                                    {userProfile._id === user._id ?
                                        <Link to='/account'>
                                            <button className='userpage-profile-btn func-btn'><EditIcon /> Edit profile</button>
                                        </Link> :
                                        <div className='userpage-options'>
                                            <button
                                                type='button'
                                                className='userpage-profile-btn func-btn'
                                                onClick={startChat}
                                            >
                                                <ChatsIcon /> Message
                                            </button>
                                            {!friendStatus &&
                                                <button type='button' className='userpage-profile-btn friend-btn' onClick={addFriend}>
                                                    <UserPlusIcon /> Add friend
                                                </button>
                                            }

                                            {friendStatus === 'sent' &&
                                                <button type='button' className='userpage-profile-btn unfriend-btn' onClick={removeFriend}>
                                                    <UserMinusIcon /> Cancel request
                                                </button>
                                            }

                                            {friendStatus === 'received' &&
                                                <>
                                                    <button type='button' className='userpage-profile-btn friend-btn' onClick={acceptFriend}>
                                                        <UserPlusIcon /> Accept request
                                                    </button>

                                                    <button type='button' className='userpage-profile-btn unfriend-btn' onClick={removeFriend}>
                                                        <UserMinusIcon /> Decline request
                                                    </button>
                                                </>
                                            }

                                            {friendStatus === 'friend' &&
                                                <button type='button' className='userpage-profile-btn unfriend-btn' onClick={removeFriend}>
                                                    <UserMinusIcon /> Delete friend
                                                </button>
                                            }

                                        </div>
                                    }
                                </div>
                                <div ref={profileAboutRef} className='userpage-account-more'>
                                    <span><strong>Status:</strong> {userProfile.publicStatus || 'None'}</span>
                                    <div id='userpage-additional-info'>
                                        <span><strong>Country:</strong> {userProfile.country || 'Not specified'}</span>
                                        <span><strong>City:</strong> {userProfile.city || 'Not specified'}</span>
                                        <span><strong>Date of Birth:</strong> {formatDate(userProfile.birthDate) || 'Not specified'}</span>
                                        <span><strong>About:</strong> {userProfile.aboutMe || 'None'}</span>
                                    </div>
                                    <button
                                        type='button'
                                        className='userpage-profile-btn func-btn'
                                        style={{
                                            fontSize: '13px',
                                            position: 'absolute',
                                            bottom: '10px',
                                            transform: 'translateX(-50%)',
                                            left: '50%'
                                        }}
                                        onClick={() => { profileAboutRef.current.classList.toggle('expanded') }}
                                    >Expand <ChevronDownIcon style={{ position: 'relative', bottom: '0.5px' }} />
                                    </button>
                                </div>
                            </div>

                            <div className='userpage-images-mobile'>
                                <div className='userpage-sidebar-header'>
                                    <Link to={`/users/${userProfile._id}/images`}>
                                        <span>Images</span>
                                        <span style={{ color: 'var(--bs-gray-600)', position: 'relative', left: '9px' }}>
                                            {userProfile.images.length}
                                        </span>
                                    </Link>
                                </div>
                                <ul className='userpage-images-list'>
                                    {userProfile.images.map(image => (
                                        <li key={image._id}>
                                            <Link to={`/images/${image._id}`} style={{ all: 'inherit' }}>
                                                <img
                                                    className='userpage-image'
                                                    alt={image._id}
                                                    src={getImageUrl(image.path)}
                                                />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className='userpage-friends-mobile'>
                                <div className='userpage-sidebar-header'>
                                    <Link to={`/users/${userProfile._id}/friends`}>
                                        <span>Friends</span>
                                        <span style={{ color: 'var(--bs-gray-600)', position: 'relative', left: '9px' }}>
                                            {userProfile.friends.length}
                                        </span>
                                    </Link>
                                </div>
                                <ul className='userpage-friends-list'>
                                    {userProfile.friends.map(friend => (
                                        <li key={friend.user._id}>
                                            <Link to={`/users/${friend.user._id}`} style={{ all: 'inherit' }}>
                                                <img
                                                    alt='user'
                                                    src={getImageUrl(friend.user.profilePicture?.path) || avatarPlaceholder}
                                                    width={38}
                                                    height={38}
                                                    style={{ borderRadius: '50%' }}
                                                />
                                                <div className='userpage-friend-name'>
                                                    <span>{friend.user.firstName}</span>
                                                    <span>{friend.user.lastName}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Feed posts={userProfile?.posts} isLoaded={userLoaded} />
                        </div>

                        <div className='userpage-sidebar-container'>
                            <div className='userpage-friends'>
                                <div className='userpage-sidebar-header'>
                                    <Link to={`/users/${userProfile._id}/friends`}>
                                        <span>Friends</span>
                                        <span style={{ color: 'var(--bs-gray-600)', position: 'relative', left: '9px' }}>
                                            {userProfile.friends.length}
                                        </span>
                                    </Link>
                                </div>
                                <ul className='userpage-friends-list'>
                                    {userProfile.friends.slice(0, 6).map(friend => (
                                        <li key={friend.user._id}>
                                            <Link to={`/users/${friend.user._id}`} style={{ all: 'inherit' }}>
                                                <img
                                                    alt='user'
                                                    src={getImageUrl(friend.user.profilePicture?.path) || avatarPlaceholder}
                                                    width={38}
                                                    height={38}
                                                    style={{ borderRadius: '50%' }}
                                                />
                                                <div className='userpage-friend-name'>
                                                    <span>{friend.user.firstName}</span>
                                                    <span>{friend.user.lastName}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className='userpage-images'>
                                <div className='userpage-sidebar-header'>
                                    <Link to={`/users/${userProfile._id}/images`}>Images</Link>
                                    <span style={{ color: 'var(--bs-gray-600)', position: 'relative', left: '9px' }}>
                                        {userProfile.images.length}
                                    </span>
                                </div>
                                <ul className='userpage-images-list'>
                                    {userProfile.images.slice(0, 6).map(img => (
                                        <li key={img._id}>
                                            <Link to={`/images/${img._id}`}>
                                                <img className='userpage-image' alt={img._id} src={getImageUrl(img.path)} />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </> :
                    <span
                        className='loader'
                        style={{
                            width: '32px',
                            height: '32px',
                            borderWidth: '3px',
                            animationDuration: '1.3s',
                            position: 'absolute',
                            left: '50%',
                            top: '50%'
                        }}
                    />
                }
            </div>
        </main>
    );
}


export default UserPage;
