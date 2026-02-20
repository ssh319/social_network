import {
    useState,
    createContext,
    useContext,
    useCallback,
    useMemo
} from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import UserService from '@services/userService';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [ cookies, , removeCookie ] = useCookies(["token"]);
    const [ user, setUser ] = useState(null);
    const [ isLoaded, setLoaded ] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();


    const loadUser = useCallback(async () => {

        const service = new UserService(cookies.token);

        if (!cookies.token) {
            return navigate("/login");
        }

        try {
            const fetchedUser = await service.getAccountData();

            const { _id, firstName, lastName, profilePicture, publicStatus, stats, friends } = fetchedUser;
            setUser({ _id, firstName, lastName, profilePicture, publicStatus, stats, friends });

            setLoaded(true);

        } catch (err) {
            navigate("/error-page", { state: { prevAddress: location.pathname } });
        }
    }, [cookies.token, navigate, location.pathname]);

    const logout = useCallback(() => {
        setUser(null);
        setLoaded(false);

        removeCookie("token", { path: "/" });
        
        navigate("/login", { replace: true });
    }, [removeCookie, navigate]);

    const value = useMemo(() => ({
        loadUser,
        user,
        isLoaded,
        logout
    }), [loadUser, user, isLoaded, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


export const useAuth = () => useContext(AuthContext);
