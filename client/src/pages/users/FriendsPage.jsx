import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import { useAuth } from '@context/AuthContext';
import UserService from '@services/userService';

import '@styles/App.css';
import './Users.css';


const FriendsPage = () => {

    const [ cookies ] = useCookies(["token"]);
    const params = useParams();

    const [ friends, setFriends ] = useState([]);
    const [ friendsLoaded, setFriendsLoaded ] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        const loadFriends = async (userId) => {
            const service = new UserService(cookies.token);

            try {
                let profile;

                if (userId) {
                    profile = await service.getUser(userId);
                } else {
                    profile = await service.getAccountData();
                }

                document.title = `${profile.firstName}'s friends`;

                setFriends(profile.friends);
                setFriendsLoaded(true);

            } catch (err) {
                console.error(err);
            }
        }

        loadFriends(params.userId);

    }, [cookies.token, params.userId, user._id]);

    return (
        <main>
            <div>
                {friendsLoaded && 
                    <div>
                        {friends.map(friend => (
                            <div key={friend.user._id}>
                                <Link to={`/users/${friend.user._id}`}>
                                    {friend.user.firstName} {friend.user.lastName}
                                </Link>
                                <span> - {friend.status}</span>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </main>
    );
}


export default FriendsPage;
