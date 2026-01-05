import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import '../App.css';
import './Header.css';

// import UserService from '../services/userService';


const Header = () => {
    
    const [username, setUsername] = useState("");
    
    useEffect(() => {
        document.body.classList.add("light");
        setUsername("Name Surname");
    }, []);
    
    return (
        <>
            <header className='header navbar fixed-top border-bottom justify-content-center'>
                <div>
                    <nav className='navbar'>
                        <div>
                            <ul>{username}</ul>
                        </div>
                    </nav>
                </div>
            </header>
    
            <Outlet />
    
        </>
    );
}


export default Header;
