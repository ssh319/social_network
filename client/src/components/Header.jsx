import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import 'bootstrap/dist/css/bootstrap.min.css';

import useAuth from '../hooks/useAuth';
// import UserService from '../services/userService';

import '../App.css';
import './Header.css';


const Header = () => {
    const { user, isLoaded } = useAuth();
    
    
    useEffect(() => {
        document.title = "Feed";
    }, []);
    
    return (
        <>
            <header className='header navbar fixed-top border-bottom justify-content-center'>
                <div>
                    <nav className='navbar'>
                        <div>
                            {isLoaded ?
                                <span>{user.firstName} {user.lastName}</span> :
                                <span><ClipLoader size={18}/></span>
                            }
                        </div>
                    </nav> 
                </div>
            </header>
    
            <Outlet />
    
        </>
    );
}


export default Header;
