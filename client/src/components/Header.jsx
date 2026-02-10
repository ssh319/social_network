import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useAuth } from '@context/AuthContext';

import '@styles/App.css';
import '@styles/Header.css';

import testAvatar from '@assets/images/test-avatar.jpg';
import LogoIcon from '@assets/icons/LogoIcon';
import SettingsIcon from '@assets/icons/SettingsIcon';
import LogoutIcon from '@assets/icons/LogoutIcon';
import ChevronDownIcon from '@assets/icons/ChevronDownIcon';
import ChatsIcon from '@assets/icons/ChatsIcon';
import PhotoIcon from '@assets/icons/PhotoIcon';
import UserIcon from '@assets/icons/UserIcon';
import ListIcon from '@assets/icons/ListIcon';


const Header = () => {
    const { loadUser, user, isLoaded, logout } = useAuth();

    const [ dropdownActive, setDropdownActive ] = useState(false);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    useEffect(() => {
        if (!isLoaded) return;

        const dropdown = document.getElementById("dropdown");
        
        if (!dropdownActive) {
            dropdown.classList.remove("show");
            return;
        }

        const handleClick = (e) => {
            if (!dropdown.contains(e.target)) {
                setDropdownActive(false);
            }
        }

        dropdown.classList.add("show");

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        }

    }, [dropdownActive, isLoaded]);
    
    const toggleDropdown = (event) => {
        event.stopPropagation();

        setDropdownActive(!dropdownActive);
    }
    
    return (
        <>
            <header className='header fixed-top'>
                <Link to='/' className='logo'>
                    <LogoIcon />
                </Link>
                <div className='header-navbar'>
                    <ul className='header-navbar-links'>
                        <li>
                            <Link to='/'><ListIcon color='var(--bs-gray-600)' /></Link>
                            <span className='tooltip'>Feed</span>
                        </li>
                        <li>
                            <Link to='/users/friends'><UserIcon color='var(--bs-gray-600)' /></Link>
                            <span className='tooltip'>Friends</span>
                        </li>
                        <li>
                            <Link to='/chats'><ChatsIcon color='var(--bs-gray-600)' /></Link>
                            <span className='tooltip'>Chats</span>
                        </li>
                        <li>
                            <Link to='/images'><PhotoIcon color='var(--bs-gray-600)' /></Link>
                            <span className='tooltip'>Images</span>
                        </li>
                    </ul>
                    
                    {isLoaded ?
                        <>
                            <div className='dropdown-button' onClick={toggleDropdown}>
                                <img
                                    className='header-avatar'
                                    alt={`${user.firstName} ${user.lastName}`}
                                    src={testAvatar}
                                />
                                <ChevronDownIcon style={{ position: 'relative', top: '1px' }} />
                            </div>

                            <div id='dropdown' className='dropdown'>
                                <div className='dropdown-header'>
                                    <img
                                        style={{ borderRadius: '50%', margin: '0 auto' }}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        height='48'
                                        width='48'
                                        src={testAvatar}
                                    />
                                    <span style={{ color: 'var(--bs-body-color)', margin: '10px auto' }}>
                                        {user.firstName} {user.lastName}
                                    </span>
                                    <Link to={`/users/${user._id}`}>
                                        <button type='button' className='btn btn-outline-primary dropdown-profile-btn'>
                                            View profile
                                        </button>
                                    </Link>
                                </div>

                                <Link to='/account' style={{ display: 'flex', alignItems: 'center' }}>
                                    <SettingsIcon />
                                    <span style={{ position: 'relative', left: '5px', fontWeight: '400' }}>Manage account</span>
                                </Link>

                                <button type='button' className='logout-btn' onClick={logout}>
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
