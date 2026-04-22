import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import { useAuth } from '@context/AuthContext';
import UserService from '@services/userService';
import FriendService from '@services/friendService';
import ChatService from '@services/chatService';
import LastActive from '@components/LastActive';
import getImageUrl from '@utils/getImageUrl';

import './Users.css';

import avatarPlaceholder from '@assets/images/avatar-placeholder.jpg';

import ChatsIcon from '@assets/icons/ChatsIcon';
import UserPlusIcon from '@assets/icons/UserPlusIcon';
import UserMinusIcon from '@assets/icons/UsersMinusIcon';


const FriendsPage = () => {

    const [ cookies ] = useCookies(["token"]);
    const params = useParams();
    const navigate = useNavigate();

    const [ profile, setProfile ] = useState(null);
    const [ profileLoaded, setProfileLoaded ] = useState(false);

    const [ friends, setFriends ] = useState([]);
    const [ friendsLoaded, setFriendsLoaded ] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        const loadProfile = async () => {
            if (params.userId === user._id) {
                setProfile(user);
                setProfileLoaded(true);

                document.title = `${user.firstName}'s friends`;

                return;

            } else {
                const service = new UserService(cookies.token);
                
                try {
                    const { _id, firstName, lastName, profilePicture } = await service.getUser(params.userId);

                    setProfile({ _id, firstName, lastName, profilePicture });
                    setProfileLoaded(true);

                    document.title = `${firstName}'s friends`;

                } catch (err) {
                    if (err.response?.status < 500) {
                        navigate('/not-found');

                    } else {
                        console.error(err);
                    }
                }
            }
        }

        loadProfile();

    }, [cookies.token, navigate, params.userId, user]);

    useEffect(() => {
        if (!profileLoaded) return;

        const loadFriends = async () => {
            const service = new FriendService(cookies.token);

            try {
                const friends = await service.getFriendsList(profile._id);

                setFriends(friends);
                setFriendsLoaded(true);

            } catch (err) {
                if (err.response?.status < 500) {
                    navigate('/not-found');

                } else {
                    console.error(err);
                }
            }
        }

        loadFriends();

    }, [cookies.token, params.userId, profile, navigate, profileLoaded]);

    const acceptFriend = async (userId) => {
        const service = new FriendService(cookies.token);

        try {
            await service.acceptFriend(userId);
            setFriends(prev => prev.map(f => {
                if (f.user._id === userId) {
                    f.status = 'friend';
                }

                return f;
            }))

        } catch (err) {
            console.error(err);
        }
    }

    const removeFriend = async (userId) => {
        const service = new FriendService(cookies.token);

        try {
            await service.removeFriend(userId);
            setFriends(prev => prev.filter(f => f.user._id !== userId));

        } catch (err) {
            console.error(err);
        }
    }

    const startChat = async (userId) => {
        try {
            const service = new ChatService(cookies.token);

            const chat = await service.getOrCreateChat(userId);
            navigate(`/chats/${chat}`);

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <main>
            <div className='main-friendspage-container'>
                {friendsLoaded ?
                    <div>
                        <div className='friendspage-header'>
                            {user._id === profile._id ? 'Your friends' : `${profile.firstName}'s friends`}
                            <span style={{ color: 'var(--bs-gray-600)', fontSize: '19px', fontWeight: '600', marginLeft: '13px' }}>{friends.length}</span>
                        </div>
                        <ul className='friends-list'>
                            {friends.map(friend => (
                                <li key={friend.user._id}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <img alt='Friend avatar' src={getImageUrl(friend.user.profilePicture?.path) || avatarPlaceholder} className='friend-avatar' />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }} className='friend-info'>
                                            <Link to={`/users/${friend.user._id}`}>
                                                {friend.user.firstName} {friend.user.lastName}
                                            </Link>

                                            {friend.user.country &&
                                                <span style={{ fontSize: '14px', color: 'var(--bs-gray-700)' }}>
                                                    {friend.user.city ?
                                                        `${friend.user.country}, ${friend.user.city}` :
                                                        `${friend.user.country}`
                                                    }
                                                </span>
                                            }

                                            <LastActive lastActive={friend.user.lastActive} />
                                        </div>
                                    </div>
                                    {user._id === profile._id &&
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {friend.status === 'friend' && 
                                                <button type='button' className='btn btn-outline-primary friend-func-btn' onClick={() => startChat(friend.user._id)}>
                                                    <span>Message</span> <ChatsIcon />
                                                </button>
                                            }

                                            {friend.status === 'received' &&
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                    <button type='button' className='btn btn-outline-success friend-func-btn' onClick={() => acceptFriend(friend.user._id)}>
                                                        <span>Accept request</span> <UserPlusIcon />
                                                    </button>
                                                    <button type='button' className='btn btn-outline-danger friend-func-btn' onClick={() => removeFriend(friend.user._id)}>
                                                        <span>Decline request</span> <UserMinusIcon />
                                                    </button>
                                                </div>
                                            }

                                            {friend.status === 'sent' &&
                                                <button type='button' className='btn btn-outline-danger friend-func-btn' onClick={() => removeFriend(friend.user._id)}>
                                                    <span>Cancel request</span> <UserMinusIcon />
                                                </button>
                                            }
                                        </div>
                                    }
                                </li>
                            ))}
                        </ul>
                    </div> :
                    <span className='loader' style={{
                        position: 'relative',
                        left: '50%',
                        width: '28px',
                        height: '28px',
                        borderWidth: '3px'
                    }} />
                }
            </div>
        </main>
    );
}


export default FriendsPage;
