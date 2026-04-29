import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

// import { useAuth } from '@context/AuthContext';
import UserService from '@services/userService';
import getImageUrl from '@utils/getImageUrl';

import '@styles/Users.css';

import avatarPlaceholder from '@assets/images/avatar-placeholder.jpg';
import LastActive from '@components/LastActive';
import SearchIcon from '@assets/icons/SearchIcon';


const SearchUsersPage = () => {

    const [ cookies ] = useCookies(["token"]);

    // const { user } = useAuth();

    const [ query, setQuery ] = useState({});

    const [ users, setUsers ] = useState(null);
    const [ usersLoaded, setUsersLoaded ] = useState(true);

    const queryFields = {
        firstName: 'First name',
        lastName: 'Last name',
        country: 'Country',
        city: 'City'
    }

    useEffect(() => {
        document.title = 'Search users';
    }, []);

    const handleSearchChange = (field, value) => {
        setQuery(prev => {
            const newQuery = { ...prev };
            
            if (value) {
                newQuery[field] = value;

            } else {
                delete newQuery[field];
            }

            return newQuery;
        });
    }

    const search = async (event) => {
        event.preventDefault();

        if (Object.entries(query).length === 0) return setUsers(null);

        setUsersLoaded(false);

        const service = new UserService(cookies.token);

        try {
            const result = await service.searchUsers(query);
            setUsers(result);

        } catch (err) {
            console.error(err);

        } finally {
            setUsersLoaded(true);
        }
    }

    return (
        <main>
            <div className='main-friendspage-container'>
                <form className='friendspage-header' onSubmit={search} style={{ height: 'auto', alignItems: 'space-between', padding: '25px 0 25px 15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '80%' }}>
                        {Object.entries(queryFields).map(([field, placeholder]) => (
                            <input
                                key={field}
                                className='form-control'
                                type='text'
                                placeholder={placeholder}
                                onChange={event => handleSearchChange(field, event.target.value)}
                            />
                        ))}
                    </div>
                    <button type='submit' style={{ fontSize: '15px' }} className='btn'><SearchIcon /> Search</button>
                </form>

                {usersLoaded ?
                    <>
                        {!users ?
                            <span className='search-hint'>Enter search parameters to find users</span> :
                            <>
                                {users.length > 0 ?
                                    <ul className='friends-list'>
                                        {users.map(usr => (
                                            <li key={usr._id} style={{ gap: '20px', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '15px' }} >
                                                <Link to={`/users/${usr._id}`}>
                                                    <img
                                                        alt={usr._id}
                                                        src={getImageUrl(usr.profilePicture?.path) || avatarPlaceholder}
                                                        className='friend-avatar'
                                                    />
                                                </Link>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }} className='friend-info'>
                                                    <Link to={`/users/${usr._id}`}>
                                                        {usr.firstName} {usr.lastName}
                                                    </Link>

                                                    {usr.country &&
                                                        <span style={{ fontSize: '14px', color: 'var(--bs-gray-700)' }}>
                                                            {usr.city ?
                                                                `${usr.country}, ${usr.city}` :
                                                                `${usr.country}`
                                                            }
                                                        </span>
                                                    }

                                                    <LastActive lastActive={usr.lastActive} />
                                                </div>
                                            </li>
                                        ))}
                                    </ul> :
                                    <span className='search-hint'>No users matching your query</span>
                                }
                            </>
                        }
                    </> :
                    <span className='loader' style={{ 
                        position: 'relative',
                        left: '50%',
                        top: '40px',
                        width: '28px',
                        height: '28px',
                        borderWidth: '3px'
                    }} />
                }
            </div>
        </main>
    );
}


export default SearchUsersPage;
