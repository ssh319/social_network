import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import FriendService from '@services/friendService';
import getImageUrl from '@utils/getImageUrl';

import avatarPlaceholder from '@assets/images/avatar-placeholder.jpg';

import PlusIcon from '@assets/icons/PlusIcon';
import CheckIcon from '@assets/icons/CheckIcon';


const SuggestedUsers = ({ users, isLoaded }) => {

    const [ cookies ] = useCookies(["token"]);

    const [ suggestedUsers, setSuggestedUsers ] = useState([]);
    const [ suggestionsLoaded, setSuggestionsLoaded ] = useState(false);

    useEffect(() => {
        setSuggestedUsers(users);
        setSuggestionsLoaded(isLoaded);
    }, [users, isLoaded]);
    
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
        <>
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
                                                src={getImageUrl(suggestion.profilePicture?.path) || avatarPlaceholder}
                                                width='32'
                                                height='32'
                                                style={{ borderRadius: '50%' }}
                                            />
                                        </Link>
                                        <div className='suggested-user-info'>
                                            <Link to={`/users/${suggestion._id}`}>
                                                <span>{suggestion.firstName}</span>
                                                <span style={{ marginLeft: '4px' }}>{suggestion.lastName}</span>
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
                                position: 'absolute',
                                width: '100%',
                                top: '40%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}>
                                No suggestions yet.
                                <br />
                                Try to <Link to='/users/friends/' style={{ color: 'inherit' }}>search new friends</Link>.
                            </span>
                        }
                    </> :
                    <span className='loader' style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }} />
                }
            </ul>
        </>
    );
}


export default SuggestedUsers;
