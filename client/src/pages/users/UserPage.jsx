import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useParams } from 'react-router-dom';

import UserService from '@services/userService';
import FriendService from '@services/friendService';
import { useAuth } from '@context/AuthContext';

import Feed from '@components/Feed';
import './Users.css';

import testAvatar from '@assets/images/test-avatar.jpg';
import testImage from '@assets/images/test-image.jpg';
import CircleIcon from '@assets/icons/CircleIcon';
import EditIcon from '@assets/icons/EditIcon';
import UserPlusIcon from '@assets/icons/UserPlusIcon';
import UserMinusIcon from '@assets/icons/UsersMinusIcon';


const UserPage = () => {

    const [ cookies ] = useCookies(["token"]);
    const params = useParams();

    const [ userProfile, setUserProfile ] = useState(null);
    const [ userLoaded, setUserLoaded ] = useState(false);
    const [ friendStatus, setFriendStatus ] = useState(null);

    const { user } = useAuth();

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

                    post.liked = post.likes.includes(user._id);

                    return post;
                });

                setUserProfile(profile);
                setUserLoaded(true);

                setFriendStatus(
                    user.friends.find(friend => (
                        friend.user._id === profile._id
                    ))?.status || null
                );

            } catch (err) {
                console.error(err);
            }
        }

        loadProfile(params.userId);

    }, [cookies.token, params.userId, user._id, user.friends]);

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

    return (
        <main>
            <div className='main-userpage-container'>
                {userLoaded ?
                    <>
                        <div className='userpage-content-container'>
                            <div className='userpage-account'>
                                <div className='userpage-account-info'>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <img
                                            alt={`${userProfile.firstName} ${userProfile.lastName}`}
                                            width='108'
                                            height='108'
                                            src={testAvatar}
                                            style={{ borderRadius: '50%' }}
                                        />
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '7px',
                                            position: 'relative',
                                            left: '12px'
                                        }}>
                                            <span style={{ fontWeight: '600' }}>{userProfile.firstName} {userProfile.lastName}</span>

                                            <div style={{ color: 'var(--bs-gray-600)', fontSize: '12px' }}>
                                                {Date.now() - new Date(userProfile.lastActive) > 1000 * 60 * 3 ?
                                                    `Last active: ${new Date(userProfile.lastActive).toLocaleString()}` :
                                                    <span><CircleIcon color='green' /> Online</span>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {userProfile._id === user._id ?
                                        <Link to='/account'>
                                            <div className='userpage-profile-btn func-btn'><EditIcon /></div>
                                        </Link> :
                                        <div>
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
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <button type='button' className='userpage-profile-btn friend-btn' onClick={acceptFriend}>
                                                        <UserPlusIcon /> Accept request
                                                    </button>

                                                    <button type='button' className='userpage-profile-btn unfriend-btn' onClick={removeFriend}>
                                                        <UserMinusIcon /> Decline request
                                                    </button>
                                                </div>
                                            }

                                            {friendStatus === 'friend' &&
                                                <button type='button' className='userpage-profile-btn unfriend-btn' onClick={removeFriend}>
                                                    <UserMinusIcon /> Delete friend
                                                </button>
                                            }
                                            
                                        </div>
                                    }
                                </div>
                                <div className='userpage-account-more'>
                                    <span>info</span>
                                </div>
                            </div>
                            <Feed posts={userProfile?.posts} isLoaded={userLoaded} />
                        </div>

                        <div className='userpage-sidebar-container'>
                            <div className='userpage-friends'>
                                <div className='userpage-sidebar-header'>
                                    <Link
                                        to={user._id !== userProfile._id ?
                                            `/users/${userProfile._id}/friends` :
                                            '/users/friends'
                                        }
                                    >
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
                                                    src={testAvatar}
                                                    width='38'
                                                    height='38'
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
                                </div>
                                <ul className='userpage-images-list'>
                                    {[1, 2, 3, 4, 5, 6].map(img => (
                                        <li key={img}>
                                            <img alt='example' src={testImage} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </> :
                    <span
                        className='loader'
                        style={{ width: '32px', height: '32px', borderWidth: '3px', animationDuration: '1.3s' }}
                    />
                }
            </div>
        </main>
    );
}


export default UserPage;
