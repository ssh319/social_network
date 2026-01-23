import { Navigate } from 'react-router-dom';

import { useAuth } from '@context/AuthContext';


const ProtectedRoute = ({ children }) => {
    const { user, isLoaded } = useAuth();

    if (!isLoaded) {
        return null;
    }

    return !user ? <Navigate to='/login' replace /> : children;
}


export default ProtectedRoute;
