import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useParams } from 'react-router-dom';

import UserService from '@services/userService';
import FriendService from '@services/friendService';
import { useAuth } from '@context/AuthContext';

import Feed from '@components/Feed';
import '@styles/App.css';
import './Users.css';

import testAvatar from '@assets/images/test-avatar.jpg';


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
                    post.user = profile;
                    post.liked = post.likes.includes(user._id);

                    return post;
                }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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
                    <div className='profile-container'>
                        {userProfile._id === user._id &&
                            <div>
                                <Link to='/account'>Manage</Link>
                            </div>
                        }

                        {userProfile._id !== user._id &&
                            <div>
                                {!friendStatus &&
                                    <button type='button' className='btn btn-outline-primary' onClick={addFriend}>Add friend</button>
                                }
                                {friendStatus === 'sent' &&
                                    <button type='button' className='btn btn-outline-danger' onClick={removeFriend}>Cancel request</button>
                                }
                                {friendStatus === 'received' &&
                                    <>
                                        <button type='button' className='btn btn-outline-success' onClick={acceptFriend}>Accept request</button>
                                        <button type='button' className='btn btn-outline-danger' onClick={removeFriend}>Decline request</button>
                                    </>
                                }
                                {friendStatus === 'friend' &&
                                    <button type='button' className='btn btn-outline-danger' onClick={removeFriend}>Delete friend</button>
                                }
                            </div>
                        }

                        <span>{userProfile.firstName} {userProfile.lastName}</span>
                        {user._id !== userProfile._id ?
                            <Link to={`/users/${userProfile._id}/friends`}>Friends</Link> :
                            <Link to='/users/friends'>Friends</Link>
                        }
                        <img alt={`${userProfile.firstName} ${userProfile.lastName}`} width="130" height="130" src={testAvatar} />
                        <span>Last active: {new Date(userProfile.lastActive).toLocaleString()}</span>
                    </div> :
                    <span className='loader' />
                }
                <Feed posts={userProfile?.posts} isLoaded={userLoaded} />
            </div>
        </main>
    );
}


export default UserPage;
