import { useEffect, useState, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import { useAuth } from '@context/AuthContext';
import { useSocket } from '@context/SocketContext';
import FriendService from '@services/friendService';
import UserService from '@services/userService';
import getImageUrl from '@utils/getImageUrl';

import '@styles/Header.css';

import avatarPlaceholder from '@assets/images/avatar-placeholder.jpg';

import LogoIcon from '@assets/icons/LogoIcon';
import SettingsIcon from '@assets/icons/SettingsIcon';
import LogoutIcon from '@assets/icons/LogoutIcon';
import ChevronDownIcon from '@assets/icons/ChevronDownIcon';
import ChatsIcon from '@assets/icons/ChatsIcon';
import PhotoIcon from '@assets/icons/PhotoIcon';
import UserIcon from '@assets/icons/UserIcon';
import ListIcon from '@assets/icons/ListIcon';
import BellIcon from '@assets/icons/BellIcon';
import CheckIcon from '@assets/icons/CheckIcon';
import CrossIcon from '@assets/icons/CrossIcon';


const Header = () => {
    const { loadUser, user, isLoaded, logout } = useAuth();
    const { notifications, setNotifications } = useSocket();
    const [ cookies ] = useCookies(["token"]);

    const prevNotificationsRef = useRef(notifications);
    
    const accountDropdownRef = useRef(null);
    const [ accountDropdownActive, setAccountDropdownActive ] = useState(false);
    
    const notifDropdownRef = useRef(null);
    const [ notifDropdownActive, setNotifDropdownActive ] = useState(false);
    
    useEffect(() => {
        loadUser();
    }, [loadUser]);
    
    useEffect(() => {
        if (!isLoaded) return;

        const fetchRequests = async () => {
            const service = new UserService(cookies.token);

            const requests = user.friends.filter(friend => friend.status === 'received');

            try {
                const notifList = await Promise.all(
                    requests.map(async request => {
                        const { _id, firstName, lastName, profilePicture } = await service.getUser(request.user);
                        return (
                            { type: 'request', sender: { _id, firstName, lastName, profilePicture } }
                        );
                    })
                );

                setNotifications(prev => {
                    const filtered = notifList.filter(n => 
                        !prev.some(p =>
                            p.type === n.type &&
                            p.sender._id === n.sender._id
                        )
                    );

                    return prev.concat(filtered);
                });

            } catch (err) {
                console.error(err);
            }
        }

        fetchRequests();

    }, [user, isLoaded, cookies.token, setNotifications, prevNotificationsRef]);

    useEffect(() => {
        if (!isLoaded) return;
        
        if (!accountDropdownActive) {
            accountDropdownRef.current.classList.remove("show");
            return;
        }

        const handleClick = (e) => {
            if (!accountDropdownRef.current.contains(e.target)) {
                setAccountDropdownActive(false);
            }
        }

        accountDropdownRef.current.classList.add("show");

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        }

    }, [accountDropdownActive, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;

        if (!notifDropdownActive) {
            notifDropdownRef.current.classList.remove("show");
            return;
        }

        const handleClick = (e) => {
            if (!notifDropdownRef.current.contains(e.target)) {
                setNotifDropdownActive(false);
            }
        }

        notifDropdownRef.current.classList.add("show");

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        }

    }, [notifDropdownActive, isLoaded]);
    
    const toggleAccountDropdown = (event) => {
        event.stopPropagation();

        setAccountDropdownActive(!accountDropdownActive);
        setNotifDropdownActive(false);
    }

    const toggleNotifDropdown = (event) => {
        event.stopPropagation();

        setNotifDropdownActive(!notifDropdownActive);
        setAccountDropdownActive(false);
    }

    const acceptRequest = async (event, userId) => {
        event.stopPropagation();

        const service = new FriendService(cookies.token);

        try {
            setNotifications(prev => prev.filter(n => n.type !== 'request' || n.sender._id !== userId));
            await service.acceptFriend(userId);

        } catch (err) {
            console.error(err);
        }
    }

    const declineRequest = async (event, userId) => {
        event.stopPropagation();

        const service = new FriendService(cookies.token);

        try {
            setNotifications(prev => prev.filter(n => n.type !== 'request' || n.sender._id !== userId));
            await service.removeFriend(userId);

        } catch (err) {
            console.error(err);
        }
    }
    
    return (
        <>
            <header className='header fixed-top'>
                <Link to='/' className='logo'>
                    <LogoIcon />
                </Link>
                <div className='header-navbar'>
                    {isLoaded ?
                        <>
                            <ul className='header-navbar-links'>
                                <li>
                                    <button onClick={toggleNotifDropdown} type='button' style={{ border: 'none' }}>
                                        <BellIcon color='var(--bs-gray-600)' />
                                        {notifications.length > 0 &&
                                            <span className='notification-number'>{notifications.length}</span>
                                        }
                                    </button>
                                    <span className='tooltip'>Notifications</span>
                                </li>

                                <div id='notifications-dropdown' className='dropdown' ref={notifDropdownRef}>
                                    {notifications.length ?
                                        <ul className='notifications-list'>
                                            {notifications.map((notif, index) => (
                                                <li key={index}>
                                                    {notif.type === 'message' &&
                                                        <>
                                                            <div>
                                                                <img alt='Message sender' src={getImageUrl(notif.sender.profilePicture?.path) || avatarPlaceholder} width={20} height={20} style={{ borderRadius: '50%' }} />
                                                                <span style={{ fontSize: '13px', color: 'var(--bs-gray-600)', position: 'relative', left: '7px' }}>
                                                                    <strong style={{ color: 'var(--bs-body-color)' }}>
                                                                        <Link to={`/users/${notif.sender._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                                            {notif.sender.firstName} {notif.sender.lastName}
                                                                        </Link>
                                                                    </strong> sent you a message:
                                                                </span>
                                                            </div>
                                                            <span style={{ fontSize: '16px' }}>
                                                                <Link to={`/chats/${notif.chat}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                                    {notif.messageText}
                                                                </Link>
                                                            </span>
                                                        </>
                                                    }

                                                    {notif.type === 'request' &&
                                                        <>
                                                            <div>
                                                                <img alt='Request sender' src={getImageUrl(notif.sender.profilePicture?.path) || avatarPlaceholder} width={20} height={20} style={{ borderRadius: '50%' }} />
                                                                <span style={{ position: 'relative', left: '7px' }}>
                                                                    You have new friend request from <Link to={`/users/${notif.sender._id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: '600' }}>{notif.sender.firstName} {notif.sender.lastName}</Link>
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: '', marginTop: '7px' }}>
                                                                <button type='button' onClick={event => { acceptRequest(event, notif.sender._id) }} className='btn btn-outline-success request-btn'>Accept <CheckIcon /></button>
                                                                <button type='button' onClick={event => { declineRequest(event, notif.sender._id) }} className='btn btn-outline-danger request-btn'>Decline <CrossIcon /></button>
                                                            </div>
                                                        </>
                                                    }
                                                </li>
                                            ))}
                                        </ul> :
                                        <span style={{ color: 'var(--bs-gray-500)', margin: '0 auto' }}>
                                            No notifications yet
                                        </span>
                                    }
                                </div>

                                <li>
                                    <Link to='/'><ListIcon color='var(--bs-gray-600)' /></Link>
                                    <span className='tooltip'>Feed</span>
                                </li>
                                <li>
                                    <Link to={`/users/${user._id}/friends`}><UserIcon color='var(--bs-gray-600)' /></Link>
                                    <span className='tooltip'>Friends</span>
                                </li>
                                <li>
                                    <Link to='/chats'><ChatsIcon color='var(--bs-gray-600)' /></Link>
                                    <span className='tooltip'>Chats</span>
                                </li>
                                <li>
                                    <Link to={`/users/${user._id}/images`}><PhotoIcon color='var(--bs-gray-600)' /></Link>
                                    <span className='tooltip'>Images</span>
                                </li>
                            </ul>
                    
                            <div className='dropdown-button' onClick={toggleAccountDropdown}>
                                <img
                                    className='header-avatar'
                                    alt={`${user.firstName} ${user.lastName}`}
                                    src={getImageUrl(user.profilePicture?.path) || avatarPlaceholder}
                                />
                                <ChevronDownIcon style={{ position: 'relative', top: '1px', color: 'var(--bs-gray-600)' }} />
                            </div>

                            <div
                                id='account-dropdown'
                                className='dropdown'
                                ref={accountDropdownRef}
                            >
                                <div className='dropdown-header'>
                                    <img
                                        style={{ borderRadius: '50%', margin: '0 auto' }}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        height={48}
                                        width={48}
                                        src={getImageUrl(user.profilePicture?.path) || avatarPlaceholder}
                                    />
                                    <span style={{ color: 'var(--bs-body-color)', margin: '10px auto' }}>
                                        {user.firstName} {user.lastName}
                                    </span>
                                    <Link to={`/users/${user._id}`} onClick={ () => { setAccountDropdownActive(false) } }>
                                        <button type='button' className='btn btn-outline-primary dropdown-profile-btn'>
                                            View profile
                                        </button>
                                    </Link>
                                </div>

                                <Link
                                    to='/account'
                                    onClick={() => { setAccountDropdownActive(false) }}
                                    style={{ display: 'flex', alignItems: 'center', color: 'var(--bs-gray-600)' }}
                                >
                                    <SettingsIcon />
                                    <span style={{ position: 'relative', left: '5px', fontWeight: '400' }}>Manage account</span>
                                </Link>

                                <button type='button' className='logout-btn' onClick={() => { logout(); setNotifications([]); }}>
                                    <LogoutIcon />
                                    <span style={{ position: 'relative', left: '5px', top: '0.5px' }}>Logout</span>
                                </button>
                            </div>
                        </> :
                        <div className='dropdown-button'>
                            <span className='loader' />
                        </div>
                    }
                </div>
            </header>
    
            <Outlet />
    
        </>
    );
}


export default Header;
