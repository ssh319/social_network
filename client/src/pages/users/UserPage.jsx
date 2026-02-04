import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useParams } from 'react-router-dom';

import UserService from '@services/userService';
import { useAuth } from '@context/AuthContext';

import Feed from '@components/Feed';
import '@styles/App.css';
import './Users.css';

import testAvatar from '@assets/images/test-avatar.jpg';


const UserPage = () => {

    useEffect(() => {
        document.title = "User page";
    }, []);

    const [ cookies ] = useCookies(["token"]);
    const params = useParams();

    const [ userProfile, setUserProfile ] = useState(null);
    const [ userLoaded, setUserLoaded ] = useState(false);

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
                })

                setUserProfile(profile);
                setUserLoaded(true);

            } catch (err) {
                console.error(err);
            }
        }

        loadProfile(params.userId);

    }, [cookies.token, params.userId, user._id]);

    return (
        <main>
            {userLoaded ?
                <div>
                    {userProfile._id === user._id &&
                        <div>
                            <Link to='/account' style={{ color: 'inherit' }}>Manage</Link>
                        </div>
                    }
                    <div style={{ display: 'flex', justifyContent: 'left', position: 'absolute' }}>
                        <span>{userProfile.firstName} {userProfile.lastName}</span>
                        <img alt="user avatar" width="130" height="130" src={testAvatar} />
                    </div>
                    <Feed posts={userProfile.posts} isLoaded={userLoaded} />
                </div> :
                <span className='loader' />
            }
        </main>
    );
}


export default UserPage;
