import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import useAuth from '../../hooks/useAuth';


const HomePage = () => {

    const navigate = useNavigate();
    const { user, isLoaded } = useAuth();

    const [ cookies, setCookie ] = useCookies(["token"]);
    
    // const [ posts, setPosts ] = useState([]);
    
    useEffect(() => {
        
    }, []);

    return (
        <main style={{ textAlign: 'center', marginTop: '30px' }}>
            <div>
                <h2>Feed</h2>
            </div>
        </main>
    );
}


export default HomePage;
