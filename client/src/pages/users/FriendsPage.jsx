import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import { useAuth } from '@context/AuthContext';
import FriendService from '@services/friendService';

import './Users.css';


const FriendsPage = () => {

    const [ cookies ] = useCookies(["token"]);
    const params = useParams();
    const navigate = useNavigate();

    const [ friends, setFriends ] = useState([]);
    const [ friendsLoaded, setFriendsLoaded ] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        const loadFriends = async () => {
            const service = new FriendService(cookies.token);

            try {
                const friends = await service.getFriendsList(params.userId);

                // document.title = `${profile.firstName}'s friends`;

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

    }, [cookies.token, params.userId, user._id, navigate]);

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
