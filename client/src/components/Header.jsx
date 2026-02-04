import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useAuth } from '@context/AuthContext';

import '@styles/App.css';
import '@styles/Header.css';
import testAvatar from '@assets/images/test-avatar.jpg';


const Header = () => {
    const { loadUser, user, isLoaded, logout } = useAuth();

    const [ dropdownActive, setDropdownActive ] = useState(false);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    useEffect(() => {
        if (!isLoaded) return;

        const dropdown = document.getElementById("dropdown");
        const dropdownButton = document.getElementById("dropdownButton");
        
        if (!dropdownActive) {
            dropdown.classList.remove("show");
            return;
        }

        const handleClick = (e) => {
            console.log('handleClick');
    
            if (!dropdown.contains(e.target) || dropdownButton.contains(e.target)) {
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
                <div style={{ position: 'relative', left: '17%' }}>
                    <Link to='/'>Logo</Link>
                </div>
                <ul className='right-bar'>
                    <li><Link to='/'>Feed</Link></li>
                    <li><Link to='/'>Messages</Link></li>
                    <li><Link to='/'>Images</Link></li>
                    <li>
                        {isLoaded ?
                            <img
                                id='dropdownButton'
                                className='avatar'
                                alt={`${user.firstName} ${user.lastName}`}
                                height='30'
                                width='30'
                                src={testAvatar}
                                onClick={toggleDropdown}
                            /> :
                            <span className='loader' />
                        }
                    </li>
                </ul>
            </header>

            {isLoaded &&
                <div id='dropdown' className='dropdown'>
                    <Link to={`/users/${user._id}`} className='dropdown-element'>
                        <span>{user.firstName} {user.lastName}</span>
                    </Link>
                    <Link to='/account' className='dropdown-element'>
                        <span>Manage account</span>
                    </Link>
                    <button type='button' className='logout-btn dropdown-element' onClick={logout}>Logout</button>
                </div>
            }
    
            <Outlet />
    
        </>
    );
}


export default Header;
