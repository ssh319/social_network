import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useAuth } from '@context/AuthContext';

import '@styles/App.css';
import './Header.css';
import testAvatar from '@assets/images/test-avatar.jpg';


const Header = () => {
    const { loadUser, user, isLoaded, logout } = useAuth();

    useEffect(() => {
        loadUser();
    }, [loadUser]);
    
    return (
        <>
            <header className='header navbar fixed-top border-bottom'>
                <div>
                    <nav className='navbar'>
                        <div style={{ display: 'flex' }}>
                            {isLoaded ?
                                <div>
                                    <img alt='usr avatar' height='30' width='30' src={testAvatar} style={{ borderRadius: '50%' }}/>
                                    <span>{user.firstName} {user.lastName}</span>
                                </div> :
                                <span className='loader' />
                            }
                        </div>
                        <div style={{ display: 'flex' }}>
                            <button type='button' className='btn btn-outline-danger btn-sm' onClick={logout}>
                                Logout
                            </button>
                        </div>
                    </nav>
                </div>
            </header>
    
            <Outlet />
    
        </>
    );
}


export default Header;
