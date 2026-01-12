import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import UserService from '../services/userService';


const useAuth = () => {
    const [ cookies ] = useCookies(["token"]);
    const [ user, setUser ] = useState(null);
    const [ isLoaded, setLoaded ] = useState(false);

    const navigate = useNavigate();

    
    useEffect(() => {
        const fetchUserData = async () => {

            const service = new UserService(cookies.token);

            if (!cookies.token) {
                navigate("/login", { state: { infoMessage: "You need to log in first" } });
                setLoaded(true);
                return;
            }

            try {
                const fetchedUser = await service.getAccountData();
                setUser(fetchedUser);

            } catch (err) {
                console.log(err);

            } finally {
                setLoaded(true);
            }
            
        }

        fetchUserData();

    }, [cookies.token, navigate]);

    return { user, isLoaded };
}


export default useAuth;
